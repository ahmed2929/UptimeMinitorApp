const jwt=require('jsonwebtoken')
const crypto = require('crypto');
const User = require('../DB/Schema/User');
const mail =require("../config/MailConfig");
const { match } = require('assert');
const { BlobServiceClient } = require('@azure/storage-blob');
const { resolve } = require('path');
const NotificationMessages =require("../Messages/Notifications/index")
const {sendNotification} =require("../config/SendNotification")

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
 
 const GenerateOccurances=async (UserID,MedId,MedInfo,SchdulerId,OccrurencePattern,startDate,endDate,OccurancesData)=>{

    // write a function that will generate the occurance of the med
    // based on the pattern and the start and end date
    // the function will return an array of dates
    // the array will be used to create the occurance in the database
    // the function will be called in the create med route
    // the function will be called in the update med route
    // the function will be called in the update schduler route

    
    return new Promise((resolve,reject)=>{

    //let startDate=  new Date(startdate).getTime()

        const finalArrObj =[]
        let baseDate=new Date(startDate)

        var endDayResultWithOneDay = new Date(endDate);
        endDayResultWithOneDay.setDate(endDayResultWithOneDay.getDate() + 1);
        endDate = endDayResultWithOneDay;

        while (baseDate <= endDate ) {
            finalArrObj.push(
                {
                    user:UserID,
                    Medication:MedId,
                    Schduler:SchdulerId,
                    MedInfo:{...MedInfo},
                    PlannedDateTime:new Date(baseDate),
                    ...OccurancesData
    
                }

               

                
                );
                var result = new Date(baseDate);
                result.setDate(result.getDate() + OccrurencePattern);
                baseDate = result;
         
        }
        resolve(finalArrObj)
    })
   

 }


 const GenerateOccurancesWithDays=async (UserID,MedId,MedInfo,SchdulerId,intervalDays,startDate,endDate,OccurancesData)=>{

    // write a function that will generate the occurance of the med
    // based on the pattern and the start and end date
    // the function will return an array of dates
    // the array will be used to create the occurance in the database
    // the function will be called in the create med route
    // the function will be called in the update med route
    // the function will be called in the update schduler route

    
    return new Promise((resolve,reject)=>{

    //let startDate=  new Date(startdate).getTime()

        const finalArrObj =[]
        let baseDate=new Date(startDate)

        var endDayResultWithOneDay = new Date(endDate);
        endDayResultWithOneDay.setDate(endDayResultWithOneDay.getDate() + 1);
        endDate = endDayResultWithOneDay;

        while (baseDate <= endDate ) {
            console.log("while runs ",baseDate,endDate )
            const dayName=baseDate.toLocaleDateString('en', { weekday: 'long' })
            const shouldAdded=intervalDays.includes(dayName)
            console.log(shouldAdded)
            console.log("dayna,e",dayName)
            console.log("intervalDays",intervalDays)
            
            if(shouldAdded){

            finalArrObj.push(
                {
                    user:UserID,
                    Medication:MedId,
                    Schduler:SchdulerId,
                    MedInfo:{...MedInfo},
                    PlannedDateTime:new Date(baseDate),
                    ...OccurancesData
    
                }

                );
            }
                var result = new Date(baseDate);
                result.setDate(result.getDate() + 1);
                baseDate = result;
         
        }
        resolve(finalArrObj)
    })
   

 }

