const jwt=require('jsonwebtoken')
const crypto = require('crypto');
const User = require('../DB/Schema/User');
const mail =require("../config/MailConfig");
const { match } = require('assert');



// create refresh token

const GenerateRefreshToken=(id)=>{
    try {
        if(!id){
            throw new Error('missing id pramter')
        }
        const token = jwt.sign({
            id
            
          },
            process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
          }
          );
          return token

    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
  
}



// create user token

const GenerateToken=(id)=>{
    try {
        if(!id){
            throw new Error('missing id pramter')
        }
        const token = jwt.sign({
            id
            
          },
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          }
          );
          return token

    } catch (error) {
        throw new Error('error token generation ',error)
    }
  
}

const GenerateRandomCode=async(n)=>{
    try {
      
           
           return Math.floor(Math.random()*9000+1000)


    } catch (error) {
        throw new Error('error generating otp ',error)
    }
  
}


const getUserEmailFromId=async(id)=>{
    const user =await User.findById(id).select('email')
    return user.email;
 }
 
 const SendEmailToUser=async(email,message)=>{
   
    try {
        const mailOptions = {
            from: process.env.EmailSender,
            to: email,
            subject: "auth task",
            html: message,
          };
      
         await mail.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.log(err)
              throw new Error(err)
            } else {
                console.log("email sent")
            
            }
          });
    } catch (error) {
        console.log(error)
    }
    
 }

 

module.exports={
    GenerateToken,
    GenerateRandomCode,
    GenerateRefreshToken,
    getUserEmailFromId,
    SendEmailToUser
}
