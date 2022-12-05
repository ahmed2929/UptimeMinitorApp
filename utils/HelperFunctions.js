const jwt=require('jsonwebtoken')
const crypto = require('crypto');
const bycript =require('bcrypt')
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

const GenerateRandomCode=async(byte)=>{
    try {
       const bytes=byte||2;
       const buf = crypto.randomBytes(bytes).toString('hex');
           
           return buf;


    } catch (error) {
        throw new Error('error generating hasheCode ',error)
    }
  
}



module.exports={
    GenerateToken,
    GenerateRandomCode
}
