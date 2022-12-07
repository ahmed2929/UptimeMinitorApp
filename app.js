let app =require("express")();
require('dotenv').config();
const  {ConnetToDB} =require("./DB/Server/index")
const SetMiddleWares=require('./Middlewares/index')
const {RunCheckIntervals}=require("./utils/RunCheckIntervals")
const port = process.env.Port || 4000
// Start the server
app.listen(port,()=>{
    console.log(`server is runnig on port ${port}`)
})

//Connect to DB
ConnetToDB();
app=SetMiddleWares(app)
RunCheckIntervals() // to set the intervals back if the app crashed
