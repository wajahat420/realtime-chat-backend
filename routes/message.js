const express = require("express");
const router = express.Router();
const { getUsers } = require('../socket/users')

const User = require("../models/user")
const Message = require("../models/message");
const message = require("../models/message");


router.use('/lastSeen', async(req,res) => {
   const {id, date} = req.body

   const update = await User.findOneAndUpdate(
      {id : id},
      {lastSeen : date}
   )

   res.send(update)
})

router.use('/blockUser', async(req, res) => {
   const {senderID, receiverID, block} = req.body
   let update;

   if(!block){
      update = await User.findOneAndUpdate(
         {id : senderID},
         {$addToSet : {blockUsers : receiverID}
      })
   }else{
      update = await User.findOneAndUpdate(
         {id : senderID},
         {$pull : {blockUsers : receiverID}
      })
   }
     res.send(update)

})

router.use("/getAllChats", async(req,res) => {
   const {id} = req.body

   let users = await User.find({})
   let user = await User.findOne({id : id})
   
   // console.log("USER", user);

   let messages = await Message.find({})

   messages =  messages
               .filter(elem => (elem.user1 === user.id || elem.user2 === user.id))
               .map(elem => {
                  const lastMsg = elem.messages[elem.messages.length-1]

                  const obj = {
                     user : {},
                     messages: lastMsg,
                     seen : elem.seen
                  }

                  if(elem.user1 !== user.id){
                     obj.user = users.find(user => user?.id === elem.user1)
                  }else{
                     obj.user = users.find(user => user?.id === elem.user2)
                  }

                  if(!obj.seen){
                     if (user?.id == lastMsg.senderID) obj.seen = true

                  }
                  return obj
               })

   users.forEach(userObj => {
      find = messages.find(elem => userObj.id === elem.user.id || userObj.id == user.id)
      // console.log("userrr", find);
      if(!find){
         messages.push({user : userObj})
      }
      // messages.push()
   })
   res.send(messages)

})

router.use("/getChat", async(req, res)=> {

   const {receiverID, senderID, type, message} = req.body

   let user = await User.findOne({id : receiverID})

   block = await User.findOne(
      {id : senderID, blockUsers : {$in : receiverID}}
   )
   // console.log("BLOCK", block, block !== null);

   const findChat = await Message.findOne({
      $and : [
         {
            $or : [
               {user1 : receiverID},
               {user2 : receiverID},
            ]
         },
         {
            $or : [
               {user1 : senderID},
               {user2 : senderID},
            ]
         }
      ]
   })

   res.send({findChat, user, block : block !== null})
   // res.send(block)

})

router.use("/seenMsg", async(req,res) => {
   const {receiverID, senderID, type, message} = req.body


   const findChat = await Message.findOneAndUpdate(
      {
         $and : [
            {
               $or : [
                  {user1 : receiverID},
                  {user2 : receiverID},
               ]
            },
            {
               $or : [
                  {user1 : senderID},
                  {user2 : senderID},
               ]
            }
         ]
      },
      {
         seen : true
      }
   )

   res.send(findChat)
})

router.use("/sendMessage", async(req,res) => {
   const {receiverID, senderID, type, message} = req.body
   // console.log("sendMessage", req.body);

   req.io.emit('receiverActiveChat', req.body)

   const findChat = await Message.findOne({
      $and : [
         {
            $or : [
               {user1 : receiverID},
               {user2 : receiverID},
            ]
         },
         {
            $or : [
               {user1 : senderID},
               {user2 : senderID},
            ]
         }
      ]
   })
   console.log("FIND",findChat);
   if(!findChat){
      const entry = new Message({
         user1 : receiverID,
         user2 : senderID,
         seen : false,
         messages : [req.body]
      })

      entry.save()
      .then(response => res.send("new chat created successfully"))
      .catch(err => res.send(err))
   }else{
      const updating = await Message.updateOne(
         {_id : findChat._id},
         {
            $push : {messages : req.body},
            seen : false
         }
      )
      res.send(updating)
   }
   

})

router.use('/sendMessageChecking', async(req,res) => {
   const {receiverID, senderID, type, message, checked} = req.body
   // console.log("checked", checked);
   // req.io.emit('receiverActiveChatResponse', req.body)



   // const values = new Message({
   //    receiverID,
   //    senderID,
   //    type,
   //    message,
   //    // seen
   // })
   
   // // const save = await obj.save()
   // values.save()
   // .then(response => {console.log("sendMessageToDB", response), res.send("saved successfuly"), req.io.emit("showMessage", req.body)})
   // .catch(err => {console.log("err", err), res.send(err)})
   res.send("send")
})

router.use('/sendMessageToDB', async(req,res) => {
   const {receiverID, senderID, type, message, checked} = req.body
   console.log("DB", req.body);
   // req.io.emit("showMessage", req.body)

   // const findChat = await Message.findOne({
   //    $and : [
   //       {
   //          $or : [
   //             {user1 : receiverID},
   //             {user2 : senderID},
   //          ]
   //       },
   //       {
   //          $or : [
   //             {user1 : senderID},
   //             {user2 : receiverID},
   //          ]
   //       }
   //    ]
   // })
   // console.log("FIND", findChat);

   // const values = {
   //    receiverID,
   //    senderID,
   //    type,
   //    message,
   //    time : new Date()
   //    // seen
   // }

   // const values = new Message({
   //    receiverID,
   //    senderID,
   //    type,
   //    message,
   //    // seen
   // })
   
   // // const save = await obj.save()
   // values.save()
   // .then(response => {console.log("sendMessageToDB", response), res.send("saved successfuly"), req.io.emit("showMessage", req.body)})
   // .catch(err => {console.log("err", err), res.send(err)})
})

module.exports = router;
