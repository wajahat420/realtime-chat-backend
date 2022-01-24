const mongoose = require("mongoose")
const Schema = mongoose.Schema

const date  = new Date()

const UserSchema = new Schema({
      // email : {
      //       type : String,
      //       required : true
      // },
      name : {
         type : String,
         required : true,
      },
      image : {
         type : String
      },
      id : {
         type : String,
         required : true
      },
      blockUsers : {
         type : Array
      },
      lastSeen : {
         type : String
      }

})

module.exports  = mongoose.model("users",UserSchema)