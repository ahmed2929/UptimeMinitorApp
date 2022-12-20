const jwt=require('jsonwebtoken')
const crypto = require('crypto');
const User = require('../DB/Schema/User');
const mail =require("../config/MailConfig");
const { match } = require('assert');
const { BlobServiceClient } = require('@azure/storage-blob');



// create refresh token

const GenerateRefreshToken=(id)=>{
    try {
        if(!id){
            throw new Error('missing id pramter')
        }
        const token = jwt.sign({
            id
            
          },
            process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
          }
          );
          return token

    } catch (error) {
        console.log(error)
        throw new Error(error)
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

const GenerateRandomCode=async(n)=>{
    try {
      
           
           return Math.floor(Math.random()*9000+1000)


    } catch (error) {
        throw new Error('error generating otp ',error)
    }
  
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
            subject: "voithy",
            html: message,
          };
      
         await mail.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.log(err)
              throw new Error(err)
            } else {
                console.log("email sent")
            
            }
          });
    } catch (error) {
        console.log(error)
    }
    
 }

 const UploadFileToAzureBlob=async(file)=>{
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AzureBlobConnectionString);
        const containerName = process.env.AzureBlobContainerName;
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobName = +Date.now()+Math.random()+file.originalname
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.upload(file.buffer, file.buffer.length);
        console.log(uploadBlobResponse)
        const url = `https://medimages.blob.core.windows.net/${containerName}/${blobName}`;
        

        return url;
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
 }
 
 const GenerateOccurances=async (UserID,MedId,SchdulerId,OccrurencePattern,startDate,endDate,OccurancesData)=>{

    // write a function that will generate the occurance of the med
    // based on the pattern and the start and end date
    // the function will return an array of dates
    // the array will be used to create the occurance in the database
    // the function will be called in the create med route
    // the function will be called in the update med route
    // the function will be called in the update schduler route

    const finalArrObj = [];
    console.log(startDate,endDate)
    while (startDate <= endDate ) {
       
        finalArrObj.push(
            {
                user:UserID,
                Medication:MedId,
                schduler:SchdulerId,
                PlannedDateTime:new Date(startDate),
                ...OccurancesData

            }
            
            
            );
      startDate.setDate(startDate.getDate() + OccrurencePattern);
    }

    return finalArrObj;


 }

module.exports={
    GenerateToken,
    GenerateRandomCode,
    GenerateRefreshToken,
    getUserEmailFromId,
    SendEmailToUser,
    UploadFileToAzureBlob
}
