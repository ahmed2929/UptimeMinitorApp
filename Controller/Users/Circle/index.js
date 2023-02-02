/**
 * @file controller/Circle/index.js
 * @namespace controllers
 * @namespace MedicalCircle
 * 
 */

const SchedulerSchema = require("../../../DB/Schema/Scheduler");
const UserMedication = require("../../../DB/Schema/UserMedication");
const {UploadFileToAzureBlob,GenerateOccurrences,GenerateOccurrencesWithDays,GenerateRandomCode} =require("../../../utils/HelperFunctions")
const Occurrence = require("../../../DB/Schema/Occurrences");
const mongoose = require("mongoose");
const Dependent = require("../../../DB/Schema/DependentUser");
const Invitation =require("../../../DB/Schema/invitations")
const User = require("../../../DB/Schema/User");
const Viewer =require("../../../DB/Schema/Viewers")
const messages = require("../../../Messages/Email/index")
const NotificationMessages=require("../../../Messages/Notifications/index")
const {SendEmailToUser} =require("../../../utils/HelperFunctions")
const {SendPushNotificationToUserRegardlessLangAndOs} =require("../../../utils/HelperFunctions")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");
const Symptom = require("../../../DB/Schema/Symptoms");
const Profile = require("../../../DB/Schema/Profile")
const Permissions = require("../../../DB/Schema/Permissions");
const { populate } = require("../../../DB/Schema/Scheduler");



