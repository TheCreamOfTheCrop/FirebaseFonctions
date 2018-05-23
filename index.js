// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.validPayment = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const identifier = req.query.identifier;
// Push the new message into the Realtime Database using the Firebase Admin SDK.
    return admin.database().ref('/payments').child(identifier).set({valid: true}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref.toString());
    });
});

exports.unValidPayment = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const identifier = req.query.identifier;
// Push the new message into the Realtime Database using the Firebase Admin SDK.
return admin.database().ref('/payments').child(identifier).set({valid: false}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref.toString());
});
});