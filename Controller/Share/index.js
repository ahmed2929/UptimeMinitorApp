const Profile = require("../../DB/Schema/Profile");
const Link = require("../../DB/Schema/Link");
const Symptom = require("../../DB/Schema/Symptoms");
const Viewer =require("../../DB/Schema/Viewers")
const {UploadFileToAzureBlob,IsMasterOwnerToThatProfile}=require("../../utils/HelperFunctions")
const {
  successResMsg,
  errorResMsg
} = require("../../utils/ResponseHelpers");
const User = require("../../DB/Schema/User");


exports.GenerateSharableSymptomLink = async (req, res) => {
 
  try {

    const {id} =req.id
    const {ProfileID,SymptomID,MaxUses,ExpireDate}=req.body
   


    const profile =await Profile.findById(ProfileID).populate("Owner.User")
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
    if(profile.Owner.User._id.toString()!==id&&!IsMaster){
      const ViewerProfile = await User.findById(id)
      const viewer=await Viewer.findOne({DependentProfile:profile._id,ViewerProfile:ViewerProfile.profile,IsDeleted:false
      })
      if(!viewer){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }else if(!(viewer.CanShareAllSymptoms||viewer.CanShareAllInfo)){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      
    }
    const symptom =await Symptom.findById(SymptomID)
    if(!symptom){
        return errorResMsg(res, 400, req.t("Symptom_not_found"));
    }
    if(symptom.isDeleted){
        return errorResMsg(res, 400, req.t("Symptom_not_found"));
    }
    if(symptom.Profile.toString()!==ProfileID){
        return errorResMsg(res, 400, req.t("Unauthorized"));
    }
    const link =await Link.create({
        ActionType:0,
        SymptomData:symptom._id,
        ExpireDate:ExpireDate,
        MaxUses:MaxUses,
        ProfileID:ProfileID
    })

    await link.save()
    const domain=process.env.RenderingServiceBaseUrl
    const linkUrl=`https://${domain}/view/${link._id}`
   
       
    return successResMsg(res, 200, {message:req.t("Link_Generated"),data:linkUrl});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};





