const express=require('express');
const bodyParser=require('body-parser');
const path = require('path');
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
const OwnerShip =require("../routes/OwnerShip")
const Share =require("../routes/share")
const {checkApiKeyAndSecret} =require("../utils/Authorization")
const Measurement =require("../routes/MeasurementManagement")
//setup app insights
let appInsights = require("applicationinsights");
appInsights.setup(process.env.AzureAppInsights).start();
// set localization config
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
   // general MiddleWares

   //serve static data
  // app.use(express.static(path.join(__dirname, '../public')));



    app.use(bodyParser.json());
      //Enable cors
     
  
   //HTTP headers
   app.use(helmet());

   app.use(cors());
  //  app.use((req, res, next) => {
  //   res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  //   next();
  // });

//Against brute attack
// const rateLimiter = rateLimit({
//   max: 200,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many request from this IP, please try again in an hour!",
// });

//rate limit
//app.use("/api", rateLimiter);

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

  // protect routes with checkApiKeyAndSecret
 app.use(checkApiKeyAndSecret)
 app.use("/api/v1/admin",Admin);

  
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "Success",
      message: `Welcome to voithy read the docs`,
    });
  });
  app.use("/api/v1/auth", Authorization);
  app.use("/api/v1/general",General);
  app.use("/api/v1/circle",Circle);
  app.use("/api/v1/dose",Doses);
  app.use("/api/v1/medication",Medication);
  app.use("/api/v1/symptom",Symptom)
  app.use("/api/v1/report",Reports)
  app.use("/api/v1/settings",Settings)
  app.use("/api/v1/ownership",OwnerShip)
  app.use("/api/v1/share",Share)
  app.use("/api/v1/measurement",Measurement)
  
  //Handling 404 routes
    app.all("*", (req, res, next) => {
      console.log("path not found")
      console.log(req.originalUrl)
    return res.status(404).json({
      status: "Error 404",
      message: `path not found. Can't find ${req.originalUrl} on this server`,
    });
    });
   


//error handling
app.use((error,req,res,next)=>{
  console.log("internal server error")
  console.log("error:",error)
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