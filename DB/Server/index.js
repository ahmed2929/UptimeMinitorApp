const mongoose=require('mongoose');

const ConnectString=process.env.DB;

const DBConectionOptions={
    useNewUrlParser: true,
   
}


const ConnetToDB =async()=>{

    try {
        
      const DBConnection= await mongoose.connect(ConnectString,DBConectionOptions)
      console.log("DB connected")
      return DBConnection
    } catch (error) {
        console.log(error)
        throw new Error("DB connection error : ",error)

    }

 
}
const CloseDBConnection=async ()=>{
   await mongoose.connection.close()
    console.log("db closed")

}
module.exports={
    ConnetToDB,
    CloseDBConnection
}