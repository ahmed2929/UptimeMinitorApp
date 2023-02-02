const azure = require('azure-sb');
const hubName = process.env.AzureNotificationHubName;
const connectionString = process.env.AzureNotificationHubConnectionString;
const Notification = require('../DB/Schema/Notifications')
const sendNotification= async(profileId, payload,pns)=>{
    // pns is device os
    profileId=profileId.toString()
    console.log("sendNotification",profileId,payload,pns);

 




  // Create a NotificationHubClient
  
  const notificationHubService = azure.createNotificationHubService(hubName, connectionString);

  // // Build the iOS payload
  // const iosPayload = {
  //   apns: {
  //       aps: {
  //           alert: message
  //       }
  //   }
  // };

  // // Build the Android payload
  // const androidPayload = {
  //   gcm: {
  //       notification: {
  //           title: message
  //       }
  //   }
  // };
  return new Promise((resolve,reject)=>{
    if(pns==="IOS"){
      const iosTags = [profileId];
      notificationHubService.send(payload, iosTags, (error,result)=>{
        if(!error){
        console.log(`iOS Notification sent to ${result.targetCount} devices`);
        resolve(result);
        }
        else{
          console.log(error);
          reject(error);
        }
      });
    }else if(pns==="Android"){
      const androidTags = [profileId];
      notificationHubService.send(payload, androidTags, (error,result)=>{
        if(!error){
        console.log(`Android Notification sent to ${result.targetCount} devices`);
        resolve(result);
        }
        else{
          console.log(error);
          reject(error);
        }
      });
    }else{
        resolve("no device os found")
    }
  })
  
  
}

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