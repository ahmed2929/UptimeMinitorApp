const jwt=require('jsonwebtoken')

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

const GenerateRandomHash=async(byte)=>{
    try {
       const bytes=byte||2;
       const buf = crypto.randomBytes(bytes).toString('hex');
            const hashedCode = await bycript.hash(buf,12)
           return hashedCode;


    } catch (error) {
        throw new Error('error generating hasheCode ',error)
    }
  
}



module.exports={
    GenerateToken,
    GenerateRandomHash
}
