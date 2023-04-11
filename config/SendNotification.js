const azure = require('azure-sb');
const hubName = process.env.AzureNotificationHubName;
const connectionString = process.env.AzureNotificationHubConnectionString;
const Notification = require('../DB/Schema/Notifications')
const FCM = require('fcm-node')
const serverKey = process.env.FIREBASE_SERVERKEY
const Profile =require('../DB/Schema/Profile')
// const admin = require('firebase-admin');

// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
// });


// const sendNotification= async(profileId, message,pns)=>{
//   console.log("sendNotification",profileId,message,pns);
//     // pns is device os
//     profileId=profileId.toString()
//     console.log("sendNotification",profileId,message,pns);

 




//   // Create a NotificationHubClient
  
//   const notificationHubService = azure.createNotificationHubService(hubName, connectionString);

//   // // Build the iOS payload
//   // const iosPayload = {
//   //   apns: {
//   //       aps: {
//   //           alert: message
//   //       }
//   //   }
//   // };

//   // // Build the Android payload
//   // const androidPayload = {
//   //   gcm: {
//   //       notification: {
//   //           title: message
//   //       }
//   //   }
//   // };
//   return new Promise((resolve,reject)=>{
//     console.log("send notification runs")
//     const tag = profileId;

//     if(pns==="IOS"){
    
//       notificationHubService.apns.send(tag,message, (error,result)=>{
//         if(!error){
//         console.log(`iOS Notification sent to ${result} devices`);
//         resolve(result);
//         }
//         else{
//           console.log(error);
//           reject(error);
//         }
//       });
//     }else if(pns==="Android"){
//       console.log("Android tag",tag)
//       notificationHubService.gcm.send(tag,message,(error,result)=>{
//         if(!error){
//         console.log("result",result)
          
//         console.log(`Android Notification sent to ${result.targetCount} devices`);
//         resolve(result);
//         }
//         else{
//           console.log(error);
//           reject(error);
//         }
//       });
//     }else{
//         resolve("no device os found")
//     }
//   })
  
  
// }
/************************************** */

const sendNotification= async(profileId, NotificationMessage,pns)=>{
  const fcm =new FCM(serverKey)
  const profile = await Profile.findById(profileId)
  //loop to send notification to all tokens
  
  for await ({DeviceToken} of profile.NotificationInfo.DevicesTokens){
    console.log(DeviceToken)
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: DeviceToken, 
     ...NotificationMessage
      
     
  }
  console.log(message)
  
  fcm.send(message, function(err, response){
      if (err) {
          console.log("Something has gone wrong!")
      } else {
          console.log("Successfully sent with response: ", response)
      }
  })
  
    

 }
 
  
}

/************************************** */
const RegisterAndroidDevice= async (profileId, deviceToken)=>{
  // Create a NotificationHubClient
  const notificationHubService = azure.createNotificationHubService(hubName, connectionString);

  // Register the device with the profile ID
  return new Promise((resolve,reject)=>{

      notificationHubService.gcm.createNativeRegistration(deviceToken,[profileId],(error,result)=>{
          if(!error){
          console.log(`Device with token ${deviceToken} registered with profile ID ${profileId}`);
          resolve(result);
          }
          else{
          console.log(error);
          reject(error);
          }
      })
  })
}

  const RegisterIOSDevice= async (profileId, deviceToken)=>{
    // Create a NotificationHubClient
   

    const notificationHubService = azure.createNotificationHubService(hubName, connectionString);
    
  // Register the device with the profile ID
  return new Promise((resolve,reject)=>{
    notificationHubService.apns.createNativeRegistration(deviceToken, [profileId],(error,result)=>{
      if(!error){
        console.log(`Device with token ${deviceToken} registered with profile ID ${profileId}`);
        resolve(result);
      }
      else{
        console.log(error);
        reject(error);
      }
    })
  })
 
  }

  const DeleteRegistration= async (registrationId, tag)=>{
    // Create a NotificationHubClient
   

    const notificationHubService = azure.createNotificationHubService(hubName, connectionString);
    
  // Register the device with the profile ID
  return new Promise((resolve,reject)=>{
  

notificationHubService.deleteRegistration(registrationId, tag, function (error,result) {
  if (!error) {
    console.log(`Tag "${tag}" successfully unregistered`);
    resolve(result);
  }else{
    console.log(error);
    reject(error);
  }
});


  })
 
  }



module.exports = {
sendNotification,
RegisterAndroidDevice,
RegisterIOSDevice,
DeleteRegistration

};