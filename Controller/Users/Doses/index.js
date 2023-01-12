
/**
 * @file controller/Doses/index.js
 * @namespace controllers
 * @namespace Doses
 * 
 */

const SchdulerSchema = require("../../../DB/Schema/Schduler");
const UserMedcation = require("../../../DB/Schema/UserMedcation");
const Occurance = require("../../../DB/Schema/Occurances");
const Viewer =require("../../../DB/Schema/Viewers")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");
const Profile = require("../../../DB/Schema/Profile")




/**
 * EditSingleDose
 * 
 * @function
 * @memberof controllers
 * @memberof Doses
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.ProfileID - Profile ID of the user
 * @param {string} req.body.occuraceId - occuraceId
 * @param {string} req.body.MedInfo - {
        "strenth":25,
        "unit":"mg",
        "quantity":6,
        "instructions":"edited",
        "condition":"edit2",
        "type":"injection",
        "name":"edit"

    }
 * @param {string} req.body.PlannedDateTime - in ms format
 * @param {string} req.body.PlannedDose - eg:num of pills
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * 
 * 
 * @returns {Object} - Returns the edited dose
 * @description 
 *     edit singleDose
     * -this api should be called when user needs to edit singleDose
     * -the caller must be the med creator or has a permission
     * occurrenceId is required
     * - data to be edit
     * ********************************
     * logic
     * ********************************
     * 1- make sure that the caller is the med creator
     * 2- make sure that the med id and schedule id is valid
     * 3- retrieved the occurrence and edit
     * 
     * 
       
 * 
 */

