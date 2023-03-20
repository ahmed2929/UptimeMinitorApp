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
const BloodGlucose =require("../../../DB/Schema/BloodGlucoseManualMeasurement")
const BloodPressure =require("../../../DB/Schema/BloodPressureManualMeasurement")
const {CheckProfilePermissions} =require("../../../utils/HelperFunctions")
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
  
      const profile =await Profile.findById(ProfileID).populate("Owner.User")
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
      if(viewerProfile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       IsDeleted:false

      })
  
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      // check if the user is the owner and has write permission or can add meds
        //case the owner dont has write permission
        // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
        //   return errorResMsg(res, 401, req.t("Unauthorized"));
        // }
        let hasGeneralReadPermissions;
        let hasSpacificReadPermissions;
        if(profile.Owner.User._id.toString()===id){
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
           IsDeleted:false,
          
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
         const med =await UserMedication.findById(elem._id.Medication).select("name img unit strength quantity type")
         .populate("Scheduler")
          .populate("user")
         .select("dosage")
         let DosePerDay=med.Scheduler.dosage.length||0
         
         responseData.push({
           med:{
              _id:elem._id.Medication,
              name:med.name,
              strength:med.strength,  
              unit:med.unit,
              img:med.img,
              quantity:med.quantity,
              StartDate:med.Scheduler.StartDate,
              EndDate:med.Scheduler.EndDate,
              GenerateAutoOccurrence:med.Scheduler.GenerateAutoOccurrence,
              type:med.type

           },
           confirmed:elem.confirmed,
           rejected:elem.rejected,
           other:elem.other,
           total:elem.total,
            ignored:elem.ignored,
            userFirstName:med.user.firstName,
            userLastName:med.user.lastName,
            DosePerDay
         })
       }
       const result = responseData.reduce((acc, item) => {
        acc.confirmed += item.confirmed;
        acc.rejected += item.rejected;
        acc.other += item.other;
        acc.total += item.total;
        return acc;
      }, { confirmed: 0, rejected: 0, other: 0 ,total:0});
      
     const Adherence=result.confirmed/result.total*100||0
      let TotalNumberOFMeds=responseData.length
      console.log(TotalNumberOFMeds)
      console.log(result)
      const editedData={
          MedsData:responseData,
          TotalNumberOFMeds,
          Statics:result,
          Adherence:Adherence.toFixed(2),
          exportProfileData:{
            firstName:profile.Owner.User.firstName,
            lastName:profile.Owner.User.lastName,
            img:profile.Owner.User.img,
            email:profile.Owner.User.email,
          }
  
        
  
        
      

      }
  
   
      // return successful response
      return successResMsg(res, 200, {message:req.t("Success"),data:editedData});
  
    }else if(hasSpacificReadPermissions.length>0){
      // case spacific permission
      ids = hasSpacificReadPermissions.map(function(el) { return mongoose.Types.ObjectId(el) })
  
      const doses =await Occurrence.aggregate([{
        $match:{
          ProfileID: mongoose.Types.ObjectId(ProfileID),
          PlannedDateTime:{$gte:new Date(+StartDate),$lte:new Date(+EndDate)},
          Medication:{$in:ids},
          isSuspended:false,
          IsDeleted:false,
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
        const med =await UserMedication.findById(elem._id.Medication).select("name img unit strength quantity type")
        .populate("Scheduler")
        .populate("user")
        .select("dosage")
        let DosePerDay=med.Scheduler.dosage.length||0
        
       

       
        responseData.push({
          med:{
            _id:elem._id.Medication,
            name:med.name,
            strength:med.strength,  
            unit:med.unit,
            img:med.img,
            quantity:med.quantity,
            StartDate:med.Scheduler.StartDate,
            EndDate:med.Scheduler.EndDate,
            GenerateAutoOccurrence:med.Scheduler.GenerateAutoOccurrence,
            type:med.type


         },
          confirmed:elem.confirmed,
          rejected:elem.rejected,
          other:elem.other,
          total:elem.total,
          ignored:elem.ignored,
          userFirstName:med.user.firstName,
          userLastName:med.user.lastName,
          DosePerDay,
        })
      }

      const result = responseData.reduce((acc, item) => {
        acc.confirmed += item.confirmed;
        acc.rejected += item.rejected;
        acc.other += item.other;
        acc.total += item.total;
        return acc;
      }, { confirmed: 0, rejected: 0, other: 0 ,total:0});
      
     
      let TotalNumberOFMeds=responseData.length
      const Adherence=result.confirmed/result.total*100||0

      console.log(result)
      const editedData={
        MedsData:responseData,
        TotalNumberOFMeds,
        Statics:result,
        Adherence:Adherence.toFixed(2),
        exportProfileData:{
          firstName:profile.Owner.User.firstName,
          lastName:profile.Owner.User.lastName,
          img:profile.Owner.User.img,
          email:profile.Owner.User.email,
        }

      

      }
  
   
      // return successful response
      return successResMsg(res, 200, {message:req.t("Success"),data:editedData});
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
  
      const profile =await Profile.findById(ProfileID).populate("Owner.User")
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(viewerProfile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       IsDeleted:false
      })
  
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      // check if the user is the owner and has write permission or can add meds
        //case the owner dont has write permission
        // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
        //   return errorResMsg(res, 401, req.t("Unauthorized"));
        // }
        let hasGeneralReadPermissions;
        let hasSpacificReadPermissions;
        if(profile.Owner.User._id.toString()===id){
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
            Medication:mongoose.Types.ObjectId(MedID),
            IsDeleted:false,
            isSuspended:false
       }).populate(
       {
          path:"Medication",
          select:"name img unit strength type"
       }
       ).select("-MedInfo")
       
      
       const editedData=doses.map(dose=>{
        return {
          ...dose._doc,
          exportProfileData:{
            firstName:profile.Owner.User.firstName,
            lastName:profile.Owner.User.lastName,
            img:profile.Owner.User.img,
            email:profile.Owner.User.email,
          }
        }
      })
    
       // return successful response
       return successResMsg(res, 200, {message:req.t("Success"),data:editedData});
  
    }else if(hasSpacificReadPermissions.length>0){
  
       // if the MedID is not in hasSpacificReadPermissions array return Unauthorized
    if(!hasSpacificReadPermissions.includes(MedID)){
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }
    
  
  
       const doses =await Occurrence.find({
    
        ProfileID: mongoose.Types.ObjectId(ProfileID),
        PlannedDateTime:{$gte:new Date(+StartDate),$lte:new Date(+EndDate)},
         Medication:mongoose.Types.ObjectId(MedID),
         isSuspended:false,
         IsDeleted:false,
        
    }).populate(
      {
         path:"Medication",
         select:"name img unit strength type"
      }
      ).select("-MedInfo")
   
      const editedData=doses.map(dose=>{
        return {
          ...dose._doc,
          exportProfileData:{
            firstName:profile.Owner.User.firstName,
            lastName:profile.Owner.User.lastName,
            img:profile.Owner.User.img,
            email:profile.Owner.User.email,
          }
        }
      })
  
    // return successful response
    return successResMsg(res, 200, {message:req.t("Success"),data:editedData});
      
  
      // return successful response
     
    }else{
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }
  
      
     
     
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
  
  exports.getBloodGlucoseMeasurementReport=async (req, res) => {
  
    
    try {
  
      const {id} =req.id
      const {ProfileID,StartDate,EndDate}=req.query
      console.log(ProfileID)
               /*
      
      check permission 
      
      */
  
      const profile =await Profile.findById(ProfileID).populate("Owner.User")
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(viewerProfile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       IsDeleted:false,
       CanReadBloodGlucoseMeasurement:true
      })
  
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
  
      // check if the user is the owner or has a read permissions
        // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
        //   return errorResMsg(res, 401, req.t("Unauthorized"));
        // }
    
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanReadMeasurement')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

      
     
    if(StartDate&&EndDate){
        
      const BloodGlucoseArray =await BloodGlucose.find({
        ProfileID:ProfileID,
        MeasurementDateTime:{
          $gte:new Date(+StartDate),
          $lte:new Date (+EndDate)
        },
        isDeleted:false,
        Status:2
  
      }).populate({
        path:"ProfileID",
        select:"firstName lastName img",
        populate:{
          path:"Owner.User",
          select:"firstName lastName img"
        }
      })
     
     

      
      // return successfully response
      return successResMsg(res, 200, {message:req.t("Success"),data:BloodGlucoseArray});
  
    
   
  
    }else{
        const BloodGlucoseArray =await BloodGlucose.find({
          ProfileID:ProfileID,
          isDeleted:false,
          isDeleted:false,
          Status:2
    
        }).populate({
          path:"ProfileID",
          select:"firstName lastName img",
          populate:{
            path:"Owner.User",
            select:"firstName lastName img"
          }
        })
       
       
        // return successfully response
        return successResMsg(res, 200, {message:req.t("Success"),data:BloodGlucoseArray});
    
      
     
    }
   
  
 
     
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
  exports.getBloodPressureMeasurementReport=async (req, res) => {
  
    
    try {
  
      const {id} =req.id
      const {ProfileID,StartDate,EndDate}=req.query
      console.log(ProfileID)
               /*
      
      check permission 
      
      */
  
      const profile =await Profile.findById(ProfileID).populate("Owner.User")
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(viewerProfile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       IsDeleted:false,
       CanReadBloodPressureMeasurement:true
      })
  
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
  
      // check if the user is the owner or has a read permissions
        // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
        //   return errorResMsg(res, 401, req.t("Unauthorized"));
        // }
    
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanReadMeasurement')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

      
     
    if(StartDate&&EndDate){
        
      const BloodGlucoseArray =await BloodPressure.find({
        ProfileID:ProfileID,
        MeasurementDateTime:{
          $gte:new Date(+StartDate),
          $lte:new Date (+EndDate)
        },
        isDeleted:false,
        Status:2
  
      }).populate({
        path:"ProfileID",
        select:"firstName lastName img",
        populate:{
          path:"Owner.User",
          select:"firstName lastName img"
        }
      })
     
     

      
      // return successfully response
      return successResMsg(res, 200, {message:req.t("Success"),data:BloodGlucoseArray});
  
    
   
  
    }else{
        const BloodGlucoseArray =await BloodPressure.find({
          ProfileID:ProfileID,
          isDeleted:false,
          Status:2
    
        }).populate({
          path:"ProfileID",
          select:"firstName lastName img",
          populate:{
            path:"Owner.User",
            select:"firstName lastName img"
          }
        })
       
       
        // return successfully response
        return successResMsg(res, 200, {message:req.t("Success"),data:BloodGlucoseArray});
    
      
     
    }
   
  
 
     
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };