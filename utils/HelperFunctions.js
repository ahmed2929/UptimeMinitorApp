const jwt=require('jsonwebtoken')
const crypto = require('crypto');
const bycript =require('bcrypt')
const axios =require('../config/axios');
const https = require("https");
const { response } = require('express');
const User = require('../DB/Schema/User');
const mail =require("../config/MailConfig")


const pingToSingleServer =async(url,config)=>{
    if(!(url||config)){
        throw new Error('missing url or config')
    }
const oprtions={
    ...config
}
try {
    const response =await axios.get(url,oprtions);
    return response    
} catch (error) {
    error.error=true
    return error
}



}
// create user token

const GenerateToken=(id)=>{
    try {
        if(!id){
            throw new Error('missing id pramter')
        }
        const token = jwt.sign({
            id
            
          },
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          }
          );
          return token

    } catch (error) {
        throw new Error('error token generation ',error)
    }
  
}

const GenerateRandomCode=async(byte)=>{
    try {
       const bytes=byte||2;
       const buf = crypto.randomBytes(bytes).toString('hex');
           
           return buf;


    } catch (error) {
        throw new Error('error generating hasheCode ',error)
    }
  
}

const PrepareCheckRequest=async (check)=>{

    try {
        
       
        // prepare requested url
        const URL = check.port
        ? `${check.protocol}://${check.url}:${check.port}${check.path}`
        : `${check.protocol}://${check.url}${check.path}`;
        // prepare authentication header if exist
            let OptinalAuth={}
          if (check.authentication){
            OptinalAuth.authorization = "Basic " + Buffer.from(authentication.username + ":" + authentication.password).toString("base64")
    
          }
        // request options
        const options = {
            headers: { ...check.headers,... OptinalAuth},
            timeout: check.timeout * 1000,
            httpsAgent: new https.Agent({
              rejectUnauthorized: check.ignoreSSL,
            }),
          };
    
        const PreparedRequestObject={
            URL,
            options
        }  
    
        return PreparedRequestObject

    } catch (error) {
        console.log(error)
    }

  

}

const GenerateReportData=(report,ServerResponse,CheckData)=>{

    // calculate uptime and downtime 
    const uptimeToBeAdded = report.uptime == -1 ? 0 : CheckData.interval + report.uptime
    const downtimeToBeAdded = report.downtime == -1 ? 0 : CheckData.interval + report.downtime
    const newUptime = ServerResponse.error ? report.uptime : uptimeToBeAdded
    const newDowntime = ServerResponse.error ? downtimeToBeAdded : report.downtime
    // calculate reaches, outages and availability
    const newOutages = ServerResponse.error ? report.outages + 1 : report.outages
    const newReaches = ServerResponse.error ? report.reaches : report.reaches + 1
    const newAvailability = 100 * newReaches / (newReaches + newOutages) || 0
     // get duration in millisecond
     const durationMS = ServerResponse.error ? 0 : ServerResponse.duration

     const newResponseTimes = ServerResponse.error ? report.responseTimes : [...report.responseTimes, durationMS]
     const newAverageResponseTime = newResponseTimes.reduce((a, b) => a + b, 0) / newResponseTimes.length || -1
      // create log and add it to history
      const status = ServerResponse.error && ServerResponse.response ? ServerResponse.response.status : ServerResponse.status || "SERVER_NOT_FOUND"
      const log = `${new Date(Date.now())} ${ServerResponse.config.method.toUpperCase()} ${status} ${ServerResponse.config.url} ${String(CheckData.protocol).toUpperCase()} ${durationMS} ms`
      const logs = [...report.history, log]
      const newStatus = ServerResponse.error ? "Down" : "Up"

      const generatedOj={

            status: newStatus,
            availability: newAvailability + "%",
            uptime: newUptime,
            downtime: newDowntime,
            outages: newOutages,
            reaches: newReaches,
            responseTimes: newResponseTimes,
            responseTime: newAverageResponseTime + "ms",
            history: logs
      }

      return generatedOj

}

const sendWebhook=async(webhookUrl,msg)=>{
   await axios.create()
        .post(webhookUrl, { message: msg })
}

const getUserEmailFromId=async(id)=>{
    const user =await User.findById(id).select('email')
    return user.email;
 }
 
 const SendEmailToUser=async(email,message)=>{
   
    try {
        const mailOptions = {
            from: process.env.EmailSender,
            to: email,
            subject: "app status change",
            html: message,
          };
      
         await mail.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.log(err)
              throw new Error(err)
            } else {
           
              console.log(info);
            }
          });
    } catch (error) {
        console.log(error)
    }
    
 }

 

module.exports={
    GenerateToken,
    GenerateRandomCode,
    pingToSingleServer,
    PrepareCheckRequest,
    GenerateReportData,
    sendWebhook,
    getUserEmailFromId,
    SendEmailToUser
}
