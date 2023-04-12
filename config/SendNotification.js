const azure = require('azure-sb');
const hubName = process.env.AzureNotificationHubName;
const connectionString = process.env.AzureNotificationHubConnectionString;
const Notification = require('../DB/Schema/Notifications')
const FCM = require('fcm-node')
const serverKey = process.env.FIREBASE_SERVERKEY
const Profile =require('../DB/Schema/Profile')

/**
 * Sends a notification to a user's device.
 * @param {string} profileId - The ID of the user's profile.
 * @param {object} NotificationMessage - The message to send as a notification.
 */
const sendNotification= async(profileId, NotificationMessage)=>{
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

/**
 * Registers an Android device with a profile ID.
 * @deprecated This function is deprecated and should not be used (Only used with azure Notification).
 * @param {string} profileId - The ID of the user's profile.
 * @param {string} deviceToken - The token of the Android device to register.
 * @returns {Promise} A promise that resolves when the device is registered.
 */

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

/**
 * Registers an iOS device with a profile ID.
 * @deprecated This function is deprecated and should not be used (Only used with azure Notification).
 * @param {string} profileId - The ID of the user's profile.
 * @param {string} deviceToken - The token of the iOS device to register.
 * @returns {Promise} A promise that resolves when the device is registered.
 */

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


  /**
 * @deprecated This function is deprecated and should not be used.
 * Deletes a registration with the specified ID and tag.
 * @param {string} registrationId - The ID of the registration to delete.
 * @param {string} tag - The tag of the registration to delete.
 * @returns {Promise} A promise that resolves when the registration is deleted.
 */

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