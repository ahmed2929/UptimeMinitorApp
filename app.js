let app =require("express")();
require('dotenv').config();
const  {ConnetToDB} =require("./DB/Server/index")
const SetMiddleWares=require('./Middlewares/index')
const port = process.env.Port || 4000
// Start the server
app.listen(port,()=>{
    console.log(`server is runnig on port ${port}`)
})

//Connect to DB
ConnetToDB();
app=SetMiddleWares(app)

