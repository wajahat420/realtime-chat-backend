const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
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
      },
      token : {
         type : String
      },
      email : {
         type : String
      },
      password : {
         type : String
      }

})

module.exports  = mongoose.model("users",UserSchema)