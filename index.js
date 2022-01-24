const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

const app = express();

// running server
const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);

const io = require('socket.io')(server, {
   cors: {
       origin: "http://localhost:3000",
       methods: ["GET", "POST"]
   }
});

const {addUser, removeUser, getUsers} = require("./socket/users")

// Assign socket object to every request
app.use(function (req, res, next) {
   req.io = io;
   next();
});

io.on("connection", (socket) => {
   //when ceonnect
   console.log("a user connected.");
 
   //take userId and socketId from user
   socket.on("addUser", (userId) => {
     addUser(userId, socket.id);
   });
 
   //when disconnect
   socket.on("disconnect", () => {
     console.log("a user disconnected!");
     const user =  removeUser(socket.id);
      // console.log("");
     io.emit("userStatusChange", user);
   });

});



app.use(bodyParser.json({
   limit: '50mb'
}));


app.use(bodyParser.urlencoded({
   limit: '50mb',
   extended: true
}));

app.use(cors());

const db = 'mongodb+srv://wajahat:node123@first.uba9r.mongodb.net/Realtime-Chat?retryWrites=true&w=majority';

mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log(err);
   });

const message = require('./routes/message')

app.use("/", message);
