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
const Notification = require('../DB/Schema/Notifications')
const mongoose = require('mongoose');
const Occurrence = require("../DB/Schema/Occurrences");
const Symptom = require("../DB/Schema/Symptoms");
const BloodGlucose = require("../DB/Schema/BloodGlucoseManualMeasurement");
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
        // const mailOptions = {
        //     from: process.env.EmailSender,
        //     to: email,
        //     subject: "voithy",
        //     html: message,
        //   };
        const emailMessage = {
            sender: "DoNotReply@voithy.com",
            content: {
              subject: "voithy",
                html: message
            },
            recipients: {
              to: [
                {
                  email: email,
                },
              ],
            },
          
          };
          
         await mail.send(emailMessage, function (err, info) {
            if (err) {
              console.log(err)
              throw new Error(err)
            } else {
                console.log("email sent",info)
            
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
        const url = `${blobName}`;
        

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
        console.log("startDate is :",startDate)
        console.log("occurence generation started :",baseDate)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const HalfAnHourAgo = new Date(Date.now() - 30 * 60 * 1000);

        while (baseDate <= endDate ) {
            let Status=0
            if(new Date(baseDate)<new Date(oneHourAgo)){
                Status=3
            }else if(new Date(baseDate)<new Date(HalfAnHourAgo)){
                Status=5
            }else if (new Date(baseDate)<new Date()){
                Status=1
            }
            finalArrObj.push(
                {
                    user:UserID,
                    Medication:MedId,
                    Scheduler:SchedulerId,
                    MedInfo:{...MedInfo},
                    PlannedDateTime:new Date(baseDate),
                    Status:Status,
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
 const GenerateMeasurementOccurrences=async (occurrencePattern,startDate,endDate,OccurrencesData)=>{

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

const GenerateMeasurementOccurrencesWithDays=async (intervalDays,startDate,endDate,OccurrencesData)=>{

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
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const HalfAnHourAgo = new Date(Date.now() - 30 * 60 * 1000);

       
          if(shouldAdded){

          finalArrObj.push(
              {
               
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
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const HalfAnHourAgo = new Date(Date.now() - 30 * 60 * 1000);

            let Status=0
            if(new Date(baseDate)<new Date(oneHourAgo)){
                Status=3
            }else if(new Date(baseDate)<new Date(HalfAnHourAgo)){
                Status=5
            }else if (new Date(baseDate)<new Date()){
                Status=1
            }
            if(shouldAdded){

            finalArrObj.push(
                {
                    user:UserID,
                    Medication:MedId,
                    Scheduler:SchedulerId,
                    MedInfo:{...MedInfo},
                    PlannedDateTime:new Date(baseDate),
                    Status:Status,
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
       let userprofile=ToProfileObj
       let profile=FromProfileObj
    if(userprofile.lang.toLowerCase()==="en"){
        let payload;
        // notification prepare device type
        // switch based on notificationMessage
        switch (notificationMessage) {
            case "NewInvitationFromCareGiver":
                 //i case of only IOS
                    if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                        //save notification in db
                        const notification = new Notification({
                            ProfileID:userprofile._id,
                            data:payloadData,
                            action:0
                            
                        })
                        await notification.save()
                        payload=NotificationMessages.NewInvitationFromCareGiver_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,0,notification._id)
                        await sendNotification(userprofile._id,payload,"IOS",0,payloadData)

                    }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                        //save notification in db
                        const notification = new Notification({
                            ProfileID:userprofile._id,
                            data:payloadData,
                            action:0
                            
                        })
                        await notification.save()
                    payload=NotificationMessages.NewInvitationFromCareGiver_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,0,notification._id)
                        //case of only android
                        await sendNotification(userprofile._id,payload,"Android",0,payloadData)

                    }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                     //save notification in db
                     const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:0
                        
                    })
                    await notification.save()   
                    const IOS_payload=  NotificationMessages.NewInvitationFromCareGiver_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,0,notification._id)
                    const Android_payload=NotificationMessages.NewInvitationFromCareGiver_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,0,notification._id)
                    //case of both
                        await sendNotification(userprofile._id,IOS_payload,"IOS",0,payloadData)
                        await sendNotification(userprofile._id,Android_payload,"Android",0,payloadData)
                    } 
                break;
            case "DependentAcceptedInvitation":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    //save notification in db
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:2
                        
                    })
                    await notification.save()
                    payload=NotificationMessages.DependentAcceptedInvitation_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,2,notification._id)
                    await sendNotification(userprofile._id,payload,"IOS",2,payloadData)

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                      //save notification in db
                      const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:2
                        
                    })
                    await notification.save()
                payload=NotificationMessages.DependentAcceptedInvitation_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,2,notification._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android",2,payloadData)

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                      //save notification in db
                      const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:2
                        
                    })
                    await notification.save()
                const IOS_payload=  NotificationMessages.DependentAcceptedInvitation_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,2,notification._id)
                const Android_payload=NotificationMessages.DependentAcceptedInvitation_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,2,notification._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS",2,payloadData)
                    await sendNotification(userprofile._id,Android_payload,"Android",2,payloadData)
                } 
            break;
            case "NewInvitationFromDependent":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                      //save notification in db
                      const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:1
                        
                    })
                    await notification.save()
                    payload=NotificationMessages.NewInvitationFromDependent_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,1,notification._id)
                    await sendNotification(userprofile._id,payload,"IOS",1,payloadData)

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                      //save notification in db
                      const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:1
                        
                    })
                    await notification.save()
                payload=NotificationMessages.NewInvitationFromDependent_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,1,notification._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android",1,payloadData)

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:1
                        
                    })
                    await notification.save()
                const IOS_payload=  NotificationMessages.NewInvitationFromDependent_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,1,notification._id)
                const Android_payload=NotificationMessages.NewInvitationFromDependent_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,1,notification._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS",1,payloadData)
                    await sendNotification(userprofile._id,Android_payload,"Android",1,payloadData)
                } 
            break;
            case "CareGiverAcceptedInvitation":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:3
                        
                    })
                    await notification.save()
                    payload=NotificationMessages.CareGiverAcceptedInvitation_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,3,notification._id)
                    await sendNotification(userprofile._id,payload,"IOS",3,payloadData)

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:3
                        
                    })
                    await notification.save()
                payload=NotificationMessages.CareGiverAcceptedInvitation_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,3,notification._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android",3,payloadData)

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:3
                        
                    })
                    await notification.save()
                const IOS_payload=  NotificationMessages.CareGiverAcceptedInvitation_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,3,notification._id)
                const Android_payload=NotificationMessages.CareGiverAcceptedInvitation_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,3,notification._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS",3,payloadData)
                    await sendNotification(userprofile._id,Android_payload,"Android",3,payloadData)
                } 
            break;
            case "RefileAlert":
                //i case of only IOS
                if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:6
                        
                    })
                    await notification.save()
                    payload=NotificationMessages.RefileAlert_EN_APNS(profile.Owner.User.firstName,newInvitation._id,6,notification._id)
                    await sendNotification(userprofile._id,payload,"IOS",6,payloadData)

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:6
                        
                    })
                    await notification.save()
                payload=NotificationMessages.RefileAlert_EN_GCM(profile.Owner.User.firstName,newInvitation._id,6,notification._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android",6,payloadData)

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:6
                        
                    })
                    await notification.save()
                const IOS_payload=  NotificationMessages.RefileAlert_EN_APNS(profile.Owner.User.firstName,newInvitation._id,6,notification._id)
                const Android_payload=NotificationMessages.RefileAlert_EN_GCM(profile.Owner.User.firstName,newInvitation._id,6,notification._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS",6,payloadData)
                    await sendNotification(userprofile._id,Android_payload,"Android",6,payloadData)
                } 
            break;
            case "NewSymptom":
                 //i case of only IOS
                    if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                        //save notification in db
                        const notification = new Notification({
                            ProfileID:userprofile._id,
                            data:payloadData,
                            action:8
                            
                        })
                        await notification.save()
                        payload=NotificationMessages.NewSymptom_EN_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                        await sendNotification(userprofile._id,payload,"IOS",8,payloadData)

                    }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                        //save notification in db
                        const notification = new Notification({
                            ProfileID:userprofile._id,
                            data:payloadData,
                            action:8
                            
                        })
                        await notification.save()
                        payload=NotificationMessages.NewSymptom_EN_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                        await sendNotification(userprofile._id,payload,"Android",8,payloadData)

                    }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                     //save notification in db
                     const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:8
                        
                    })
                    await notification.save()   
                    const IOS_payload=NotificationMessages.NewSymptom_EN_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)

                    const Android_payload=NotificationMessages.NewSymptom_EN_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                    //case of both
                        await sendNotification(userprofile._id,IOS_payload,"IOS",8,payloadData)
                        await sendNotification(userprofile._id,Android_payload,"Android",8,payloadData)
                    } 
                break;
            case "NewSymptomAddToMe":
                  //i case of only IOS
                     if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                         //save notification in db
                         const notification = new Notification({
                             ProfileID:userprofile._id,
                             data:payloadData,
                             action:10
                             
                         })
                         await notification.save()
                         payload=NotificationMessages.NewSymptomAddedToMe_EN_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                         await sendNotification(userprofile._id,payload,"IOS",10,payloadData)
 
                     }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                         //save notification in db
                         const notification = new Notification({
                             ProfileID:userprofile._id,
                             data:payloadData,
                             action:10
                             
                         })
                         await notification.save()
                         payload=NotificationMessages.NewSymptomAddedToMe_EN_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                         await sendNotification(userprofile._id,payload,"Android",8,payloadData)
 
                     }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                      //save notification in db
                      const notification = new Notification({
                         ProfileID:userprofile._id,
                         data:payloadData,
                         action:10
                         
                     })
                     await notification.save()   
                     const IOS_payload=NotificationMessages.NewSymptomAddedToMe_EN_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
 
                     const Android_payload=NotificationMessages.NewSymptomAddedToMe_EN_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                     //case of both
                         await sendNotification(userprofile._id,IOS_payload,"IOS",10,payloadData)
                         await sendNotification(userprofile._id,Android_payload,"Android",10,payloadData)
                     } 
                 break;    
            case "NewInvitationToBeMasterUser":
                    //i case of only IOS
                       if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                           //save notification in db
                           const notification = new Notification({
                               ProfileID:userprofile._id,
                               data:payloadData,
                               action:9
                               
                           })
                           await notification.save()
                           payload=NotificationMessages.NewInvitationFromCareGiver_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,9,notification._id)
                           await sendNotification(userprofile._id,payload,"IOS",9,payloadData)
   
                       }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                           //save notification in db
                           const notification = new Notification({
                               ProfileID:userprofile._id,
                               data:payloadData,
                               action:9
                               
                           })
                           await notification.save()
                       payload=NotificationMessages.NewInvitationFromCareGiver_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,9,notification._id)
                           //case of only android
                           await sendNotification(userprofile._id,payload,"Android",9,payloadData)
   
                       }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                        //save notification in db
                        const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:9
                           
                       })
                       await notification.save()   
                       const IOS_payload=  NotificationMessages.NewInvitationFromCareGiver_EN_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,9,notification._id)
                       const Android_payload=NotificationMessages.NewInvitationFromCareGiver_EN_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,9,notification._id)
                       //case of both
                           await sendNotification(userprofile._id,IOS_payload,"IOS",9,payloadData)
                           await sendNotification(userprofile._id,Android_payload,"Android",9,payloadData)
                       } 
                   break;
            case "BloodGlucoseMeasurement":
                    //i case of only IOS
                       if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                           //save notification in db
                           const notification = new Notification({
                               ProfileID:userprofile._id,
                               data:payloadData,
                               action:15
                               
                           })
                           await notification.save()
                           payload=NotificationMessages.NewMeasurementAddedByMyDependnet_EN_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                           await sendNotification(userprofile._id,payload,"IOS",15,payloadData)
   
                       }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                           //save notification in db
                           const notification = new Notification({
                               ProfileID:userprofile._id,
                               data:payloadData,
                               action:15
                               
                           })
                           await notification.save()
                           payload=NotificationMessages.NewMeasurementAddedByMyDependnet_EN_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                           await sendNotification(userprofile._id,payload,"Android",15,payloadData)
   
                       }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                        //save notification in db
                        const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:15
                           
                       })
                       await notification.save()   
                       const IOS_payload=NotificationMessages.NewMeasurementAddedByMyDependnet_EN_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
   
                       const Android_payload=NotificationMessages.NewMeasurementAddedByMyDependnet_EN_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       //case of both
                           await sendNotification(userprofile._id,IOS_payload,"IOS",15,payloadData)
                           await sendNotification(userprofile._id,Android_payload,"Android",15,payloadData)
                       } 
                   break;
           case "BloodGlucoseMeasurementAddToMe":
                    //i case of only IOS
                       if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                           //save notification in db
                           const notification = new Notification({
                               ProfileID:userprofile._id,
                               data:payloadData,
                               action:16
                               
                           })
                           await notification.save()
                           payload=NotificationMessages.NewMeasurementAddedByMyDependnet_EN_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                           await sendNotification(userprofile._id,payload,"IOS",16,payloadData)
   
                       }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                           //save notification in db
                           const notification = new Notification({
                               ProfileID:userprofile._id,
                               data:payloadData,
                               action:16
                               
                           })
                           await notification.save()
                           payload=NotificationMessages.NewMeasurementAddedByMyDependnet_EN_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                           await sendNotification(userprofile._id,payload,"Android",16,payloadData)
   
                       }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                        //save notification in db
                        const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:16
                           
                       })
                       await notification.save()   
                       const IOS_payload=NotificationMessages.NewMeasurementAddedByMyDependnet_EN_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
   
                       const Android_payload=NotificationMessages.NewMeasurementAddedByMyDependnet_EN_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       //case of both
                           await sendNotification(userprofile._id,IOS_payload,"IOS",16,payloadData)
                           await sendNotification(userprofile._id,Android_payload,"Android",16,payloadData)
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
                        const notification = new Notification({
                            ProfileID:userprofile._id,
                            data:payloadData,
                            action:0
                            
                        })
                        await notification.save()
                        payload=NotificationMessages.NewInvitationFromCareGiver_AR_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,0,notification._id)
                        await sendNotification(userprofile._id,payload,"IOS",0,payloadData)

                    }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                        const notification = new Notification({
                            ProfileID:userprofile._id,
                            data:payloadData,
                            action:0
                            
                        })
                        await notification.save()
                    
                        payload=NotificationMessages.NewInvitationFromCareGiver_AR_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,0,notification._id)
                        //case of only android
                        await sendNotification(userprofile._id,payload,"Android",0,payloadData)

                    }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                        const notification = new Notification({
                            ProfileID:userprofile._id,
                            data:payloadData,
                            action:0
                            
                        })
                        await notification.save()
                    
                        const IOS_payload=  NotificationMessages.NewInvitationFromCareGiver_AR_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,0,notification._id)
                    const Android_payload=NotificationMessages.NewInvitationFromCareGiver_AR_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,0,notification._id)
                    //case of both
                        await sendNotification(userprofile._id,IOS_payload,"IOS",0,payloadData)
                        await sendNotification(userprofile._id,Android_payload,"Android",0,payloadData)
                    } 
                break;
            case "DependentAcceptedInvitation":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:2
                        
                    })
                    await notification.save()
                    payload=NotificationMessages.DependentAcceptedInvitation_AR_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,2,notification._id)
                    await sendNotification(userprofile._id,payload,"IOS",2,payloadData)

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:2
                        
                    })
                    await notification.save()
                payload=NotificationMessages.DependentAcceptedInvitation_AR_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,2,notification._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android",2,payloadData)

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:2
                        
                    })
                    await notification.save()
                const IOS_payload=  NotificationMessages.DependentAcceptedInvitation_AR_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,2,notification._id)
                const Android_payload=NotificationMessages.DependentAcceptedInvitation_AR_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,2,notification._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS",2,payloadData)
                    await sendNotification(userprofile._id,Android_payload,"Android",2,payloadData)
                } 
            break;
            case "NewInvitationFromDependent":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:1
                        
                    })
                    await notification.save()
                    payload=NotificationMessages.NewInvitationFromDependent_AR_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,1,notification._id)
                    await sendNotification(userprofile._id,payload,"IOS",1,payloadData)

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:1
                        
                    })
                    await notification.save()
                payload=NotificationMessages.NewInvitationFromDependent_AR_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,1,notification._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android",1,payloadData)

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:1
                        
                    })
                    await notification.save()
                const IOS_payload=  NotificationMessages.NewInvitationFromDependent_AR_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,1,notification._id)
                const Android_payload=NotificationMessages.NewInvitationFromDependent_AR_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,1,notification._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS",1,{
                        payloadData

                    })
                    await sendNotification(userprofile._id,Android_payload,"Android",1,payloadData)
                } 
            break;
            case "CareGiverAcceptedInvitation":
                 //i case of only IOS
                 if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:3
                        
                    })
                    await notification.save()
                    payload=NotificationMessages.CareGiverAcceptedInvitation_AR_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,3,notification._id)
                    await sendNotification(userprofile._id,payload,"IOS",3,payloadData)

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:3
                        
                    })
                    await notification.save()
                payload=NotificationMessages.CareGiverAcceptedInvitation_AR_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,3,notification._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android",3,{
                        payloadData

                    })

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:3
                        
                    })
                    await notification.save()
                const IOS_payload=  NotificationMessages.CareGiverAcceptedInvitation_AR_APNS(profile.Owner.User.firstName,payloadData.Invitation._id,3,notification._id)
                const Android_payload=NotificationMessages.CareGiverAcceptedInvitation_AR_GCM(profile.Owner.User.firstName,payloadData.Invitation._id,3,notification._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS",3,payloadData)
                    await sendNotification(userprofile._id,Android_payload,"Android",3,payloadData)
                } 
            break;
            case "RefileAlert":
                //i case of only IOS
                if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:6
                        
                    })
                    await notification.save()
                    payload=NotificationMessages.RefileAlert_AR_APNS(profile.Owner.User.firstName,newInvitation._id,6,notification._id)
                    await sendNotification(userprofile._id,payload,"IOS",6,payloadData)

                }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:6
                        
                    })
                    await notification.save()
                payload=NotificationMessages.RefileAlert_AR_GCM(profile.Owner.User.firstName,newInvitation._id,6,notification._id)
                    //case of only android
                    await sendNotification(userprofile._id,payload,"Android",6,payloadData)

                }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    const notification = new Notification({
                        ProfileID:userprofile._id,
                        data:payloadData,
                        action:6
                        
                    })
                    await notification.save()
                const IOS_payload=  NotificationMessages.RefileAlert_AR_APNS(profile.Owner.User.firstName,newInvitation._id,6,notification._id)
                const Android_payload=NotificationMessages.RefileAlert_AR_GCM(profile.Owner.User.firstName,newInvitation._id,6,notification._id)
                //case of both
                    await sendNotification(userprofile._id,IOS_payload,"IOS",6,payloadData)
                    await sendNotification(userprofile._id,Android_payload,"Android",6,payloadData)
                } 
            break;
            case "NewSymptom":
                //i case of only IOS
                   if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                       //save notification in db
                       const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:8
                           
                       })
                       await notification.save()
                       payload=NotificationMessages.NewSymptom_AR_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       await sendNotification(userprofile._id,payload,"IOS",8,payloadData)

                   }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                       //save notification in db
                       const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:8
                           
                       })
                       await notification.save()
                       payload=NotificationMessages.NewSymptom_AR_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       await sendNotification(userprofile._id,payload,"Android",8,payloadData)

                   }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    //save notification in db
                    const notification = new Notification({
                       ProfileID:userprofile._id,
                       data:payloadData,
                       action:8
                       
                   })
                   await notification.save()   
                   const IOS_payload=NotificationMessages.NewSymptom_AR_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)

                   const Android_payload=NotificationMessages.NewSymptom_AR_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                   //case of both
                       await sendNotification(userprofile._id,IOS_payload,"IOS",8,payloadData)
                       await sendNotification(userprofile._id,Android_payload,"Android",8,payloadData)
                   } 
               break;
            case "NewSymptomAddToMe":
                //i case of only IOS
                   if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                       //save notification in db
                       const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:10
                           
                       })
                       await notification.save()
                       payload=NotificationMessages.NewSymptomAddedToMe_AR_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       await sendNotification(userprofile._id,payload,"IOS",8,payloadData)

                   }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                       //save notification in db
                       const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:10
                           
                       })
                       await notification.save()
                       payload=NotificationMessages.NewSymptomAddedToMe_AR_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       await sendNotification(userprofile._id,payload,"Android",8,payloadData)

                   }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    //save notification in db
                    const notification = new Notification({
                       ProfileID:userprofile._id,
                       data:payloadData,
                       action:10
                       
                   })
                   await notification.save()   
                   const IOS_payload=NotificationMessages.NewSymptomAddedToMe_AR_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)

                   const Android_payload=NotificationMessages.NewSymptomAddedToMe_AR_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                   //case of both
                       await sendNotification(userprofile._id,IOS_payload,"IOS",10,payloadData)
                       await sendNotification(userprofile._id,Android_payload,"Android",10,payloadData)
                   } 
               break;
            case "BloodGlucoseMeasurement":
                //i case of only IOS
                   if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                       //save notification in db
                       const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:15
                           
                       })
                       await notification.save()
                       payload=NotificationMessages.NewMeasurementAddedByMyDependnet_AR_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       await sendNotification(userprofile._id,payload,"IOS",15,payloadData)

                   }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                       //save notification in db
                       const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:15
                           
                       })
                       await notification.save()
                       payload=NotificationMessages.NewMeasurementAddedByMyDependnet_AR_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       await sendNotification(userprofile._id,payload,"Android",15,payloadData)

                   }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    //save notification in db
                    const notification = new Notification({
                       ProfileID:userprofile._id,
                       data:payloadData,
                       action:15
                       
                   })
                   await notification.save()   
                   const IOS_payload=NotificationMessages.NewMeasurementAddedByMyDependnet_AR_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)

                   const Android_payload=NotificationMessages.NewMeasurementAddedByMyDependnet_AR_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                   //case of both
                       await sendNotification(userprofile._id,IOS_payload,"IOS",15,payloadData)
                       await sendNotification(userprofile._id,Android_payload,"Android",15,payloadData)
                   } 
               break;
            case "BloodGlucoseMeasurementAddToMe":
                //i case of only IOS
                   if(userprofile.NotificationInfo.IOS&&!userprofile.NotificationInfo.Android){
                       //save notification in db
                       const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:16
                           
                       })
                       await notification.save()
                       payload=NotificationMessages.NewMeasurementAddedByMyDependnet_AR_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       await sendNotification(userprofile._id,payload,"IOS",16,payloadData)

                   }else if (userprofile.NotificationInfo.Android&&!userprofile.NotificationInfo.IOS) { 
                       //save notification in db
                       const notification = new Notification({
                           ProfileID:userprofile._id,
                           data:payloadData,
                           action:16
                           
                       })
                       await notification.save()
                       payload=NotificationMessages.NewMeasurementAddedByMyDependnet_AR_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                       await sendNotification(userprofile._id,payload,"Android",16,payloadData)

                   }else if (userprofile.NotificationInfo.IOS&&userprofile.NotificationInfo.Android){
                    //save notification in db
                    const notification = new Notification({
                       ProfileID:userprofile._id,
                       data:payloadData,
                       action:16
                       
                   })
                   await notification.save()   
                   const IOS_payload=NotificationMessages.NewMeasurementAddedByMyDependnet_AR_APNS(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)

                   const Android_payload=NotificationMessages.NewMeasurementAddedByMyDependnet_AR_GCM(profile.Owner.User.firstName,payloadData.SymptomId,8,notification._id)
                   //case of both
                       await sendNotification(userprofile._id,IOS_payload,"IOS",16,payloadData)
                       await sendNotification(userprofile._id,Android_payload,"Android",16,payloadData)
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
       if(profile.Deleted){
        return false;
      }
    
       // get the viewer permissions
       const viewerProfile =await Profile.findOne({
       "Owner.User":id
       })
       
       if(!viewerProfile){
          return false
       }
       if(viewerProfile.Deleted){
        return false
      }
    
       const viewer =await Viewer.findOne({
        ViewerProfile:viewerProfile._id,
        DependentProfile:ProfileID,
        IsDeleted:false
       })
       if(!viewer&&profile.Owner.User._id.toString()!==id){
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


const CompareOldSchedulerWithTheNewScheduler=async(jsonScheduler,OldScheduler)=>{
    if(!jsonScheduler.EndDate){
        jsonScheduler.EndDate=OldScheduler.EndDate
    }
    //compare days Specific days array not that it maybe in the OldScheduler is null and in json scheduler is unddifined and in this case they should be equals
    if(jsonScheduler.SpecificDays&&OldScheduler.SpecificDays){
        if(jsonScheduler.SpecificDays.length!==OldScheduler.SpecificDays.length){
            return false
        }
        for (let i = 0; i < jsonScheduler.SpecificDays.length; i++) {
            if(jsonScheduler.SpecificDays[i]!==OldScheduler.SpecificDays[i]){
                return false
            }

        }
    }else if(jsonScheduler.SpecificDays&&!OldScheduler.SpecificDays){
        return false
    }else if(!jsonScheduler.SpecificDays&&OldScheduler.SpecificDays){
        return false
    }

    
   
    console.log("CompareOldSchedulerWithTheNewScheduler",jsonScheduler,OldScheduler)
    if (new Date(jsonScheduler.StartDate).getTime() !== new Date(OldScheduler.StartDate).getTime() ||
       new Date(jsonScheduler.EndDate).getTime() !== new Date(OldScheduler.EndDate).getTime() ||
        jsonScheduler.AsNeeded !== OldScheduler.AsNeeded ||
        jsonScheduler.ScheduleType !== OldScheduler.ScheduleType ||
        jsonScheduler.DaysInterval !== OldScheduler.DaysInterval 

        ) {
      return false;
    }
    // Compare the dosage array
    if (jsonScheduler.dosage.length !== OldScheduler.dosage.length) {
      return false;
    }
    for (let i = 0; i < jsonScheduler.dosage.length; i++) {
        console.log(jsonScheduler.dosage[i].dose , OldScheduler.dosage[i].dose )
      if (jsonScheduler.dosage[i].dose !== OldScheduler.dosage[i].dose ||
        new Date(jsonScheduler.dosage[i].DateTime).getTime() !== new Date(OldScheduler.dosage[i].DateTime).getTime()) {
        return false;
      }
    }
    return true;



       
  
}

const IsMasterOwnerToThatProfile=async(CallerID,DependentProfile)=>{
    try {
      if(!DependentProfile.MasterUsers){
        return false
      }
      if(!DependentProfile.MasterUsers.includes(mongoose.Types.ObjectId(CallerID))){
        return false
      }
     return true;


    } catch (error) {
        console.log(error)
        return false
    }

}

const GetDosesForProfileID=async(ProfileID,startDate,EndDate)=>{
    try {
        const CallerDoses =await Occurrence.find({
            ProfileID:ProfileID,
            PlannedDateTime:{$gte:startDate,$lt:EndDate},
            isSuspended:false
      
          }).select(
            "PlannedDateTime PlannedDose Status Medication Scheduler MedInfo _id ProfileID"
          ).populate("Scheduler")
          
          return CallerDoses


    } catch (error) {
        console.log(error)
        
    }

}

const GetDosesForListOfProfiles=async(ProfileIDs,startDate,EndDate)=>{
    try {
        const GroupedDoses =await Occurrence.aggregate([
            {
              $match: {
                ProfileID: { $in: ProfileIDs },
                PlannedDateTime: { $gte: startDate, $lt: new Date(+EndDate) },
                isSuspended: false,
              },
            },
            {
              $lookup: {
                from: "profiles",
                localField: "ProfileID",
                foreignField: "_id",
                as: "profile",
              },
            },
            {
              $unwind: "$profile",
            },
            {
              $lookup: {
                from: "users",
                localField: "profile.Owner.User",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $lookup: {
                from: "schedulers",
                localField: "Scheduler",
                foreignField: "_id",
                as: "scheduler",
              },
            },
            {
              $unwind: "$scheduler",
            },
            {
              $group: {
                _id: "$ProfileID",
                doses: {
                  $push: {
                    PlannedDateTime: "$PlannedDateTime",
                    PlannedDose: "$PlannedDose",
                    Status: "$Status",
                    Medication: "$Medication",
                    Scheduler: "$scheduler",
                    MedInfo: "$MedInfo",
                    _id: "$_id",
                   
                  },
                },
                owner: {
                  $first: "$user",
                },
                profile: {
                  $first: "$profile",
                },
              },
            },
            {
              $project: {
                _id: 0,
                ProfileID: "$_id",
                doses: 1,
                owner: {
                  firstName: "$owner.firstName",
                  lastName: "$owner.lastName",
                  email: "$owner.email",
                  img:"$owner.img"
                },
                dependantName: "$profile.dependantName",
              },
            },
          ]);
          return GroupedDoses


    } catch (error) {
        console.log(error)
        
    }

}


const GetDosesForListOfMedications=async(MedicationIDSList,startDate,EndDate)=>{
    try {
        const GroupedDoses =await Occurrence.aggregate([
            {
              $match: {
                Medication: { $in: MedicationIDSList },
                PlannedDateTime: { $gte: startDate, $lt: new Date(+EndDate) },
                isSuspended: false,
              },
            },
            {
              $lookup: {
                from: "profiles",
                localField: "ProfileID",
                foreignField: "_id",
                as: "profile",
              },
            },
            {
              $unwind: "$profile",
            },
            {
              $lookup: {
                from: "users",
                localField: "profile.Owner.User",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $lookup: {
                from: "schedulers",
                localField: "Scheduler",
                foreignField: "_id",
                as: "scheduler",
              },
            },
            {
              $unwind: "$scheduler",
            },
            {
              $group: {
                _id: "$ProfileID",
                doses: {
                  $push: {
                    PlannedDateTime: "$PlannedDateTime",
                    PlannedDose: "$PlannedDose",
                    Status: "$Status",
                    Medication: "$Medication",
                    Scheduler: "$scheduler",
                    MedInfo: "$MedInfo",
                    _id: "$_id",
                   
                  },
                },
                owner: {
                  $first: "$user",
                },
                profile: {
                  $first: "$profile",
                },
              },
            },
            {
              $project: {
                _id: 0,
                ProfileID: "$_id",
                doses: 1,
                owner: {
                  firstName: "$owner.firstName",
                  lastName: "$owner.lastName",
                  email: "$owner.email",
                  img:"$owner.img"
                },
                dependantName: "$profile.dependantName",
              },
            },
          ]);
          return GroupedDoses


    } catch (error) {
        console.log(error)
        
    }

}

const BindNickNameWithDependent=async(DependentsList,NickNameMap)=>{
    try {
       const result=await DependentsList.map(elem=>{
        const clonedObject = JSON.parse(JSON.stringify(elem));
        return {
            ...clonedObject,
            DependentProfileNickName:NickNameMap[clonedObject.ProfileID]
        }
       })
       return result

    } catch (error) {
        console.log(error)
        
    }

}

const BindNickNameWithDependentSymptom=async(DependentsList,NickNameMap)=>{
  try {
     const result=await DependentsList.map(elem=>{
      const clonedObject = JSON.parse(JSON.stringify(elem));
      return {
          ...clonedObject,
          DependentProfileNickName:NickNameMap[clonedObject.Profile]
      }
     })
     return result

  } catch (error) {
      console.log(error)
      
  }

}

const GetSymptomForProfileID=async(ProfileID,startDate,EndDate)=>{
    try {
        const symptoms =await Symptom.find({
            Profile:ProfileID,
            StartedIn:{
              $gte:new Date(+startDate),
              $lte:new Date (+EndDate)
            },
            isDeleted:false
      
          }).select("-User")
          return symptoms


    } catch (error) {
        console.log(error)
        
    }

}

const GetSymptomForProfileIDList=async(ProfileIDsList,startDate,EndDate)=>{
    try {
      const symptoms = await Symptom.aggregate([
        {
          $match: {
            Profile: { $in: ProfileIDsList },
            StartedIn: {
              $gte: new Date(+startDate),
              $lte: new Date(+EndDate)
            },
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: "profiles",
            localField: "Profile",
            foreignField: "_id",
            as: "profile",
          },
        },
        {
          $unwind: "$profile",
        },
        {
          $lookup: {
            from: "users",
            localField: "profile.Owner.User",
            foreignField: "_id",
            as: "user",
          },
         
        },
        {
          $unwind: "$user",
        },
  
        {
          $group: {
            _id: "$Profile",
            Symptoms: {
              $push: {
                StartedIn: "$StartedIn",
                img: "$img",
                Type: "$Type",
                Description: "$Description",
                Severity:"$Severity",
                VoiceRecord:"$VoiceRecord",
                Profile:"$Profile",
                CreatorProfile:"$CreatorProfile",
                EditedBy:"$EditedBy",
                _id: "$_id",
               
              },
            },
            owner: {
              $first: "$user",
            },
            profile: {
              $first: "$profile",
            },
          },
        },
        {
          $project: {
            _id: 0,
            Profile: "$_id",
            Symptoms: 1,
            owner: {
              firstName: "$owner.firstName",
              lastName: "$owner.lastName",
              email: "$owner.email",
              img:"$owner.img"
            },
          },
        },
      ]);
      
    return symptoms

    } catch (error) {
        console.log(error)
        
    }

}

const ReturnProfileFullPermissions=()=>{
  try {
 
    
  return {
  CanRead:true,
  CanAddNewMeds:true,
  CanEditMeds:true,
  CanDeleteMeds:true,
  CanTakeDose:true,
  CanEditSingleDose:true,
  CanAddSingleDose:true,
  CanSuspendDoses:true,
  CanAddSymptom:true,
  CanEditSymptom:true,
  CanDeleteSymptom:true,
  CanManageCareCircle:true,
  CanEditProfile:true
    
  
  }

  } catch (error) {
      console.log(error)
      
  }

}
const ReturnDependentPermissionsProfileLevelTypeB=()=>{
  try {
 
    
    return {
      CanRead:true,
      CanAddNewMeds:false,
      CanEditMeds:false,
      CanDeleteMeds:false,
      CanTakeDose:true,
      CanEditSingleDose:true,
      CanAddSingleDose:true,
      CanSuspendDoses:true,
      CanAddSymptom:true,
      CanEditSymptom:true,
      CanDeleteSymptom:true,
      CanManageCareCircle:false,
      CanEditProfile:false
        
      
      }

  } catch (error) {
      console.log(error)
      
  }

}

const ReturnDependentPermissionsProfileLevelTypeA=()=>{
  try {
 
    
    return {
      CanRead:true,
      CanAddNewMeds:false,
      CanEditMeds:false,
      CanDeleteMeds:false,
      CanTakeDose:false,
      CanEditSingleDose:false,
      CanAddSingleDose:false,
      CanSuspendDoses:false,
      CanAddSymptom:false,
      CanEditSymptom:false,
      CanDeleteSymptom:false,
      CanManageCareCircle:false,
      CanEditProfile:false
        
      
      }

  } catch (error) {
      console.log(error)
      
  }

}

const CheckProfilePermissions=(profile,permission)=>{
  try {
    
    return profile.Permissions[permission]
    
 

  } catch (error) {
      console.log(error)
      
  }

}

const GetBloodGlucoseMeasurementForProfileID=async(ProfileID,startDate,EndDate)=>{
    try {
        const BloodGlucoseMeasurement =await BloodGlucose.find({
            ProfileID:ProfileID,
            PlannedDateTime:{
              $gte:new Date(+startDate),
              $lte:new Date (+EndDate)
            },
            isDeleted:false
      
          }).populate({
            path:"ProfileID",
            select:"firstName lastName img",
            populate:{
              path:"Owner.User",
              select:"firstName lastName img"
            }
          })
          return BloodGlucoseMeasurement


    } catch (error) {
        console.log(error)
        
    }

}

const GetBloodGlucoseForProfileIDList=async(ProfileIDsList,startDate,EndDate)=>{
    try {
      const BloodGlucoseMeasurement = await BloodGlucose.aggregate([
        {
          $match: {
            ProfileID: { $in: ProfileIDsList },
            PlannedDateTime: {
              $gte: new Date(+startDate),
              $lte: new Date(+EndDate)
            },
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: "profiles",
            localField: "ProfileID",
            foreignField: "_id",
            as: "profile",
          },
        },
        {
          $unwind: "$profile",
        },
        {
          $lookup: {
            from: "users",
            localField: "profile.Owner.User",
            foreignField: "_id",
            as: "user",
          },
         
        },
        {
          $unwind: "$user",
        },
  
        {
          $group: {
            _id: "$ProfileID",
            BloodGlucoseMeasurement:{
              $push: {
                ProfileID: "$ProfileID",
                glucoseLevel: "$glucoseLevel",
                MeasurementDateTime: "$MeasurementDateTime",
                MeasurementUnit: "$MeasurementUnit",
                MeasurementNote:"$MeasurementNote",
                MeasurementSource:"$MeasurementSource",
                CreatorProfile:"$CreatorProfile",
                EditedBy:"$EditedBy",
                PlannedDateTime:"$PlannedDateTime",
                Status:"$Status",
                _id: "$_id",
               
              },
            },
            owner: {
              $first: "$user",
            },
            profile: {
              $first: "$profile",
            },
          },
        },
        {
          $project: {
            _id: 0,
            ProfileID: "$_id",
            BloodGlucoseMeasurement: 1,
            owner: {
              firstName: "$owner.firstName",
              lastName: "$owner.lastName",
              email: "$owner.email",
              img:"$owner.img"
            },
          },
        },
      ]);
      
    return BloodGlucoseMeasurement

    } catch (error) {
        console.log(error)
        
    }

}

const isValidEmail=(email)=> {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
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
    CareGiverCanAddSymptoms,
    CompareOldSchedulerWithTheNewScheduler,
    IsMasterOwnerToThatProfile,
    GetDosesForProfileID,
    GetDosesForListOfProfiles,
    GetDosesForListOfMedications,
    BindNickNameWithDependent,
    GetSymptomForProfileID,
    GetSymptomForProfileIDList,
    BindNickNameWithDependentSymptom,
    ReturnProfileFullPermissions,
    CheckProfilePermissions,
    ReturnDependentPermissionsProfileLevelTypeB,
    ReturnDependentPermissionsProfileLevelTypeA,
    isValidEmail,
    GetBloodGlucoseMeasurementForProfileID,
    GetBloodGlucoseForProfileIDList,
    GenerateMeasurementOccurrences,
    GenerateMeasurementOccurrencesWithDays
}
