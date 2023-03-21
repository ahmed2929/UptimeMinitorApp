const jwt = require("jsonwebtoken");
const Access = require("../DB/Schema/apiAccess");
const mongoose=require("mongoose")
const User =require("../DB/Schema/User")
const Admin =require("../DB/Schema/Admin")
exports.authorization = () => {
  return (req, res, next) => {
    try {
     
      const token = req.headers.authorization.split(" ")[1];
      
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decodedToken;
      if (!userID) {
        return res.status(401).json({
          error: req.t("Unauthorized"),
          status: "error",
        });
      } else {
        //check if the user is active  const id=
        User.findById(mongoose.Types.ObjectId(userID))
        .then(user=>{
          console.log("promise runs")
          if(!user){
            return res.status(401).json({
              error: req.t("Unauthorized"),
              status: "error",
            });
          }
          req.id=userID
          next();
        })
     
       
      }
    } catch(err) {
      console.log(err)
      res.status(401).json({
        error: req.t("Unauthorized"),
        status: "error",
      });
    }
  };
};

exports.authorizeRefreshToken = () => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const userID = decodedToken;
      
      if (!userID) {
        return res.status(401).json({
          error: req.t("Invalid_Refresh_token"),
          status: "error",
        });
      } else {
        
        User.findById(mongoose.Types.ObjectId(userID))
        .then(user=>{
          console.log("promise runs")
          if(!user){
            return res.status(401).json({
              error: req.t("Unauthorized"),
              status: "error",
            });
          }
          req.id=userID
          next();
        })
      }
    } catch {
      res.status(401).json({
        error: req.t("Invalid_Refresh_token"),
        status: "error",
      });
    }
  };
};


// admin

exports.authorizationAdmin = () => {
  return (req, res, next) => {
    try {
     
      const token = req.headers.authorization.split(" ")[1];
      
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decodedToken;
      if (!userID) {
        return res.status(401).json({
          error: req.t("Unauthorized"),
          status: "error",
        });
      } else {
        //check if the user is active  const id=
        Admin.findById(mongoose.Types.ObjectId(userID))
        .then(user=>{
          console.log("promise runs")
          if(!user){
            return res.status(401).json({
              error: req.t("Unauthorized"),
              status: "error",
            });
          }
          req.id=userID
          next();
        })
     
       
      }
    } catch(err) {
      console.log(err)
      res.status(401).json({
        error: req.t("Unauthorized"),
        status: "error",
      });
    }
  };
};

exports.authorizeRefreshTokenAdmin = () => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const userID = decodedToken;
      
      if (!userID) {
        return res.status(401).json({
          error: req.t("Invalid_Refresh_token"),
          status: "error",
        });
      } else {
        
        Admin.findById(mongoose.Types.ObjectId(userID))
        .then(user=>{
          console.log("promise runs")
          if(!user){
            return res.status(401).json({
              error: req.t("Unauthorized"),
              status: "error",
            });
          }
          req.id=userID
          next();
        })
      }
    } catch {
      res.status(401).json({
        error: req.t("Invalid_Refresh_token"),
        status: "error",
      });
    }
  };
};





exports.checkApiKeyAndSecret=(req, res, next)=>{
  const apiKey = req.get('X-API-KEY');
  const apiSecret = req.get('X-API-SECRET');

  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      error: req.t("API key and secret required"),
      status: "error",
    });
  }

  // check if api key is valid mongo id
  if (!mongoose.Types.ObjectId.isValid(apiKey)) {
    return res.status(401).json({
      error: req.t("Invalid API key"),
      status: "error",
    });
  }

  Access.findOne({ _id: apiKey, Secret: apiSecret ,IsActive:true})
    .then(client => {
      console.log("client",client)
      if (!client) {
        return res.status(401).json({
          error: req.t("Invalid API key or secret"),
          status: "error",
        });
      } else {
        req.client = client;
        next();
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: req.t("Error checking API key and secret"),
        status: "error",
      });
    });
}