const SendPushNotificationToUserRegardlessLangAndOs=async(FromProfileObj,ToProfileObj,notificationMessage,payloadData)=>{
    try {
        userprofile=ToProfileObj
        profile=FromProfileObj
    if(userprofile.lang.toLowerCase()==="en"){
        let payload;
        // notification prepare device type
        // switch based on notificationMessage
        switch (notificationMessage) {
            case "NewInvitationFromCareGiver":
                 //i case of only IOS
                    if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                        payload=NotificationMessages.NewInvitationFromCareGiver_EN_APNS(profile.firstName,payloadData.Invitation._id)
                        await sendNotification(userprofile._id,payload,"IOS")

                    }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                    payload=NotificationMessages.NewInvitationFromCareGiver_EN_GCM(profile.firstName,payloadData.Invitation._id)
                        //case of only android
                        await sendNotification(userprofile._id,payload,"Android")

                    }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    const IOS_payload=  NotificationMessages.NewInvitationFromCareGiver_EN_APNS(profile.firstName,payloadData.Invitation._id)
                    const Android_payload=NotificationMessages.NewInvitationFromCareGiver_EN_GCM(profile.firstName,payloadData.Invitation._id)
                    //case of both
                        await sendNotification(userprofile._id,IOS_payload,"IOS")
                        await sendNotification(userprofile._id,Android_payload,"Android")
                    } 
                break;
            case "DependentAcceptedInvitation":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    payload=NotificationMessages.DependentAcceptedInvitation_EN_APNS(profile.firstName,payloadData.Invitation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.DependentAcceptedInvitation_EN_GCM(profile.firstName,payloadData.Invitation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.DependentAcceptedInvitation_EN_APNS(profile.firstName,payloadData.Invitation._id)
                const Android_payload=NotificationMessages.DependentAcceptedInvitation_EN_GCM(profile.firstName,payloadData.Invitation._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS")
                    await sendNotification(userprofile._id,Android_payload,"Android")
                } 
            break;
            case "NewInvitationFromDependent":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    payload=NotificationMessages.NewInvitationFromDependent_EN_APNS(profile.firstName,payloadData.Invitation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.NewInvitationFromDependent_EN_GCM(profile.firstName,payloadData.Invitation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.NewInvitationFromDependent_EN_APNS(profile.firstName,payloadData.Invitation._id)
                const Android_payload=NotificationMessages.NewInvitationFromDependent_EN_GCM(profile.firstName,payloadData.Invitation._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS")
                    await sendNotification(userprofile._id,Android_payload,"Android")
                } 
            break;
            case "CareGiverAcceptedInvitation":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    payload=NotificationMessages.CareGiverAcceptedInvitation_EN_APNS(profile.firstName,payloadData.Invitation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.CareGiverAcceptedInvitation_EN_GCM(profile.firstName,payloadData.Invitation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.CareGiverAcceptedInvitation_EN_APNS(profile.firstName,payloadData.Invitation._id)
                const Android_payload=NotificationMessages.CareGiverAcceptedInvitation_EN_GCM(profile.firstName,payloadData.Invitation._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS")
                    await sendNotification(userprofile._id,Android_payload,"Android")
                } 
            break;
            case "RefileAlert":
                //i case of only IOS
                if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    payload=NotificationMessages.RefileAlert_EN_APNS(profile.firstName,newInvetation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.RefileAlert_EN_GCM(profile.firstName,newInvetation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.RefileAlert_EN_APNS(profile.firstName,newInvetation._id)
                const Android_payload=NotificationMessages.RefileAlert_EN_GCM(profile.firstName,newInvetation._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS")
                    await sendNotification(userprofile._id,Android_payload,"Android")
                } 
            break;

            default:
                break;

        }
         
       
          
      }else if(userprofile.lang.toLowerCase()==="ar"){

        let payload;
        // notification prepare device type
        // switch based on notificationMessage
        switch (notificationMessage) {
            case "NewInvitationFromCareGiver":
                 //i case of only IOS
                    if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                        payload=NotificationMessages.NewInvitationFromCareGiver_AR_APNS(profile.firstName,payloadData.Invitation._id)
                        await sendNotification(userprofile._id,payload,"IOS")

                    }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                    payload=NotificationMessages.NewInvitationFromCareGiver_AR_GCM(profile.firstName,payloadData.Invitation._id)
                        //case of only android
                        await sendNotification(userprofile._id,payload,"Android")

                    }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    const IOS_payload=  NotificationMessages.NewInvitationFromCareGiver_AR_APNS(profile.firstName,payloadData.Invitation._id)
                    const Android_payload=NotificationMessages.NewInvitationFromCareGiver_AR_GCM(profile.firstName,payloadData.Invitation._id)
                    //case of both
                        await sendNotification(userprofile._id,IOS_payload,"IOS")
                        await sendNotification(userprofile._id,Android_payload,"Android")
                    } 
                break;
            case "DependentAcceptedInvitation":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    payload=NotificationMessages.DependentAcceptedInvitation_AR_APNS(profile.firstName,payloadData.Invitation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.DependentAcceptedInvitation_AR_GCM(profile.firstName,payloadData.Invitation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.DependentAcceptedInvitation_AR_APNS(profile.firstName,payloadData.Invitation._id)
                const Android_payload=NotificationMessages.DependentAcceptedInvitation_AR_GCM(profile.firstName,payloadData.Invitation._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS")
                    await sendNotification(userprofile._id,Android_payload,"Android")
                } 
            break;
            case "NewInvitationFromDependent":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    payload=NotificationMessages.NewInvitationFromDependent_AR_APNS(profile.firstName,payloadData.Invitation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.NewInvitationFromDependent_AR_GCM(profile.firstName,payloadData.Invitation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.NewInvitationFromDependent_AR_APNS(profile.firstName,payloadData.Invitation._id)
                const Android_payload=NotificationMessages.NewInvitationFromDependent_AR_GCM(profile.firstName,payloadData.Invitation._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS")
                    await sendNotification(userprofile._id,Android_payload,"Android")
                } 
            break;
            case "CareGiverAcceptedInvitation":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    payload=NotificationMessages.CareGiverAcceptedInvitation_AR_APNS(profile.firstName,payloadData.Invitation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.CareGiverAcceptedInvitation_AR_GCM(profile.firstName,payloadData.Invitation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.CareGiverAcceptedInvitation_AR_APNS(profile.firstName,payloadData.Invitation._id)
                const Android_payload=NotificationMessages.CareGiverAcceptedInvitation_AR_GCM(profile.firstName,payloadData.Invitation._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS")
                    await sendNotification(userprofile._id,Android_payload,"Android")
                } 
            break;
            case "RefileAlert":
                //i case of only IOS
                if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    payload=NotificationMessages.RefileAlert_AR_APNS(profile.firstName,newInvetation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.RefileAlert_AR_GCM(profile.firstName,newInvetation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.RefileAlert_AR_APNS(profile.firstName,newInvetation._id)
                const Android_payload=NotificationMessages.RefileAlert_AR_GCM(profile.firstName,newInvetation._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS")
                    await sendNotification(userprofile._id,Android_payload,"Android")
                } 
            break;

            default:
                break;

        }
         

      }
    }catch(err){
        console.log(err)
    }
    

}


module.exports={
    GenerateToken,
    GenerateRandomCode,
    GenerateRefreshToken,
    getUserEmailFromId,
    SendEmailToUser,
    UploadFileToAzureBlob,
    GenerateOccurances,
    GenerateOccurancesWithDays,
    SendPushNotificationToUserRegardlessLangAndOs
}
