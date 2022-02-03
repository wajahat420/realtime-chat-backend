var admin = require("firebase-admin");

var serviceAccount = require("./db.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-project-1-5f5ff.firebaseio.com"
})

module.exports.admin = admin