exports.EditSingleDose=async (req, res) => {

   
    try {
  
      const {id} =req.id
      let {
      occuraceId,
      MedInfo,
      PlannedDateTime,
      PlannedDose,
      ProfileID
      }=req.body
  
      
  
      
      const oldOccurance=await Occurance.findById(occuraceId)
      if(!oldOccurance){
        return errorResMsg(res, 400, req.t("invalid_occurence_id"));
      }
  
       /*
      
      check permission 
      
      */
  
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID
      })
  
      if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
  
      // check if the user is the owner and has write permission or can add meds
  
      if(profile.Owner.User.toString()!=id){
        // check if the user has add med permission
        const hasWritePermissonToAllMeds=viewer.CanWriteDoses;
        // check CanReadSpacificMeds array inside viewer for the CanWrite permission for that MedID
        const hasWritePermissonToThatDose=viewer.CanReadSpacificMeds.find((med)=>{
          if(med.Med.toString()===oldOccurance.Medication.toString()){
            return med.CanWriteDoses
          }
        }) 
        if(!(hasWritePermissonToThatDose||hasWritePermissonToAllMeds)){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        
      }
      //case the owner dont has write permission
      if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
  
  
      // start edit occurance
      
      // update 
      oldOccurance.PlannedDateTime=PlannedDateTime||oldOccurance.PlannedDateTime
      oldOccurance.PlannedDose=PlannedDose||oldOccurance.PlannedDose
      oldOccurance.MedInfo={
        strenth:MedInfo.strenth||oldOccurance.MedInfo.strenth,
        unit:MedInfo.unit||oldOccurance.MedInfo.unit,
        quantity:MedInfo.quantity||oldOccurance.MedInfo.quantity,
        instructions:MedInfo.instructions||oldOccurance.MedInfo.instructions,
        condition:MedInfo.condition||oldOccurance.MedInfo.condition,
        type:MedInfo.type||oldOccurance.MedInfo.type,
        name:MedInfo.name||oldOccurance.MedInfo.name,
        ScheduleType:MedInfo.ScheduleType||oldOccurance.MedInfo.ScheduleType,
        
      }
      oldOccurance.EditedBy=viewerProfile._id
      await oldOccurance.save()
      
      // return succesfull response
      return successResMsg(res, 200, {message:req.t("Occurance_Updated")});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
 
/**
 * suspend Dose
 * 
 * @function
 * @memberof controllers
 * @memberof Doses
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.ProfileID - Profile ID of the user
 * @param {string} req.body.SchdulerId - scheduler id 
 * @param {string} req.body.StartDate -start date in ms format
 * @param {string} req.body.EndDate -EndDate date in ms format
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission 
 * 
 * 
 * @returns {Object} - Returns success message
 * @description 
 *    suspend doses form date to date
     * ********************************
     * logic
     * ********************************
     * -1 retrieve all occurrences form date to date
     * -2 flag it as suspended
     * -3 if the user has a permission to do this action
     * 
       
 * 
 */


  exports.SuspendDoses=async (req, res) => {
  
  
    try {
  
      const {id} =req.id
      let {
      SchdulerId,
      StartDate,
      EndDate,
      ProfileID
      }=req.body
  
      // check for permison
      const schduler =await SchdulerSchema.findById(SchdulerId)
      if(!schduler){
        return errorResMsg(res, 400, req.t("Schduler_not_found"));
      }
        /*
      
      check permission 
      
      */
  
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID
      })
  
      if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      // check if the user is the owner and has write permission or can add meds
  
      if(profile.Owner.User.toString()!=id){
        // check if the user has add med permission
        const hasWritePermissonToThatMed=viewer.CanWriteMeds;
        // check CanReadSpacificMeds array inside viewer for the CanWrite permission for that MedID
        const hasWritePermissonToThatDose=viewer.CanReadSpacificMeds.find((med)=>{
          if(med.Med.toString()===schduler.medication.toString()){
            return med.CanWrite
          }
        }) 
        if(!(hasWritePermissonToThatDose||hasWritePermissonToThatMed)){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        
      }
      //case the owner dont has write permission
      if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
  
  
      
      //retrive all the occurences between two dates and mark them as suspended
  
      await Occurance.updateMany({
        Schduler:SchdulerId,
        PlannedDateTime:{$gte:StartDate,$lte:EndDate},
      
      },{
        isSuspended:true
      })
      // return succesfull response
      return successResMsg(res, 200, {message:req.t("Dose_suspended")});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
  
  /**
 * change Dose status
 * 
 * @function
 * @memberof controllers
 * @memberof Doses
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.ProfileID - Profile ID of the user
 * @param {string} req.body.OccuranceId - occurrence id 
 * @param {string} req.body.Status -2 confirmed 4 rejected
 * @param {string} req.body.EndDate -EndDate date in ms format
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission 
 * 
 * 
 * @returns {Object} - Returns success message
 * @description 
 *    change dose status
     * ********************************
     * logic
     * ********************************
     * -1 get dose by id
     * -2 change its status to the new one
     * **********
     *  0: Status mean it's not yet active (future dose), --default
     *  1: Status mean it's in Transit (time is here , not yet 60 mins passed), --server action
     *  2: status code means it's taken. , --action by user
     *  3: it's ignored (60 minutes passed no action) --server action
     *  4: status means its rejected
     * 
       
 * 
 */


  exports.ChangeDoseStatus=async (req, res) => {
  
    /** change dose status
     * ********************************
     * logic
     * ********************************
     * -1 get dose by id
     * -2 change its status to the new one
     * **********
     *  0: Status mean it's not yet active (future dose), --default
     *  1: Status mean it's in Transit (time is here , not yet 60 mins passed), --server action
     *  2: status code means it's taken. , --action by user
     *  3: it's ignored (60 minutes passed no action) --server action
     *  4: status means its rejected
     * 
     */
    try {
  
      const {id} =req.id
      let {
      OccuranceId,
      Status,
      ProfileID
      }=req.body
  
      // check for permission
      const dose =await Occurance.findById(OccuranceId)
      if(!dose){
        return errorResMsg(res, 400, req.t("Dose_not_found"));
      }
      //permission check
  
            /*
      
      check permission 
      
      */
  
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID
      })
      if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
  
      // check if the user is the owner and has write permission or can add meds
  
      if(profile.Owner.User.toString()!=id){
        // check if the user has add med permission
        const hasWritePermissonToThatMed=viewer.CanWriteDoses;
        // check CanReadSpacificMeds array inside viewer for the CanWrite permission for that MedID
        const hasWritePermissonToThatDose=viewer.CanReadSpacificMeds.find((med)=>{
          if(med.Med.toString()===dose.Medication.toString()){
            return med.CanWriteDoses
          }
        }) 
        if(!(hasWritePermissonToThatDose||hasWritePermissonToThatMed)){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        
      }
      //case the owner dont has write permission
      if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
  
  
  
  
  
      if(!(Status==2||Status==4)){
        return errorResMsg(res, 400, req.t("Invalid_status"));
      }
  
      // edit quantaty
      if(Status==2){
        const Medication=await UserMedcation.findById(dose.Medication)
        Medication.quantity=Medication.quantity-dose.PlannedDose
        await Medication.save()
      }
      // change dose status
      
     dose.Status=Status
      await dose.save()
  
      
  
      // return succesfull response
      return successResMsg(res, 200, {message:req.t("Dose_Status_Changed")});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
  

   /**
 * getDoses
 * 
 * @function
 * @memberof controllers
 * @memberof Doses
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.ProfileID - Profile ID of the user
 * @param {string} req.body.date - start date
 * @param {string} req.body.EndDate -EndDate date in ms format and its optional if not provided wil return the doses of the date
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission 
 * 
 * 
 * @returns {Object} - Returns doses of that date range
 * @description 
 *    change dose status
     * ********************************
     * logic
        return doses with a date range if the EndDate is not provided then it will return the doses of the date 
     * if no date is provided the default is today
     * returns not suspended dosages
     * Note(the returned doses is the doses with the provided  profile id )
     * 
       
 * 
 */



  exports.getDoses=async (req, res) => {
  
    /** 
     * return doses with a spastic date
     * if no date is provided the default is today
     * returns not suspended dosages
     * 
     */
    try {
  
      const {id} =req.id
      let {
      date,
      ProfileID,
      EndDate
      }=req.query
  
               /*
      
      check permission 
      
      */
  
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID
      })
      if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      // check if the user is the owner and has write permission or can add meds
        //case the owner dont has write permission
        if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        let hasGeneralReadPermissions;
        let hasSpacificReadPermissions;
        if(profile.Owner.User.toString()===id){
          hasGeneralReadPermissions=true
        }else{
          hasGeneralReadPermissions=viewer.CanReadDoses;
          hasSpacificReadPermissions=viewer.CanReadSpacificMeds.map(elem=>{
           if(elem.CanReadDoses){
             return elem.Med
           }
         });
        }
      
  
  
  
      // get occurances which equal today
      if(!date){
        date=new Date()
      }
      const queryDate =new Date(+date)
      let nextDay
      if(!EndDate){
        nextDay=new Date(+date)
        nextDay= new Date(nextDay.setDate(nextDay.getDate()+1))
        }else{
        nextDay=EndDate
        }
      
      // case has a general read permissions
      if(hasGeneralReadPermissions){
        const doses =await Occurance.find({
          ProfileID:ProfileID,
          PlannedDateTime:{$gte:queryDate,$lt:nextDay},
          isSuspended:false
    
        }).select(
          "PlannedDateTime PlannedDose Status Medication Schduler MedInfo _id"
        )
          // return succesfull response
      return successResMsg(res, 200, {message:req.t("Success"),data:doses});
      }else if(hasSpacificReadPermissions.length>0){ //has spacific permission
        // case has spacific read permissions
        const doses =await Occurance.find({
          ProfileID:ProfileID,
          PlannedDateTime:{$gte:queryDate,$lt:nextDay},
          isSuspended:false,
          Medication:{$in:hasSpacificReadPermissions}
    
        }).select(
          "PlannedDateTime PlannedDose Status Medication Schduler MedInfo _id"
        )
          // return succesfull response
      return successResMsg(res, 200, {message:req.t("Success"),data:doses});
      }else{
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
     
      
    
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  

    /**
 * getAllDoses
 * 
 * @function
 * @memberof controllers
 * @memberof Doses
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.ProfileID - Profile ID of the user
 * @param {string} req.body.date - start date
 * @param {string} req.body.EndDate -EndDate date in ms format and its optional if not provided wil return the doses of the date
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission 
 * 
 * 
 * @returns {Object} - Returns doses of that date range
 * @description 
 *    change dose status
     * ********************************
     * logic
        return doses with a date range if the EndDate is not provided then it will return the doses of the date 
     * if no date is provided the default is today
     * returns not suspended dosages
     * Note(the returned doses is the doses with the provided profile id and its dependents )
     * 
     * 
       
 * 
 */



  exports.getAllDoses=async (req, res) => {
    /**
     * get my doses and my dependents doses
     * 
     * 
     */
    /** 
     * return doses with a spacic date
     * if no date is provided the defult is today
     * returns not suspended dosages
     * 
     */
    try {
  
      const {id} =req.id
      let {
      date,
      ProfileID,
      EndDate
      }=req.query
  
               /*
      
      check permission 
      
      */
  
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID
      })
      if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      // check if the user is the owner and has write permission or can add meds
        //case the owner dont has write permission
        if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        let hasGeneralReadPermissions;
        let hasSpacificReadPermissions;
        if(profile.Owner.User.toString()===id){
          hasGeneralReadPermissions=true
        }else{
          hasGeneralReadPermissions=viewer.CanReadDoses;
          hasSpacificReadPermissions=viewer.CanReadSpacificMeds.map(elem=>{
           if(elem.CanReadDoses){
             return elem.Med
           }
         });
        }
      
  
  
  
      // get occurances which equal today
      if(!date){
        date=new Date()
      }
      const queryDate =new Date(+date)
      let nextDay
      if(!EndDate){
        nextDay=new Date(+date)
        nextDay= new Date(nextDay.setDate(nextDay.getDate()+1))
        }else{
        nextDay=EndDate
        }
      
        // get all my dependents
      const mydependents =await Viewer.find({
        ViewerProfile:viewerProfile._id
      })
      
      const dependentsProfiles =mydependents.filter(elem=>{
        return elem.CanReadDoses;
      })
      const dependentsProfilesIDs =dependentsProfiles.map(elem=>{
        return elem.DependentProfile
      })
      // push the viewer profile to dependentsProfileIDs
      dependentsProfilesIDs.push(viewerProfile._id)
  
      // get general permissions doses
      const generalDoses =await Occurance.find({
        ProfileID:{$in:dependentsProfilesIDs},
        PlannedDateTime:{$gte:queryDate,$lt:nextDay},
        isSuspended:false
  
      }).select(
        "PlannedDateTime PlannedDose Status Medication Schduler MedInfo _id ProfileID"
      )
      .populate({
        path:"ProfileID",
        select:"Owner.User",
        populate:{
          path:"Owner.User",
          select:"firstName lastName email"
        }
  
      })
  
      // get doses which i has read permissions to
      const dependentsWithSpacific =mydependents.filter(elem=>{
        return !elem.CanReadDoses;
      })
      const dependentsSpacificMeds =[]
      
      dependentsWithSpacific.forEach(dependent=>{
        dependent.CanReadSpacificMeds.forEach(elem=>{
          if(elem.CanReadDoses){
            dependentsSpacificMeds.push(elem.Med)
          }
        })
  
      })
      const spacificDoses =await Occurance.find({
        PlannedDateTime:{$gte:queryDate,$lt:nextDay},
        isSuspended:false,
        Medication:{$in:dependentsSpacificMeds}
  
      })
      .select("PlannedDateTime PlannedDose Status Medication Schduler MedInfo _id ProfileID")
      .populate({
        path:"ProfileID",
        select:"Owner",
        populate:{
          path:"Owner.User",
          select:"firstName lastName email"
        }
  
      })
      
  const doses=[...generalDoses,...spacificDoses]
  
  
    return successResMsg(res, 200, {message:req.t("Success"),data:doses});
  
     
      
    
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  