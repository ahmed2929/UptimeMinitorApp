const express=require('express');
const bodyParser=require('body-parser');
const path      = require('path');
var cors = require('cors');
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const Authorization=require('../routes/Authorization')
const General=require('../routes/general')
const i18next =require("i18next")
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
const Admin =require("../routes/admin")
const Circle =require("../routes/circle")
const Doses =require("../routes/doses")
const Medication =require("../routes/medication")
const Symptom =require("../routes/symptom")
const Reports =require("../routes/reports")
const Settings =require("../routes/settings")
// set localiztion config
i18next.use(Backend).use(i18nextMiddleware.LanguageDetector)
.init({
    fallbackLng: 'en',
    preload: ['en', 'ar'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
        loadPath: path.join(__dirname, '../locales/{{lng}}/translation.json'),
    }
})


module.exports=(app)=>{ 
   // general middlewares
    app.use(bodyParser.json());
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
 

//localization
 app.use(i18nextMiddleware.handle(i18next))


// set routes
app.use((req,res,next)=>{
  // log request info and its body data ?
  console.log("request info ",req.method,req.url)
  console.log("request body ",req.body)
  console.log("request params ",req.params)
  console.log("request query ",req.query)
  console.log("request headers ",req.headers)
  

  next();
})
app.get("/", (req, res) => {
    res.status(200).json({
      status: "Success",
      message: `Welcome to voithy read the docs`,
    });
  });

  
  app.use("/api/v1/auth", Authorization);
  app.use("/api/v1/general",General);
  app.use("/api/v1/admin",Admin);
  app.use("/api/v1/circle",Circle);
  app.use("/api/v1/dose",Doses);
  app.use("/api/v1/medication",Medication);
  app.use("/api/v1/symptom",Symptom)
  app.use("/api/v1/report",Reports)
  app.use("/api/v1/settings",Settings)

  



  //Handling unhandle routes
    app.all("*", (req, res, next) => {
    return res.status(404).json({
      status: "Error 404",
      message: `path not found. Can't find ${req.originalUrl} on this server`,
    });
    });
   


//error handle meddlewere
app.use((error,req,res,next)=>{
   const status    = error.statusCode || 500 ;
   const message   = error.message           ;
   const data      = error.data              ;
   if(status===500){
    console.log(error)
   return res.status(status).json({message:"internal server error",data:data});
   }
   res.status(status).json({message:message,data:data});
});


return app;
}