const jwt = require("jsonwebtoken");
const Access = require("../DB/Schema/apiAccess");

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
        req.id=userID
        next();
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
          error: req.t("Unauthorized"),
          status: "error",
        });
      } else {
        req.id=userID
        next();
      }
    } catch {
      res.status(401).json({
        error: req.t("Unauthorized"),
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

  Access.findOne({ apiKey: apiKey, apiSecret: apiSecret })
    .then(client => {
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

