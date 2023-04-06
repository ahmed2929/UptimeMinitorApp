let app =require("express")();
require('dotenv').config();
const  {ConnetToDB} =require("./DB/Server/index")
const SetMiddleWares=require('./Middlewares/index')
const port = process.env.PORT || 3000
const Viewer =require("./DB/Schema/Viewers")
const mongoose =require("mongoose")
//Connect to DB
ConnetToDB();
app=SetMiddleWares(app)
 
// Start the server
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
   
    
})


