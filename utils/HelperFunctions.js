/**
 * @file HelperFunctions.js
 * @namespace HelperFunctions
 * 
 * 
 */

const jwt=require('jsonwebtoken')
const crypto = require('crypto');
const User = require('../DB/Schema/User');
const mail =require("../config/MailConfig");
const { match } = require('assert');
const { BlobServiceClient } = require('@azure/storage-blob');
const { resolve } = require('path');
const NotificationMessages =require("../Messages/Notifications/index")
const {sendNotification} =require("../config/SendNotification")
const Profile = require('../DB/Schema/Profile');
const Viewer =require('../DB/Schema/Viewers')
// create refresh token

/**
 * Creates a new dependent user
 * 
 * @function
 * @memberof HelperFunctions
 * 
 * @param {string} token - 
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile
 * @throws {Error} if the email or mobile number already exist
 * 
 * @returns {Object} - Returns the new dependent user
 * @description 
 *     * -1 user access this api to create a dependent who has no phone
       * -2 email and phone number are optional
       * -3 if email and phone number are provided make sure that the are unique
       * -4 link the new dependent to the user profile
       * -5 user can confirm or reject dependent doses
       * -6 user has full permissions to mange the dependent 
       * -7 (read/write) medications,schedule,doses and get notifications
       * -8 create a new profile to that dependent
       
 * 
 */



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
    
 
 const GenerateOccurrences=async (UserID,MedId,MedInfo,SchedulerId,occurrencePattern,startDate,endDate,OccurrencesData)=>{

    // write a function that will generate the Occurrence of the med
    // based on the pattern and the start and end date
    // the function will return an array of dates
    // the array will be used to create the Occurrence in the database
    // the function will be called in the create med route
    // the function will be called in the update med route
    // the function will be called in the update Scheduler route

    
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
                    Scheduler:SchedulerId,
                    MedInfo:{...MedInfo},
                    PlannedDateTime:new Date(baseDate),
                    ...OccurrencesData
    
                }

               

                
                );
                var result = new Date(baseDate);
                result.setDate(result.getDate() + occurrencePattern);
                baseDate = result;
         
        }
        resolve(finalArrObj)
    })
   

 }


 const GenerateOccurrencesWithDays=async (UserID,MedId,MedInfo,SchedulerId,intervalDays,startDate,endDate,OccurrencesData)=>{

    // write a function that will generate the Occurrence of the med
    // based on the pattern and the start and end date
    // the function will return an array of dates
    // the array will be used to create the Occurrence in the database
    // the function will be called in the create med route
    // the function will be called in the update med route
    // the function will be called in the update Scheduler route

    
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
                    Scheduler:SchedulerId,
                    MedInfo:{...MedInfo},
                    PlannedDateTime:new Date(baseDate),
                    ...OccurrencesData
    
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
                    payload=NotificationMessages.RefileAlert_EN_APNS(profile.firstName,newInvitation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.RefileAlert_EN_GCM(profile.firstName,newInvitation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.RefileAlert_EN_APNS(profile.firstName,newInvitation._id)
                const Android_payload=NotificationMessages.RefileAlert_EN_GCM(profile.firstName,newInvitation._id)
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
                    payload=NotificationMessages.RefileAlert_AR_APNS(profile.firstName,newInvitation._id)
                    await sendNotification(userprofile._id,payload,"IOS")

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                payload=NotificationMessages.RefileAlert_AR_GCM(profile.firstName,newInvitation._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android")

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                const IOS_payload=  NotificationMessages.RefileAlert_AR_APNS(profile.firstName,newInvitation._id)
                const Android_payload=NotificationMessages.RefileAlert_AR_GCM(profile.firstName,newInvitation._id)
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

const CheckRelationShipBetweenCareGiverAndDependent=async(ProfileID,id)=>{
    try {
          /*
      ProfileID:the profileID
      id:is the id extracted from the token
      check for the CheckRelationShipBetweenCareGiverAndDependent 
        return true if the RelationShip exist
      
      */
       const profile =await Profile.findById(ProfileID)
       if(!profile){
         return false
       }
  
       // get the viewer permissions
       const viewerProfile =await Profile.findOne({
       "Owner.User":id
       })
       
       if(!viewerProfile){
          return false
       }
  
       const viewer =await Viewer.findOne({
        ViewerProfile:viewerProfile._id,
        DependentProfile:ProfileID
       })
       if(!viewer&&profile.Owner.User.toString()!==id){
        return false;
      }
      
      return [
        viewer,
        profile,
        viewerProfile

      ]


    } catch (error) {
        console.log(error)
        return false
    }

}

const CareGiverCanAddMed=async()=>{

}

const CareGiverCanAddSymptoms=async()=>{

}


module.exports={
    GenerateToken,
    GenerateRandomCode,
    GenerateRefreshToken,
    getUserEmailFromId,
    SendEmailToUser,
    UploadFileToAzureBlob,
    GenerateOccurrences,
    GenerateOccurrencesWithDays,
    SendPushNotificationToUserRegardlessLangAndOs,
    CheckRelationShipBetweenCareGiverAndDependent,
    CareGiverCanAddMed,
    CareGiverCanAddSymptoms
}