/**
 * Creates a new dependent user
 * 
 * @function
 * @memberof controllers
 * @memberof MedicalCircle
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.ProfileID - Profile ID of the user
 * @param {string} req.body.firstName - first name of the dependent
 * @param {string} req.body.lastName - last name of the dependent
 * @param {string} req.body.nickName - nick name of the dependent
 * @param {string} req.body.email - email of the dependent
 * @param {string} req.body.phoneNumber - phone number of the dependent
 * @param {string} req.body.countryCode - country code of the dependent
 * 
 * @param {Object} res - Express response object
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

exports.CreateDependentA = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        firstName,
        lastName,
        nickName,
        email,
        phoneNumber,
        countryCode
        
       
      }=req.body
  
        // check if the user has a profile
        const profile = await Profile.findById(ProfileID).populate("Owner.User")
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        if(profile.Deleted){
          return errorResMsg(res, 400, req.t("Profile_not_found"));
        }
  
        // check if the user if the user is the owner of that profile
        if(profile.Owner.User._id.toString() !== id){
            return errorResMsg(res, 400, req.t("Unauthorized"));
        }

        if(profile.Owner.User.email=== email){
          return errorResMsg(res, 400, req.t("you_can_not_add_yourself_as_a_dependent"));
       }
       console.log("usr is  ",profile.Owner.User)
       if(profile.Owner.User.mobileNumber.phoneNumber=== phoneNumber){
        return errorResMsg(res, 400, req.t("you_can_not_add_yourself_as_a_dependent"));
     }

        // check for  email and mobile if it provided
        if(email){
            const emailExist = await User.findOne({
                email:email
            })
            if(emailExist){
                return errorResMsg(res, 400, req.t("email_exist"));
            }
        }
        const mobileNumber ={
            phoneNumber:phoneNumber,
            countryCode:countryCode
        }
        if(mobileNumber){
            const mobileExist = await User.findOne({
                'mobileNumber.phoneNumber':mobileNumber.phoneNumber
            })
            if(mobileExist){
                return errorResMsg(res, 400, req.t("mobile_exist"));
            }
        }
     
      // store the image to azure
      let img;
      if(req.file){
        img = await UploadFileToAzureBlob(req.file)
     }
     
      // create new dependent user
        const newDependent = new Dependent({
            img:img,
            firstName:firstName,
            lastName:lastName,
            nickName:nickName,
            email:email,
            mobileNumber:mobileNumber,
            MasterProfile:ProfileID,
            Status:1
        })
        // create new viewer for the dependent user
        const newViewer = new Viewer({
            ViewerProfile:ProfileID,
            CanWriteDoses:true,
            CanWriteSymptoms:true
            
        })
       // create a new profile for dependent user
         const newProfile = new Profile({
            Owner:{
                User:id,
                Permissions:{
                    Read:true,
                    Write:true,
                }
            },
            AccountType:1,
            Viewers:[{
                viewer:newViewer._id,
                Dependent:newDependent._id

            }]
         })
         // link profile to viewer
            newViewer.DependentProfile = newProfile._id 

       

        // link profile to user
        profile.Dependents.push({
            Profile:newProfile._id,
            AccountType:1,
            Dependent:newDependent._id,
            viewer:newViewer._id
        })
        // save all the data
        await newDependent.save()
        await newProfile.save()
        await newViewer.save()
        await profile.save()
    
        const responseData ={
            ProfileID:newProfile._id,
            firstName,
            lastName,
            nickName,
            email,
            phoneNumber,
            countryCode,
            img
        }
    
        // return successfully response
      return successResMsg(res, 200, {message:req.t("dependentA_created"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };



/**
 * @function
 * @async
 * @memberof controllers
 * @memberof MedicalCircle
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @route POST /CreateDependentB
 *
 * @param {Object} req.body - request body
 * @param {string} req.body.ProfileID - Profile ID of the user
 * @param {string} req.body.firstName - first name of the dependent
 * @param {string} req.body.lastName - last name of the dependent
 * @param {string} req.body.nickName - nick name of the dependent
 * @param {string} req.body.email - email of the dependent
 * @param {string} req.body.phoneNumber - phone number of the dependent
 * @param {string} req.body.countryCode - country code of the dependent
 * 
 * 
 * 
 * @returns {Object} - Returns an object with a success or error message and data
 *
 * @description
  
       * case 2
       * -1 user access this api to create a dependent who has phone
       * -2 email and phone number are required
       * -3 email and phone number are unique
       * -4 if email and phone already registered send invitation
       * -5 if the email and phone does not exist
       *    -create new user 
       *    -crete new profile
       *    -send notification to that user
       *    -generate one time otp for that user
       *    -user uses this otp to enter the app for the first time
       *    -after entering the otp the account is automatically activated
       *    -user generates a new password 
       *    -user accept or reject invitation
       *    -if invitation is sent before return
       *    -if invitation sent and the user is in temp mode return
       *
 *
 * @throws {Error} - if there is an error finding the user's profile
 * @throws {Error} - if the user is not the owner of the profile
 * @throws {Error} - if email or phone number is not provided
 * @throws {Error} - if the email or phone number is already in use
 * @throws {Error} - if there is an error uploading the image to Azure
 * @throws {Error} - if there is an error saving the dependent, profile, or invitation
 * @throws {Error} - if there is an error sending the notification
 */


  exports.CreateDependentB = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        firstName,
        lastName,
        nickName,
        email,
        phoneNumber,
        countryCode
        
       
      }=req.body
      
        // check if the user has a profile
        const profile = await Profile.findById(ProfileID).populate("Owner.User")
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        if(profile.Deleted){
          return errorResMsg(res, 400, req.t("Profile_not_found"));
        }
  
        // check if the user if the user is the owner of that profile
        if(profile.Owner.User._id.toString() !== id){
            return errorResMsg(res, 400, req.t("Unauthorized"));
        }

        // the user can not add himself as a caregiver
        if(profile.Owner.User.email=== email){
          return errorResMsg(res, 400, req.t("you_can_not_add_yourself_as_a_dependent"));
       }

       if(profile.Owner.User.mobileNumber.phoneNumber=== phoneNumber){
        return errorResMsg(res, 400, req.t("you_can_not_add_yourself_as_a_dependent"));
     }

        // check for  email and mobile if it provided
        const mobileNumber={
            phoneNumber:phoneNumber,
            countryCode:countryCode
        }
        if(!(email||mobileNumber.phoneNumber)){
            return errorResMsg(res, 400, req.t("email_or_mobile_required"));
        }

          
      // store the image to azure
      let img;
      if(req.file){
        img = await UploadFileToAzureBlob(req.file)
     }
     
        const user = await User.findOne(
            { "$or": [ { email: email }, { 'mobileNumber.phoneNumber':phoneNumber} ] }
          );
            // if the invitation is sent before return 
            
          // check if user exists and send invitation to that user
          // case user is active
          if (user&&!user.temp) {
            /**
             * user already exists
             * send notification to that user
             */
            // get user profile
            const userprofile = await Profile.findById(user.profile).populate("Owner.User")
            if(!userprofile){
                return errorResMsg(res, 400, req.t("profile_not_found"));
            }
            //check if the invitation sent before

            const invitation =await Invitation.find({
                From:ProfileID,
                To:userprofile._id,
            })

            if(invitation.length>0){
                return errorResMsg(res, 400, req.t("invitation_sent_before"));
            }
            //create dependent user
            const newDependentUser = new Dependent({
                firstName:firstName,
                lastName:lastName,
                nickName:nickName,
                email:email,
                mobileNumber:{
                    countryCode:countryCode,
                    phoneNumber:phoneNumber
                },
                MasterProfile:ProfileID,
                DependentProfile:userprofile._id,
                AccountType:1,
                img
            })
            // create new invitation
            const newInvitation = new Invitation({
                From:ProfileID,
                To:userprofile._id,
                Status:0,
                dependent:newDependentUser._id,
                AccountType:1,

            })

            // save all the data
            await newDependentUser.save()
            await newInvitation.save()

            // send notification to the user using email

            if(userprofile.Owner.User.lang==="en"){
              //  email   
              const invitation = messages.InvitationSentToExistentDependentUser_EN(profile.Owner.User.firstName,firstName);
                await SendEmailToUser(email,invitation)
               }else{
                const invitation = messages.InvitationSentToExistentDependentUser_AR(RestPasswordCode,profile.Owner.User.firstName,firstName);
                await SendEmailToUser(email,invitation)
               }

              
            // send notification to the user using push notification 
            await SendPushNotificationToUserRegardlessLangAndOs(profile,userprofile,"NewInvitationFromCareGiver",{
              Invitation:newInvitation,
              ProfileInfoOfSender:{
                firstName:profile.Owner.User.firstName,
                lastName:profile.Owner.User.lastName,
                img:profile.Owner.User.img,
                email:profile.Owner.User.email,
                ProfileID:profile._id,
              }
            })

            const responseData ={
                ProfileID:userprofile._id,
                firstName,
                lastName,
                nickName,
                email,
                phoneNumber,
                countryCode,
                img,
                AccountType:1,
                Status:0
            }
            return successResMsg(res, 200, {message:req.t("invitation_sent"),data:responseData});




          }

            // case user is not active
            if (user&&user.temp) {
                return errorResMsg(res, 400, req.t("user_is_not_active"));
            }
