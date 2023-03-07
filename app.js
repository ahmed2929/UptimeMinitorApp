let app =require("express")();
require('dotenv').config();
const  {ConnetToDB} =require("./DB/Server/index")
const SetMiddleWares=require('./Middlewares/index')
const port = process.env.PORT || 4000

//Connect to DB
ConnetToDB();
app=SetMiddleWares(app)
 
// Start the server
app.listen(port,()=>{
    console.log(`server is runnig on port ${port}`)
    
    
})

