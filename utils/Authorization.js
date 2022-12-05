const jwt = require("jsonwebtoken");

exports.authorization = () => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decodedToken;
      
      if (!userID) {
        return res.status(401).json({
          error: "Unauthorized",
          status: "error",
        });
      } else {
        next();
      }
    } catch {
      res.status(401).json({
        error: "Unauthorized",
        status: "error",
      });
    }
  };
};
