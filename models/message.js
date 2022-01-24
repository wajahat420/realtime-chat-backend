const mongoose = require("mongoose")
const Schema = mongoose.Schema

const date  = new Date()

const UserSchema = new Schema({
      // receiverID : {
      //       type : String,
      //       required : true
      // },
      // senderID : {
      //    type : String,
      //    required : true,
      // },
      // type : {
      //    type : String,
      //    required: true
      // },
      user1:{
         type : String,
         required : true
      },
      user2:{
         type : String,
         required : true
      },
      seen : {
         type: Boolean,
         required : true
      },
      messages : {
         type : Array,
      }

})

module.exports  = mongoose.model("messages",UserSchema)