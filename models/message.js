const mongoose = require("mongoose")
const Schema = mongoose.Schema

const date  = new Date()

const UserSchema = new Schema({
      receiverID : {
            type : String,
            required : true
      },
      senderID : {
         type : String,
         required : true,
      },
      type : {
         type : String,
         required: true
      },
      message : {
         type : String,
         required : true
      }

})

module.exports  = mongoose.model("messages",UserSchema)