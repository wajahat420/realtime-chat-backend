const express = require("express");
const router = express.Router();

const User = require("../models/user")
const Message = require("../models/message")

let obj = {
   receiverID : '',
   senderID : '',
   type : '',
   message : ''
}


router.use("/sendMessage", async(req,res) => {
   console.log("sendMessage");
   const {receiverID, senderID, type, message} = req.body
   // obj = {...req.body}
   req.io.emit('receiverActiveChat', {
      receiverID,
      senderID
   })
   res.send("checking")
   // req.io.on('receiverActiveChatResponse', (data) => {
   //    console.log("ABC", data);
   // })
   // res.send(save)
   // console.log("SAVE", save);
})

router.use('/sendMessageChecking', (req,res) => {
   const {receiverID, senderID, type, message, checked} = req.body
   console.log("checked", checked);
   req.io.emit('receiverActiveChatResponse', req.body)
   res.send("send")
})

router.use('/sendMessageToDB', (req,res) => {
   const {receiverID, senderID, type, message, checked} = req.body
   console.log("DB", req.body);
   const values = new Message({
      receiverID,
      senderID,
      type,
      message,
      // seen
   })

   // const save = await obj.save()
   values.save()
   .then(response => {console.log("sendMessageToDB", response), res.send(response)})
   .catch(err => {console.log("err", err), res.send(err)})
})

module.exports = router;
