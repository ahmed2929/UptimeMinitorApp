const axios = require("axios").default;

//append start time with every request
axios.interceptors.request.use(function (config) {
 
    config.metadata = { startTime: new Date()}
    return config;
  }, function (error) {
    return Promise.reject(error);
  });
//append duration with every response
axios.interceptors.response.use(function (response) {
 
    response.config.metadata.endTime = new Date()
    response.duration = response.config.metadata.endTime - response.config.metadata.startTime
    return response;
  }, function (error) {
    error.config.metadata.endTime = new Date();
    error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
    return Promise.reject(error);
  });
module.exports = axios;