// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();


exports.validPayment = functions.https.onRequest((req, res) => {

    const identifier = req.query.identifier;

    return admin.database().ref('/payments').child(identifier).set({valid: true}).then((snapshot) => {
    return res.redirect(303, snapshot.ref.toString());
    });

});

exports.unValidPayment = functions.https.onRequest((req, res) => {

    const identifier = req.query.identifier;

    return admin.database().ref('/payments').child(identifier).set({valid: false}).then((snapshot) => {
        return res.redirect(303, snapshot.ref.toString());
    });

});