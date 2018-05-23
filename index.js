// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();


exports.validPayment = functions.https.onRequest((req, res) => {

    const identifier = req.query.identifier;
    const amount = req.query.amount;
    const payer = req.query.payer;

    const payment = {
        success: true,
        date: new Date().getTime(),
        amount: amount,
        payer: payer,
    };

    return admin.database().ref('/payments/${identifier}').push(payment).then((snapshot) => {
    return res.redirect(303, snapshot.ref.toString());
    });

});

exports.unValidPayment = functions.https.onRequest((req, res) => {

    const identifier = req.query.identifier;
    const amount = req.query.amount;
    const payer = req.query.payer;

    const payment = {
        success: false,
        date: new Date().getTime(),
        amount: amount,
        payer: payer,
    };

    return admin.database().ref('/payments/${identifier}').push(payment).then((snapshot) => {
        return res.redirect(303, snapshot.ref.toString());
    });

});