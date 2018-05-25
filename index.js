// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();


exports.validPayment = functions.https.onRequest((req, res) => {

    const identifier = req.query.identifier;
    var amount = req.query.amount;
    const payerId = req.query.payerId;
    const payerName = req.query.payerName;
    const receiverId = req.query.receiverId;
    const receiverName = req.query.receiverName;

    console.log("received amount : " + amount);
    amount = parseFloat(amount).toFixed(2);
    console.log("amount fixed: " + amount);
    const payment = {
        success: true,
        date: new Date().getTime(),
        amount: amount,
        payerId: payerId,
        payerName: payerName,
        receiverId: receiverId,
        receiverName: receiverName,
    };

    return admin.database().ref('/payments').child(identifier).push(payment).then((snapshot) => {

        return admin.database().ref("/users/" + receiverId).once('value').then(snap => {
            const token = snap.child("messaging_token").val();
            console.log("token: ", token);

            //we have everything we need
            //Build the message payload and send the message
            console.log("Construction the notification message.");
            const payload = {
                data: {
                    data_type: "direct_message",
                    title: "Vous avez reçu un nouveau virement !",
                    message: payerName + " vous a fait un virement de " + amount,
                    message_id: payerId + receiverId,
                }
            };

            return admin.messaging().sendToDevice(token, payload)
                .then((response) => {
                    console.log("Successfully sent message:", response);
                    return res.redirect(303, snapshot.ref.toString());
                })
                .catch((error) => {
                    console.log("Error sending message:", error);
                    return res.redirect(303, snapshot.ref.toString());
                });
        });
    });

});

exports.unValidPayment = functions.https.onRequest((req, res) => {

    const identifier = req.query.identifier;

    const amount = req.query.amount;
    const payerId = req.query.payerId;
    const payerName = req.query.payerName;
    const receiverId = req.query.receiverId;
    const receiverName = req.query.receiverName;

    const payment = {
        success: false,
        date: new Date().getTime(),
        amount: amount,
        payerId: payerId,
        payerName: payerName,
        receiverId: receiverId,
        receiverName: receiverName,
    };

    return admin.database().ref('/payments').child(identifier).push(payment).then((snapshot) => {
        return res.redirect(303, snapshot.ref.toString());
    });

});

exports.listeningOnNotifications = functions.database.ref('/notifications/{pushId}')
    .onCreate((snapshot, context) => {
        console.log("A message was written, listeningOnNotificaton");
        // Grab the current value of what was written to the Realtime Database.
        const snap = snapshot.val();

        const {recipient_id, title, message} = snap;
        console.log("recipientId, title, message", recipient_id, title, message);


        return admin.database().ref("/users/" + recipient_id).once('value').then(snap => {
            const token = snap.child("messaging_token").val();
            console.log("token: ", token);

            //we have everything we need
            //Build the message payload and send the message
            console.log("Construction the notification message.");
            const payload = {
                data: {
                    data_type: "direct_message",
                    title: title,
                    message: message,
                    message_id: recipient_id + message,
                }
            };

            return admin.messaging().sendToDevice(token, payload)
                .then((response) => {
                    console.log("Successfully sent message:", response);
                    return res
                        .status(200)
                        .json({
                            message: "successfully sent message",
                            success: true
                        })
                })
                .catch((error) => {
                    console.log("Error sending message:", error);
                    return res
                        .status(303)
                        .json({
                            message: "error",
                            success: false
                        })
                });
        });
    });

exports.sendChatMessage = functions.https.onRequest((req, res) => {

    const current_user_id = req.query.current_user_id;
    const other_user_id = req.query.other_user_id;
    const channel = req.query.channel;

    const {id_loan, id_user_1, id_user_2, last_message, list_messages_id} = JSON.parse(channel);

    const {date, id_sender, text, senderName} = JSON.parse(req.query.message);

    const message = {
        date: date,
        id_sender: id_sender,
        text: text,
        senderName: senderName
    };

    const channelObject = {
        id_loan: id_loan,
        id_user_1: id_user_1,
        id_user_2: id_user_2,
        last_message: last_message,
        list_messages_id: list_messages_id,
    };

    console.log("channel ", channel);
    console.log("channelObject ", channelObject);
    console.log("message: ", message);
    console.log("id_user_1: ", id_user_1);
    console.log("id_user_2: ", id_user_2);
    console.log("current_user_id: ", current_user_id);
    console.log("other_user_id: ", other_user_id);


    return admin.database().ref('/listMessages')
        .child(list_messages_id)
        .push(message).then((snap) => {

            return admin.database().ref('/user-channels')
                .child(current_user_id)
                .child("channels")
                .child(list_messages_id)
                .set(channelObject).then((snapshot) => {

                    return admin.database().ref('/user-channels')
                        .child(other_user_id)
                        .child("channels")
                        .child(list_messages_id)
                        .set(channelObject).then((snapshot) => {


                            return admin.database().ref("/users/" + other_user_id).once('value').then(snap => {
                                const token = snap.child("messaging_token").val();
                                console.log("token: ", token);

                                //we have everything we need
                                //Build the message payload and send the message
                                console.log("Construction the notification message.");
                                const payload = {
                                    data: {
                                        data_type: "direct_message",
                                        title: "Vous avez reçu un nouveau message !",
                                        message: senderName + " : " + text,
                                        message_id: current_user_id + other_user_id,
                                    }
                                };

                                return admin.messaging().sendToDevice(token, payload)
                                    .then((response) => {
                                        console.log("Successfully sent message:", response);
                                        return res
                                            .status(200)
                                            .json({
                                                message: "successfully sent message",
                                                success: true
                                            })
                                    })
                                    .catch((error) => {
                                        console.log("Error sending message:", error);
                                        return res
                                            .status(303)
                                            .json({
                                                message: "error",
                                                success: false
                                            })
                                    });
                            });

                        });
                });

        }).catch((err) => {
            console.log(err);
        });


});