//******************************************************************* */
                  
            // create new user
            const newUser = new User({
                firstName:firstName,
                lastName:lastName,
                email:email,
                mobileNumber:{
                    countryCode:countryCode,
                    phoneNumber:phoneNumber
                },
                temp:true,
                ShouldRestPassword:true,
                verified:true



            })
            // create new profile for the user
            const newUserProfile = new Profile({
                Owner:{
                    User:newUser._id,
                    Permissions:{
                        Read:true,
                        Write:true,
                    }
                },
                temp:true
            })
            // create a new dependent user
            const newDependentUser = new Dependent({
                firstName:firstName,
                lastName:lastName,
                nickName:nickName,
                email:email,
                mobileNumber:{
                    countryCode:countryCode,
                    phoneNumber:phoneNumber
                },
                MasterProfile:ProfileID,
                DependentProfile:newUserProfile._id,
                AccountType:1,
                img
            })
            // link profiles
            newUser.profile=newUserProfile._id

            // add rest password code and its expiration date

              //send notifications
               let RestPasswordCode = await GenerateRandomCode(6);
               let RestPasswordCode2= await GenerateRandomCode(6)
               const ResetPasswordXpireDate =  Date.now()  + 8.64e+7 ;
               RestPasswordCode+=RestPasswordCode2;
               if(newUser.lang==="en"){
                const invitation = messages.InvitationSentToDependent_EN(RestPasswordCode,profile.Owner.User.firstName,firstName);
                await SendEmailToUser(email,invitation)
               }else{
                const invitation = messages.InvitationSentToDependent_AR(RestPasswordCode,profile.Owner.User.firstName,firstName);
                await SendEmailToUser(email,invitation)
               }
          
          
               newUser.password=RestPasswordCode
               newUser.ResetPasswordXpireDate=ResetPasswordXpireDate;

               // register the invitation
                // create new invitation
            const newInvitation = new Invitation({
                From:ProfileID,
                To:newUserProfile._id,
                Status:0,
                dependent:newDependentUser._id,
                AccountType:1,

            })
                 
             
                // save to db
            await newUser.save()
            await newUserProfile.save()
            await newDependentUser.save()
            await newInvitation.save()
                 
    
        const responseData ={
            ProfileID:newUserProfile._id,
            firstName,
            lastName,
            nickName,
            email,
            phoneNumber,
            countryCode,
            img,
            Status:0,
            AccountType:1,
        }
    
        // return successfully response
      return successResMsg(res, 200, {message:req.t("invitation_sent"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };  


  /**

@function
@memberof controllers
@memberof MedicalCircle

@async
@param {Object} req - Express request object
@param {Object} res - Express response object
@param {Object} req.body - Request body
@description -   

        * accept or reject invitation
       * the invitation is sent from a caregiver
       * the user will be dependent on the caregiver
       * the caregiver will be able to monitor user account with the following permissions
       * "CanWriteMeds": false,
        "CanReadDoses": false,
        "CanWriteDoses": false,
        "CanReadRefile": false,
        "CanReadAllMeds": false,
        "CanReadSymptoms": true,
        "CanAddMeds": true,
        "CanWriteSymptoms": false,
       *
        *-1 change invitation status if it did not change before
        *-2 create a new viewer permission 
        *-3 the viewer wil contains permissions and the caregiver profile and dependent profile
        *-4 add the viewer to the dependent profile in caregiver array
        *-5 add the viewer to the caregiver profile in dependent array
        *   
        * 
@param {String} req.id - ID of the user who is trying to change the invitation status extracted from authorization header .
@param {String} req.body.ProfileID - ID of the profile of the user who is trying to change the invitation status.
@param {Number} req.body.Status - The status of the invitation. 0 for pending, 1 for confirmed, 2 for rejected.
@param {String} req.body.InvitationID - ID of the invitation that is being changed.
@throws {Error} - if there is an error finding the user's profile
@throws {Error} - if there is an error finding the invitation
@throws {Error} - if there is an error finding the master profile
@throws {Error} - if there is an error finding the dependent profile
@returns {Object} - Returns an object containing a message and status code.
*/

  exports.ChangeInvitationStatus = async (req, res) => {
    /**
     
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Status,//0 pending , 1 confirmed ,2 rejected
        InvitationID

        
       
      }=req.body
        // get the invitation
      
        const invitation = await Invitation.findById(InvitationID)
        if(!invitation){
            return errorResMsg(res, 400, req.t("Invitation_not_found"));
        }
        // get the master profile
        const masterProfile = await Profile.findById(mongoose.Types.ObjectId(invitation.From))
        if(!masterProfile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        // get the DependentProfile
        const dependentProfile = await Profile.findById(mongoose.Types.ObjectId(invitation.To))
        if(dependentProfile.Owner.User.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
        if(ProfileID.toString()!=invitation.To.toString()){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
      
        // change the invitation status............................................................
        if(invitation.Status!=0){
            return errorResMsg(res, 400, req.t("invitation_status_changed_before"));
        }
        //rejection case
        if(Status===2){
            invitation.Status=2;
            await invitation.save()
            // return reject confirmation

            return successResMsg(res, 200, {message:req.t("invitation_rejected")});

        }
        //acceptance case
        if(Status===1){
            invitation.Status=1;
            
           
            // create a new viewer for the master profile
            const newViewer = new Viewer({
                ViewerProfile:masterProfile._id,
                DependentProfile:dependentProfile._id
            })
             // add the dependent to the master profile
             masterProfile.Dependents.push({
                Profile:dependentProfile._id,
                Dependent: invitation.dependent,
                viewer:newViewer._id
            })
            // add the master to the dependent profile
            dependentProfile.Viewers.push({
                Dependent:invitation.dependent._id,
                viewer:newViewer._id

            })

             // send notification to the user using push notification 
             await SendPushNotificationToUserRegardlessLangAndOs(dependentProfile,masterProfile,"DependentAcceptedInvitation",{
              Invitation:invitation,
              ProfileInfoOfSender:{
                firstName:dependentProfile.Owner.User.firstName,
                lastName:dependentProfile.Owner.User.lastName,
                img:dependentProfile.Owner.User.img,
                email:dependentProfile.Owner.User.email,
                ProfileID:dependentProfile._id,
              }
            })


            await dependentProfile.save()
            await masterProfile.save()
            await invitation.save()
            await newViewer.save()
            // return accept confirmation
            return successResMsg(res, 200, {message:req.t("invitation_accepted")});

       
        }

        // return error response
        return errorResMsg(res, 400, req.t("invalid_invitation_status"));
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 



/**

@function
@async
@memberof controllers
@memberof MedicalCircle
@param {Object} req - Express request object
@param {Object} res - Express response object
@returns {Object} - API response with status and data
@throws {Error} - If there is any error while executing the function
@description
This function gets invitations based on the provided filter.
The filter can be based on the status, sent, and received parameters.
@param {String} req.id - Id of the logged in user
@param {String} req.query.ProfileID - Id of the profile
@param {String} req.query.Status - Status of the invitation (0: pending, 1: confirmed, 2: rejected)
@param {String} req.query.sent - If true, returns the sent invitations.
@param {String} req.query.received - If true, returns the received invitations.

*/

  exports.getInvitations = async (req, res) => {
    /**
       * get invitations
       * filter it based on the status sent 
       * if no status provided return all the invitations
       * user can choose the filter 
       * sent: returns sent invitations 
       * received:returns received invitations 
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Status,//0 pending , 1 confirmed ,2 rejected
        sent,
        received

       
      }=req.query
        // make sure that the api consumer is authorized
        if(!mongoose.isValidObjectId(ProfileID)){
            return errorResMsg(res, 400, req.t("invalid_profile_id"));
        }
        const profile = await Profile.findById(ProfileID)
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        if(profile.Deleted){
          return errorResMsg(res, 400, req.t("Profile_not_found"));
        }
  
        if(profile.Owner.User.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
        }
        // get the Invitations
        let invitations;
        //default filter with all parameters
        if(sent && received){
          invitations = await Invitation.find({
                $or:[{From:ProfileID},{To:ProfileID}],
                Status:Status||{ $exists:true}
            }).populate("dependent")
        }else if(sent&&!received){
          invitations = await Invitation.find({
                From:ProfileID,
                Status:Status||{ $exists:true}
            }).populate("dependent")
        }else if(received&&!sent){
            console.log("received will run")
            invitations = await Invitation.find({
                To:ProfileID,
                Status:Status||{ $exists:true}
            }).populate({
                path:"From",
                select :'Owner.User',
                populate:{
                    path:"Owner.User",
                    select:'firstName lastName email'
                }
            }).populate({
                path:"permissions.CanReadSpacificMeds.Med",
                select:'name'
            })
        }else{
          invitations = await Invitation.find({
                $or:[{From:ProfileID},{To:ProfileID}],
                Status:Status||{ $exists:true}
            }).populate("dependent")
        }
        responseData=[
            ...invitations
        ]
        // return successful response
        return successResMsg(res, 200, {message:req.t("Invitations"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 



  
/**

@function

@async
@memberof controllers
@memberof MedicalCircle

@param {Object} req - Express request object
@param {string} req.id - user id
@param {string} req.ProfileID. - user ProfileID
@param {Object} res - Express response object

@returns {Object} - array of  object containing the dependents of the user

@description This function is used to get the user dependents. It takes the user's profile ID from the request query,

verifies that the provided ID is a valid ObjectId and that the user is authorized to access the profile, and then

retrieves the dependents of the user from from the viewer collection which dependent profile = the coming profileID .

@throws {400} - When the provided profile ID is not a valid ObjectId or when the user is not authorized to access the profile.

@throws {500} - When there's an error in the server.
*/

  exports.Dependents = async (req, res) => {
    /**
       * get the user dependents 
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
       
      }=req.query
        // make sure that the api consumer is authorized
        if(!mongoose.isValidObjectId(ProfileID)){
            return errorResMsg(res, 400, req.t("invalid_profile_id"));
        }
        const profile = await Profile.findById(ProfileID).populate({
            path:"Dependents.Dependent",
           
          
        }).populate({
            path:"Dependents.viewer",
        }).populate({
          path:"Dependents.Profile",
          select:'Deleted',
      
      
      })
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        if(profile.Deleted){
          return errorResMsg(res, 400, req.t("Profile_not_found"));
        }
  
        if(profile.Owner.User._id.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
        }
       
         
        const filteredData=profile.Dependents.filter((item)=>{
          return !item.Profile.Deleted
        })

        responseData=[
            ...filteredData
        ]
        // return successfully response
        return successResMsg(res, 200, {message:req.t("dependent"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 


/**

Add a new caregiver to a user's profile
@function
@async
@memberof controllers
@memberof MedicalCircle

@param {Object} req - Express request object
@param {string} req.id - user id
@param {string} req.body.ProfileID - ProfileID
@param {string} req.body.email - email
@param {string} req.body.phoneNumber - phoneNumber
@param {string} req.body.countryCode - countryCode
@param {Object} req.body.permissions - permissions object  "permissions": {
    "CanWriteMeds": false,
    "CanReadDoses": false,
    "CanWriteDoses": false,
    "CanReadRefile": false,
    "CanReadAllMeds": false,
    "CanReadSymptoms": true,
    "CanAddMeds": true,
    "CanWriteSymptoms": false,
    "CanReadSpacificMeds": [
      {
        "Med": "63b69329424603fd6128b72c",
        "CanRead": true,
        "CanWrite": true,
        "CanReadDoses": true,
        "CanReadRefile": true,
        "CanWriteRefile": false,
        "CanWriteDoses": false
      }
    ],
    "notify": true
  }
@param {Object} req - Express request object

@param {Object} res - Express response object
@throws {Error} When something went wrong with the request or the server
@returns {Object} - status code, message and data
@description
-1 user access this api to add a caregiver
-2 user should provide care giver mobile or email
-3 if the care giver already exist send him invitation
-4 if he does not exist create him a new profile and send him an invitation

*/





  exports.AddCareGiver = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        email,
        phoneNumber,
        countryCode,
        permissions
        
       
      }=req.body
      
        // check if the user has a profile
        const profile = await Profile.findById(ProfileID).populate("Owner.User")
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        if(profile.Deleted){
          return errorResMsg(res, 400, req.t("Profile_not_found"));
        }
  
       // check if the user if the user is the owner of that profile
        if(profile.Owner.User._id.toString() !== id){
            return errorResMsg(res, 400, req.t("Unauthorized"));
        }

        // the user can not add himself as a caregiver
        if(profile.Owner.User.email=== email){
           return errorResMsg(res, 400, req.t("you_can_not_add_yourself_as_a_caregiver"));
        }

        if(profile.Owner.User.mobileNumber.phoneNumber=== phoneNumber){
          return errorResMsg(res, 400, req.t("you_can_not_add_yourself_as_a_caregiver"));
       }

        // check for  email and mobile if it provided
        const mobileNumber={
            phoneNumber:phoneNumber,
            countryCode:countryCode
        }
        if(!(email||mobileNumber.phoneNumber)){
            return errorResMsg(res, 400, req.t("email_or_mobile_required"));
        }

          
        const user = await User.findOne(
            { "$or": [ { email: email }, { 'mobileNumber.phoneNumber':phoneNumber} ] }
          );
            // if the invitation is sent before return 
            
          // if no user found return 
          if (!user) {
            return errorResMsg(res, 400, req.t("caregiver_not_registered"));

        }
        
            /**
             * user already exists
             * send notification to that user
             */
            // get user profile 
            const CareGiverprofile = await Profile.findById(user.profile).populate("Owner.User")
            if(!CareGiverprofile){
                return errorResMsg(res, 400, req.t("profile_not_found"));
            }
            if(CareGiverprofile.Deleted){
              return errorResMsg(res, 400, req.t("Profile_not_found"));
            }
            //check if the invitation sent before

            const invitation =await Invitation.find({
                From:ProfileID,
                To:CareGiverprofile._id,
            })

            if(invitation.length>0){
                return errorResMsg(res, 400, req.t("invitation_sent_before"));
            }
            //create dependent user
            const newDependentUser = new Dependent({
                firstName:user.firstName,
                lastName:user.lastName,
                nickName:'',
                email:email,
                mobileNumber:{
                    countryCode:countryCode,
                    phoneNumber:phoneNumber
                },
                MasterProfile:CareGiverprofile._id,
                DependentProfile:ProfileID,
                AccountType:2,
                img:user.img,
               
            })
            let CanReadSpacificMeds;
            if(permissions.CanReadAllMeds){
              CanReadSpacificMeds=null
            }else{
              CanReadSpacificMeds=permissions.CanReadSpacificMeds
            }
            // create new invitation
            const newInvitation = new Invitation({
                From:ProfileID,
                To:CareGiverprofile._id,
                Status:0,
                dependent:newDependentUser._id,
                permissions:{
                   ... permissions,
                   CanReadSpacificMeds,
                },
                AccountType:2

            })

            // save all the data
            await newDependentUser.save()
            await newInvitation.save()

            // send notification to the user

            if(CareGiverprofile.Owner.User.lang==="en"){
                const invitation = messages.InvitationSentToExistentCareGiverUser_EN(profile.Owner.User.firstName,user.firstName);
                await SendEmailToUser(email,invitation)
               }else{
                const invitation = messages.InvitationSentToExistentCareGiverUser_AR(RestPasswordCode,profile.Owner.User.firstName,user.firstName);
                await SendEmailToUser(email,invitation)
               }

               await SendPushNotificationToUserRegardlessLangAndOs(profile,CareGiverprofile,"NewInvitationFromDependent",{
                Invitation:newInvitation,
                ProfileInfoOfSender:{
                  firstName:profile.Owner.User.firstName,
                  lastName:profile.Owner.User.lastName,
                  img:profile.Owner.User.img,
                  email:profile.Owner.User.email,
                  ProfileID:profile._id,
                }
              })

            const responseData ={
                CareGiverProfileID:CareGiverprofile._id,
                firstName:user.firstName,
                lastName:user.lastName,
                nickName:user.nickName,
                email:user.email,
                phoneNumber:user.mobileNumber.phoneNumber,
                countryCode:user.mobileNumber.countryCode,
                img:user.img,
                AccountType:2,
                Status:0
            }
            return successResMsg(res, 200, {message:req.t("invitation_sent"),data:responseData});
       
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };  




   /**

@function
@memberof controllers
@memberof MedicalCircle

@async
@param {Object} req - Express request object
@param {Object} res - Express response object
@param {Object} req.body - Request body
@description -   

        * accept or reject invitation
       * the invitation is sent from a dependent
       * the user will be a caregiver on the dependent
       * the caregiver will be able to monitor user account with the a specified  permissions in the invitation document
       * 
       *
        *-1 change invitation status if it did not change before
        *-2 create a new viewer permission 
        *-3 the viewer wil contains permissions and the caregiver profile and dependent profile
        *-4 add the viewer to the dependent profile in caregiver array
        *-5 add the viewer to the caregiver profile in dependent array
        *   
        * 
@param {String} req.id - ID of the user who is trying to change the invitation status extracted from authorization header .
@param {String} req.body.ProfileID - ID of the profile of the user who is trying to change the invitation status.
@param {Number} req.body.Status - The status of the invitation. 0 for pending, 1 for confirmed, 2 for rejected.
@param {String} req.body.InvitationID - ID of the invitation that is being changed.
@throws {Error} - if there is an error finding the user's profile
@throws {Error} - if there is an error finding the invitation
@throws {Error} - if there is an error finding the master profile
@throws {Error} - if there is an error finding the dependent profile
@returns {Object} - Returns an object containing a message and status code.
*/


  exports.ChangeInvitationStatusToAcceptDependent = async (req, res) => {
    /**
       * 
       * 
       *
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Status,//0 pending , 1 confirmed ,2 rejected
        InvitationID

        
       
      }=req.body
        // get the invitation
        const invitation = await Invitation.findById(InvitationID)
        if(!invitation){
            return errorResMsg(res, 400, req.t("Invitation_not_found"));
        }
        // get the caregiver profile
        const CareGiverProfile = await Profile.findById(mongoose.Types.ObjectId(invitation.To))
        if(!CareGiverProfile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        // get the DependentProfile
        const dependentProfile = await Profile.findById(mongoose.Types.ObjectId(invitation.From))
        if(CareGiverProfile.Owner.User.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
        if(ProfileID.toString()!=invitation.To.toString()){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
        if(invitation.Status!=0){
            return errorResMsg(res, 400, req.t("invitation_status_changed_before"));
        }
        // change the invitation status............................................................
        //rejection case
        if(Status===2){
            invitation.Status=2;
            await invitation.save()
            // return reject confirmation

            return successResMsg(res, 200, {message:req.t("invitation_rejected")});

        }
        //acceptance case
        if(Status===1){
            invitation.Status=1;
            
              //get careGiver permissions
              const permissions = {
                ... invitation.permissions
             }
          
               // create new viewer
               const newViewer = new Viewer({
                ViewerProfile:CareGiverProfile._id,
                DependentProfile:dependentProfile._id,
                ...permissions

            })

            // add the dependent to the master profile
            CareGiverProfile.Dependents.push({
                Profile:dependentProfile._id,
                Dependent: invitation.dependent,
                viewer:newViewer._id
            })
          
            // add the master to the dependent profile
            dependentProfile.Viewers.push({
                viewer:newViewer._id,
                Dependent:invitation.dependent

            })
            // save all the data
            await newViewer.save()
            await dependentProfile.save()
            await CareGiverProfile.save()
            await invitation.save()
            // return accept confirmation

            await SendPushNotificationToUserRegardlessLangAndOs(CareGiverProfile,dependentProfile,"CareGiverAcceptedInvitation",{
              Invitation:invitation,
              ProfileInfoOfSender:{
                firstName:CareGiverProfile.Owner.User.firstName,
                lastName:CareGiverProfile.Owner.User.lastName,
                img:CareGiverProfile.Owner.User.img,
                email:CareGiverProfile.Owner.User.email,
                ProfileID:CareGiverProfile._id,
              },
            })

            return successResMsg(res, 200, {message:req.t("invitation_accepted")});

       
        }

        // return error response
        return errorResMsg(res, 400, req.t("invalid_invitation_status"));
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 





  /**

@function

@async
@memberof controllers
@memberof MedicalCircle

@param {Object} req - Express request object
@param {string} req.id - user id
@param {string} req.ProfileID. - user ProfileID
@param {Object} res - Express response object

@returns {Object} - array of  object containing the caregivers of the user

@description This function is used to get the user caregivers. It takes the user's profile ID from the request query,

verifies that the provided ID is a valid ObjectId and that the user is authorized to access the profile, and then

retrieves the dependents of the user from the viewer collection which master profile = the coming profileID .

@throws {400} - When the provided profile ID is not a valid ObjectId or when the user is not authorized to access the profile.

@throws {500} - When there's an error in the server.
*/

  exports.CareGiver = async (req, res) => {
    /**
       * get the user caregivers 
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
       
      }=req.query
        // make sure that the api consumer is authorized
        if(!mongoose.isValidObjectId(ProfileID)){
            return errorResMsg(res, 400, req.t("invalid_profile_id"));
        }
        const profile = await Profile.findById(ProfileID).populate({
            path: 'Viewers.viewer',
            
            populate: {
                path: 'ViewerProfile',
                select:'User Deleted',
                populate:{
                    path:'Owner.User',
                    select:'firstName lastName nickName img email mobileNumber'
                }
            }
            
          })
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        if(profile.Deleted){
          return errorResMsg(res, 400, req.t("Profile_not_found"));
        }
  
        if(profile.Owner.User._id.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
        }
       
        // get user profile dependents
        
        const filteredData=profile.Viewers.filter(elem=>{
          return !elem.viewer.ViewerProfile.Deleted
        })

        responseData=[
            ...filteredData
        ]
        // return sucess response
        return successResMsg(res, 200, {message:req.t("caregivers"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 


  
  /**

@function
EditCareGiverPermissions
@async
@memberof controllers
@memberof MedicalCircle

@param {Object} req - Express request object
@param {string} req.id - user id
@param {string} req.ProfileID. - user ProfileID
@param {string} req.ViewerID. - ViewerID represents relationship id 
@param {Object} req.Permissions - the updated Permissions (if the value is null the value will not be set)
eg
Permissions=
  {
    "CanWriteMeds": false,
    "CanReadDoses": false,
    "CanWriteDoses": false,
    "CanReadRefile": false,
    "CanReadAllMeds": false,
    "CanReadSymptoms": true,
    "CanAddMeds": true,
    "CanWriteSymptoms": false,
    "CanReadSpacificMeds": [
      {
        "Med": "63b69329424603fd6128b72c",
        "CanRead": true,
        "CanWrite": true,
        "CanReadDoses": true,
        "CanReadRefile": true,
        "CanWriteRefile": false,
        "CanWriteDoses": false
      }
    ],
    "notify": true
  
}
@param {Object} res - Express response object

@returns {Object} - array of  object containing the caregivers of the user

@description This function is used to update caregiver permissions

@throws {400} - When the provided profile ID is not a valid ObjectId or when the user is not authorized to access the profile.
@throws {400} - When the provided ViewerID is not found
@throws {500} - When there's an error in the server.
*/

exports.EditCareGiverPermissions = async (req, res) => {
  /**
     *  EditCareGiverPermission
     */

  try {

   const {id} =req.id
    const {
      ProfileID,
      ViewerID,
      Permissions
    }=req.body

    /**
     * permissions eg
     * 
     *  "permissions": {
    "CanWriteMeds": false,
    "CanReadDoses": false,
    "CanWriteDoses": false,
    "CanReadRefile": false,
    "CanReadAllMeds": false,
    "CanReadSymptoms": true,
    "CanAddMeds": true,
    "CanWriteSymptoms": false,
    "CanReadSpacificMeds": [
      {
        "Med": "63b69329424603fd6128b72c",
        "CanRead": true,
        "CanWrite": true,
        "CanReadDoses": true,
        "CanReadRefile": true,
        "CanWriteRefile": false,
        "CanWriteDoses": false
      }
    ],
    "notify": true
  }
     * 
     */


      // make sure that the api consumer is authorized
      if(!mongoose.isValidObjectId(ProfileID)){
          return errorResMsg(res, 400, req.t("invalid_profile_id"));
      }
      const profile = await Profile.findById(ProfileID)
      if(!profile){
          return errorResMsg(res, 400, req.t("profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }

      if(profile.Owner.User._id.toString()!=id){
          return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
      }
     
      // get the relationship 
      const relationship = await Viewer.findOne({
        DependentProfile:ProfileID,
        _id:ViewerID,
        IsDeleted:false
      })
      
      if(!relationship){
        return errorResMsg(res, 400, req.t("relationship_not_found"));
      }
      // update the relationship
      relationship.CanWriteMeds=Permissions.CanWriteMeds||relationship.CanWriteMeds
      relationship.CanReadDoses=Permissions.CanReadDoses||relationship.CanReadDoses
      relationship.CanWriteDoses=Permissions.CanWriteDoses||relationship.CanWriteDoses
      relationship.CanReadRefile=Permissions.CanReadRefile||relationship.CanReadRefile
      relationship.CanReadAllMeds=Permissions.CanReadAllMeds||relationship.CanReadAllMeds
      relationship.CanReadSymptoms=Permissions.CanReadSymptoms||relationship.CanReadSymptoms
      relationship.CanAddMeds=Permissions.CanAddMeds||relationship.CanAddMeds
      relationship.CanWriteSymptoms=Permissions.CanWriteSymptoms||relationship.CanWriteSymptoms
      relationship.CanReadSpacificMeds=Permissions.CanReadSpacificMeds||relationship.CanReadSpacificMeds
      relationship.notify=Permissions.notify||relationship.notify
     
     
      // save changes
      await relationship.save()

     
     

      // return successful response
      return successResMsg(res, 200, {message:req.t("Permission_Updated_Successfully"),data:relationship});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
}; 

  


 /**

@function
deleteCareGiverPermissions
@async
@memberof controllers
@memberof MedicalCircle

@param {Object} req - Express request object
@param {string} req.id - user id
@param {string} req.ProfileID. - user ProfileID
@param {string} req.ViewerID. - ViewerID represents relationship id 
@param {Object} res - Express response object

@returns {Object} - success message with the deleted document

@description This function is used to delete caregiver Permissions

@throws {400} - When the provided profile ID is not a valid ObjectId or when the user is not authorized to access the profile.
@throws {400} - When the provided ViewerID is not found
@throws {500} - When there's an error in the server.
*/

exports.DeleteCareGiverPermissions = async (req, res) => {
  /**
     *  deleteCareGiverPermission
     */

  try {

   const {id} =req.id
    const {
      ProfileID,
      ViewerID,
      
    }=req.body

   

      // make sure that the api consumer is authorized
      if(!mongoose.isValidObjectId(ProfileID)){
          return errorResMsg(res, 400, req.t("invalid_profile_id"));
      }
      const profile = await Profile.findById(ProfileID)
      if(!profile){
          return errorResMsg(res, 400, req.t("profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }

      if(profile.Owner.User._id.toString()!=id){
          return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
      }
     
      // get the relationship 
      const relationship = await Viewer.findOne({
        DependentProfile:ProfileID,
        _id:ViewerID,
        IsDeleted:false
      })
      console.log("relationship",relationship)
      
      if(!relationship){
        return errorResMsg(res, 400, req.t("relationship_not_found"));
      }
      // flag the relationship as deleted
      relationship.IsDeleted=true

      // delete the viewer object which its viewer === ViewerID for dependent profile in the Viewer array
     
      profile.Viewers=profile.Viewers.filter(obj=>obj.viewer.toString()!=ViewerID)
    
      // delete the viewer object from dependent which its viewer === ViewerID from caregiver profile
      const caregiverProfile=await Profile.findById(relationship.ViewerProfile.toString())
      caregiverProfile.Dependents=caregiverProfile.Dependents.filter(obj=>obj.viewer.toString()!=ViewerID)
      // save changes
      await caregiverProfile.save()
      await profile.save()
      await relationship.save()
      // return successful response
      return successResMsg(res, 200, {message:req.t("Caregiver_Deleted_Successfully"),data:relationship});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
}; 


 /**

@function
DeleteDependent
@async
@memberof controllers
@memberof MedicalCircle

@param {Object} req - Express request object
@param {string} req.id - user id
@param {string} req.ProfileID. - user ProfileID
@param {string} req.ViewerID. - ViewerID represents relationship id 
@param {Object} res - Express response object

@returns {Object} - success message with the deleted document

@description This function is used to delete dependent

@throws {400} - When the provided profile ID is not a valid ObjectId or when the user is not authorized to access the profile.
@throws {400} - When the provided ViewerID is not found
@throws {500} - When there's an error in the server.
*/

exports.DeleteDependent = async (req, res) => {
  /**
     *  DeleteDependent
     */

  try {

  const {id} =req.id
    const {
      ProfileID,
      ViewerID,
      
    }=req.body

   

      // make sure that the api consumer is authorized
      if(!mongoose.isValidObjectId(ProfileID)){
          return errorResMsg(res, 400, req.t("invalid_profile_id"));
      }
      const profile = await Profile.findById(ProfileID)
      if(!profile){
          return errorResMsg(res, 400, req.t("profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }

      if(profile.Owner.User._id.toString()!=id){
          return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
      }
     
      // get the relationship 
      const relationship = await Viewer.findOne({
        ViewerProfile:ProfileID,
        _id:ViewerID,
        IsDeleted:false
      })
      console.log("relationship",relationship)
      
      if(!relationship){
        return errorResMsg(res, 400, req.t("relationship_not_found"));
      }
      // flag the relationship as deleted
      relationship.IsDeleted=true
      // delete the dependent from caregiver profile
     
      profile.Dependents=profile.Dependents.filter(obj=>obj.viewer.toString()!=ViewerID)
    
      // delete caregiver form dependent profile
      const DependentProfile=await Profile.findById(relationship.DependentProfile.toString())
      DependentProfile.Viewers=DependentProfile.Viewers.filter(obj=>obj.viewer.toString()!=ViewerID)
      // save changes
      await DependentProfile.save()
      await profile.save()
      await relationship.save()
      // return successful response
      return successResMsg(res, 200, {message:req.t("Dependent_Deleted_Successfully"),data:relationship});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
}; 


 /**

@function
Cancel invitation if it is still pending
@async
@memberof controllers
@memberof MedicalCircle

@param {Object} req - Express request object
@param {string} req.id - user id
@param {string} req.ProfileID. - user ProfileID
@param {string} req.InvitationID. - InvitationID
@param {Object} res - Express response object

@returns {Object} - success message 

@description This function is used to delete invitation

@throws {400} - When the provided profile ID is not a valid ObjectId or when the user is not authorized to access the profile.
@throws {400} - When the provided invitation is not found
@throws {500} - When there's an error in the server.
*/

exports.DeleteInvitation = async (req, res) => {
  /**
     *  DeleteDependent
     */

  try {

   const {id} =req.id
    const {
      ProfileID,
      InvitationID,
      
    }=req.body

   

      // make sure that the api consumer is authorized
      if(!mongoose.isValidObjectId(ProfileID)){
          return errorResMsg(res, 400, req.t("invalid_profile_id"));
      }
      const profile = await Profile.findById(ProfileID)
      if(!profile){
          return errorResMsg(res, 400, req.t("profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }

      if(profile.Owner.User._id.toString()!=id){
          return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
      }
     
      // get the invitation
      const invitation = await Invitation.findOneAndDelete({
        _id:InvitationID,
        From:ProfileID,
        Status:0 // still pending
      })
      
      
      if(!invitation){
        return errorResMsg(res, 400, req.t("Invitation_can_not_be_deleted"));
      }

      return successResMsg(res, 200, {message:req.t("Invitation_deleted_Successfully"),data:invitation});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
}; 

