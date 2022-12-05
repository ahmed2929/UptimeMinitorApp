const express=require('express');
const bodyParser=require('body-parser');
const path      = require('path');
var cors = require('cors');
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const Authontication=require('../routes/authontication')


module.exports=(app)=>{ 
   // general middlewares

   //HTTP headers
    app.use(helmet());

    //Enable cors
    app.use(cors());

//Against brute attack
const rateLimiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour!",
});

//rate liniter
app.use("/api", rateLimiter);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: false,
    parameterLimit: 10000,
  })
);

//NoSQL query injection -Data Sanitization
app.use(mongoSanitize());

//xss attack - Data Sanitization
app.use(xss());

//HTTP parament pollution
app.use(hpp());
 
 


// set routes
app.get("/", (req, res) => {
    res.status(200).json({
      status: "Success",
      message: `Welcome to avilabilty motoring app read the docs`,
    });
  });
  
  app.use("/api/v1/auth", Authontication);
  



  //Handling unhandle routes
    app.all("*", (req, res, next) => {
    return res.status(404).json({
      status: "Error 404",
      message: `Page not found. Can't find ${req.originalUrl} on this server`,
    });
    });
   


//error handle meddlewere
app.use((error,req,res,next)=>{
   const status    = error.statusCode || 500 ;
   const message   = error.message           ;
   const data      = error.data              ;
   
   res.status(status).json({message:message,data:data});
});


return app;
}