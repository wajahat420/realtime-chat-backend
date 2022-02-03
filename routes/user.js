const express = require("express");
const router = express.Router();

const User = require("../models/user")

router.use('/login', async(req,res) => {
   const {email, password, token} = req.body

   User.findOneAndUpdate(
      {email, password},
      { token },
      function(err, result){
         res.send(result)
      }
   )
})

module.exports = router;