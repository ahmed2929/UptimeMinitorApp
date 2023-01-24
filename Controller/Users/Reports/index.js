/**
 * @file controller/general/index.js
 * @namespace controllers
 * @namespace Report
 * 
 */



const UserMedication = require("../../../DB/Schema/UserMedication");
const Occurrence = require("../../../DB/Schema/Occurrences");
const Viewer =require("../../../DB/Schema/Viewers")
const mongoose = require("mongoose");
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");

const Profile = require("../../../DB/Schema/Profile")



/**
 * get report for all meds
 * 
 * @function
 * @memberof controllers
 * @memberof Report
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.StartDate - start date in ms
 * @param {string} req.body.EndDate - EndDate date in ms
 * @param {string} req.body.ProfileID - ProfileID
 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * 
 * 
 * @returns {Object} - return generated report {
 *      
                "med": {
                    "_id": "",
                    "name": "",
                    "strength": ,
                    "unit": ""
                },
                "confirmed": ,
                "rejected": ,
                "ignored":,
                "other": ,
                "total": 
            }
        
 * @description 
 * - get the doses which the user has permission to view
 * - group it with the med
 * -each med should have
 *          {
 *          "confirmed": ,
                "rejected": ,
                 "ignored": ,
                "other": ,
                "total": 
            }
 * -return the data 
       
 * 
 */



exports.getReport=async (req, res) => {

    /** 
     *return all user meds
     * 
     */
    try {
  
      const {id} =req.id
      const {ProfileID,StartDate,EndDate}=req.query
  
  
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
      
    
     
   
  
    // case general permission
    if(hasGeneralReadPermissions){
       // case spacific permission
       const doses =await Occurrence.aggregate([{
         $match:{
           ProfileID: mongoose.Types.ObjectId(ProfileID),
           PlannedDateTime:{$gte:new Date(+StartDate),$lte:new Date(+EndDate)},
           isSuspended:false,
          
         }
       },
       
          {
            $group: {
             _id: {
               Medication: '$Medication',
             },
             confirmed: {
               $sum: {
                 $cond: {
                   if: { $eq: ['$Status', 2] },
                   then: 1,
                   else: 0
                 }
               }
             },
             rejected: {
               $sum: {
                 $cond: {
                   if: { $eq: ['$Status', 4] },
                   then: 1,
                   else: 0
                 }
               }
             },
             ignored: {
              $sum: {
                $cond: {
                  if: { $eq: ['$Status', 3] },
                  then: 1,
                  else: 0
                }
              }
            },
             other: {
               $sum: {
                 $cond: {
                   if: { $in: ['$Status', [0,1]] },
                   then: 1,
                   else: 0
                 }
               }
             },
             total: { $sum: 1 },
           
       }
         }
   
       ])
   
       const responseData=[];
   
       for (const elem of doses) {
         const med =await UserMedication.findById(elem._id.Medication).select("name img unit strength")
         responseData.push({
           med:med,
           confirmed:elem.confirmed,
           rejected:elem.rejected,
           other:elem.other,
           total:elem.total,
            ignored:elem.ignored
         })
       }
   
    
       // return successful response
       return successResMsg(res, 200, {message:req.t("Success"),data:responseData});
  
    }else if(hasSpacificReadPermissions.length>0){
      // case spacific permission
      ids = hasSpacificReadPermissions.map(function(el) { return mongoose.Types.ObjectId(el) })
  
      const doses =await Occurrence.aggregate([{
        $match:{
          ProfileID: mongoose.Types.ObjectId(ProfileID),
          PlannedDateTime:{$gte:new Date(+StartDate),$lte:new Date(+EndDate)},
          Medication:{$in:ids},
          isSuspended:false,
        }
      },
      
      
         {
           $group: {
            _id: {
              Medication: '$Medication',
            },
            confirmed: {
              $sum: {
                $cond: {
                  if: { $eq: ['$Status', 2] },
                  then: 1,
                  else: 0
                }
              }
            },
            rejected: {
              $sum: {
                $cond: {
                  if: { $eq: ['$Status', 4] },
                  then: 1,
                  else: 0
                }
              }
            },
            ignored: {
              $sum: {
                $cond: {
                  if: { $eq: ['$Status', 3] },
                  then: 1,
                  else: 0
                }
              }
            },
            other: {
              $sum: {
                $cond: {
                  if: { $in: ['$Status', [0,1]] },
                  then: 1,
                  else: 0
                }
              }
            },
            total: { $sum: 1 },
          
      }
        }
  
      ])
  
      const responseData=[];
  
      for (const elem of doses) {
        const med =await UserMedication.findById(elem._id.Medication).select("name img unit strength")
        responseData.push({
          med:med,
          confirmed:elem.confirmed,
          rejected:elem.rejected,
          other:elem.other,
          total:elem.total,
          ignored:elem.ignored
        })
      }
  
   
      // return successful response
      return successResMsg(res, 200, {message:req.t("Success"),data:responseData});
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
 * get report for a single med
 * 
 * @function
 * @memberof controllers
 * @memberof Report
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.StartDate - start date in ms
 * @param {string} req.body.EndDate - EndDate date in ms
 * @param {string} req.body.ProfileID - ProfileID
 * @param {string} req.body.MedID - MedID
 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * 
 * 
 * @returns {Object} - return the doses for that med
        
 * @description 
 * check if the user has permission to view this med does
 * return med doses
 * 
       
 * 
 */



  exports.getReportSingleMed=async (req, res) => {
  
    
    try {
  
      const {id} =req.id
      const {ProfileID,StartDate,EndDate,MedID}=req.query
  
  
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
              return elem.Med.toString()
            }
          });
        }
      
    
   
  
    // case general permission
    if(hasGeneralReadPermissions){
       // case spasific permission
       const doses =await Occurrence.find({
    
           ProfileID: mongoose.Types.ObjectId(ProfileID),
           PlannedDateTime:{$gte:new Date(+StartDate),$lte:new Date(+EndDate)},
            Medication:mongoose.Types.ObjectId(MedID)
       }).populate(
       {
          path:"Medication",
          select:"name img unit strength type"
       }
       ).select("-MedInfo")
       
      
   
    
       // return successful response
       return successResMsg(res, 200, {message:req.t("Success"),data:doses});
  
    }else if(hasSpacificReadPermissions.length>0){
  
       // if the MedID is not in hasSpacificReadPermissions array return Unauthorized
    if(!hasSpacificReadPermissions.includes(MedID)){
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }
    
  
  
       const doses =await Occurrence.find({
    
        ProfileID: mongoose.Types.ObjectId(ProfileID),
        PlannedDateTime:{$gte:new Date(+StartDate),$lte:new Date(+EndDate)},
         Medication:mongoose.Types.ObjectId(MedID),
         isSuspended:false
    }).populate(
    {
       path:"Medication",
       select:"name img unit strength type"
    }
    ).select("Medication PlannedDateTime PlannedDose Status ProfileID")
    
   
  
  
    // return successful response
    return successResMsg(res, 200, {message:req.t("Success"),data:doses});
      
  
      // return successful response
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
  
  
  