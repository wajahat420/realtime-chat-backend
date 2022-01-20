const express = require("express");
const router = express.Router();

const User = require("../models/user")
const Message = require("../models/message")

router.post("/sendMessage", async(req,res) => {
   const {receiverID, senderID, type, message} = req.body

   const obj = new Message({
      receiverID,
      senderID,
      type,
      message
   })

   // const save = await obj.save()
   obj.save()
   .then(response => {console.log("res", response), res.send(response)})
   .catch(err => {console.log("err", err), res.send(err)})
   // res.send(save)
   // console.log("SAVE", save);
})

module.exports = router;
