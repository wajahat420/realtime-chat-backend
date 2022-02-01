const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
      senderID : {
         type : String,
         required : true,
      },
      receiverID : {
         type : String
      },
      message : {
         type : String,
         required : true
      },
      type : {
         type : String,
         required : true
      },
      time : {
         type : String,
         required : true
      }

})

module.exports  = mongoose.model("notifications",UserSchema)