let app =require("express")();
require('dotenv').config();
const  {ConnectToDB} =require("./DB/Server/index")
const SetMiddleWares=require('./Middleware/index')
const port = process.env.PORT || 8000

const Viewer =require("./DB/Schema/Viewers")
const mongoose =require("mongoose")
const {sendNotification}=require("./config/SendNotification")
const message =require("./Messages/Notifications/index")
const {RunScript} =require("./add_100_dependent")


//Connect to DB
ConnectToDB();
app=SetMiddleWares(app)
 
// Start the server
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
   
    
})



