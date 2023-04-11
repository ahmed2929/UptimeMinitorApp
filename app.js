let app =require("express")();
require('dotenv').config();
const  {ConnetToDB} =require("./DB/Server/index")
const SetMiddleWares=require('./Middlewares/index')
const port = process.env.PORT || 3000
const Viewer =require("./DB/Schema/Viewers")
const mongoose =require("mongoose")
const {sendNotification}=require("./config/SendNotification")
const message =require("./Messages/Notifications/index")

//Connect to DB
ConnetToDB();
app=SetMiddleWares(app)
 
// Start the server
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
   
    
})
// sendNotification('63f611cc52720e10a0fae03b',message.NewMeasurementAddedByMyDependnet_AR_GCM(),'android')
// .then(()=>{
//     console.log("done")
// }).catch(()=>{
//     console.log("error")
// })