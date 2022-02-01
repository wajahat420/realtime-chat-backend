const express = require("express");
const router = express.Router();

const User = require("../models/user")
const Message = require("../models/message");
const Notifications = require('../models/notification')

const {getUsers} = require('../socket/users');

router.use('/work', (req,res)=>{
   res.send('WORK')
})


const isUserOnline = (id) => {
   const user = getUsers().filter(elem => elem.userId === id)
   return({type : user.length > 0 ?  'online' : 'offline'})
}

router.use('/getUserStatus', (req,res) => {
   const {id} = req.body

   const user = getUsers().filter(elem => elem.userId === id)
   res.send({type : user.length > 0 ?  'online' : 'offline'})
})

router.use('/getLastSeen', async(req,res) => {
   const { id } = req.body

   const update = await User.findOne(
      {id : id}
   )

   res.send(update)
})

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
   console.log("GET ALL CHATS", req.body)
   const {id} = req.body
   let users = await User.find({})
   let user = await User.findOne({id : id})
   
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
      console.log("USEROBJ",userObj.id, user.id);
      find = messages.find(elem => userObj.id === elem.user.id || userObj.id == user.id)
      console.log("FIND",find);
      if(find == undefined && userObj.id !== user.id){
         messages.push({user : userObj})
      }
   })
   res.send(messages)

})

router.use("/getChat", async(req, res)=> {

   const {receiverID, senderID, type, message} = req.body

   let user = await User.findOne({id : receiverID})

   block = await User.findOne(
      {id : senderID, blockUsers : {$in : receiverID}}
   )

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

})

router.use("/seenMsg", async(req,res) => {
   const {receiverID, senderID, type, message} = req.body

   console.log("BODY", req.body);
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

router.use('/hasReadMsg', (req,res) => {
   const {senderID, isSeen} = req.body

   delete req.body.isSeenReceiver

   req.io.emit(senderID, {
      ...req.body,
      isSeenSender : ''
   })
   res.send(isSeen)
})

router.use("/sendMessage", async(req,res) => {
   const {receiverID, senderID, type, message} = req.body
   

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
   const userStatus = isUserOnline(receiverID)


   if(!findChat){
      const entry = new Message({
         user1 : receiverID,
         user2 : senderID,
         seen : false,
         messages : [req.body]
      })

      entry.save()
      .then(response => {
         saveNotification(req.body)
         .then(response => {
            if(userStatus == 'online'){   
               req.io.emit(receiverID, {
                  ...req.body,
                  isSeenReceiver : ''
               })
      
            }else{
               req.io.emit(receiverID, req.body)
            }
            res.send({
               userStatus
            })
         })
         .catch(err => console.log('NOTI err', err))


      })
      .catch(err => res.send(err))
   }else{
      const updating = await Message.updateOne(
         {_id : findChat._id},
         {
            $push : {messages : req.body},
            seen : false
         }
      )
      saveNotification(req.body)
      .then(response => {
         if(userStatus.type == 'online'){   
            req.io.emit(receiverID, {
               ...req.body,
               isSeenReceiver : ''
            })
   
         }else{
            req.io.emit(receiverID, {
               ...req.body,
               check: userStatus.type
            })
         }
         res.send({
            userStatus
         })
      })
      .catch(err => console.log('NOTI err', err))


   }
   

})

router.use('/getNoti', async(req,res)=>{
   const {id} = req.body

   const data = []

   const noti = await Notifications.find({ receiverID : id }).sort({ time : -1 })
   // const get = await getUsersData(noti)

   noti.forEach(async(elem, index) => {
      const user = await User.findOne({ id : elem.senderID })
      data.push({noti : elem, user})

      if( index == noti.length -1 ){
         res.send(data)
      }
   })
   if(noti.length == 0){   
      res.send([])
   }
   
})

// const getUsersData = (noti) => {
//    const data = []

//    return new Promise(function(resolve, reject){
//       noti.forEach(async(elem) => {
//          const user = await User.findOne({ id : elem.senderID })
//          data.push({noti, user})
//       })
//       resolve(data)
//    })
// }

const saveNotification = (data) => {
   return new Promise(function(resolve, reject){
      const obj = new Notifications(data)
      obj.save()
      .then(res => resolve(res))
      .catch(err => reject(err))
   })

}

module.exports = router;
