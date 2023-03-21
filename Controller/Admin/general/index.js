const MedRecommendation = require("../../../DB/Schema/MedRecommendation");
const MedRecommendationUS = require("../../../DB/Schema/MedRecommendationUs");
const fs  =require("fs");
const xlsx =require("xlsx")
const Access = require("../../../DB/Schema/apiAccess");
const crypto = require('crypto');
const FeedBack =require("../../../DB/Schema/Feedback")
const Profile =require("../../../DB/Schema/Profile")
const User =require("../../../DB/Schema/User")
const Notification =require("../../../DB/Schema/Notifications")
const {SendPushNotificationToUserRegardlessLangAndOs} =require("../../../utils/HelperFunctions")
const Link = require("../../../DB/Schema/Link");
const Symptom = require("../../../DB/Schema/Symptoms");
const Medication = require("../../../DB/Schema/UserMedication");
const Dose = require("../../../DB/Schema/Occurrences");
const Notifications =require("../../../DB/Schema/Notifications")
const BloodPressure = require("../../../DB/Schema/BloodPressureManualMeasurement");
const BloodGlucose = require("../../../DB/Schema/BloodGlucoseManualMeasurement");

const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");



// add medRecommendation
exports.AddMedRecommendation = async (req, res) => {
  try {
            // Convert the buffer to a typed array
        const buffer = Buffer.from(req.file.buffer);
        const typedArray = new Uint8Array(buffer);

        const file = xlsx.read(typedArray, { type: 'array', cellDates: true });


    const ws = file.Sheets["Drugs"]
  
     const medJsonObject=xlsx.utils.sheet_to_json(ws)
      // Initialize the Ordered Batch
    // You can use initializeUnorderedBulkOp to initialize Unordered Batch
    console.log(medJsonObject[0])
    const col = MedRecommendation.collection;

    var batch = col.initializeUnorderedBulkOp();


    for(let Med of medJsonObject){
            var newMedObj={
                DrugCode:Med['Drug Code'],
                GreenrainCode:Med['Greenrain Code'],
                PackageName:Med['Package Name'],
                GenericCode:Med['Generic Code'],
                GenericName:Med['Generic Name'],
                strength:Med['Strength'],
                DosageForm:Med['Dosage Form'],
                PackageSize:Med['Package Size'],
                DispenseMode:Med['Dispense Mode'],
                PackagePriceToPublic:Med['Package Price to Public'],
                PackagePriceToPhamacy:Med['Package Price to Pharmacy'],
                UnitPriceToPublic:Med['Unit Price to Public'],
                UnitPriceToPharmacy:Med['Unit Price to Pharmacy'],
                status:Med['Status'],
                DeleteEffectiveDate:Med['Delete Effective Date'],
                LastChangeDate:Med['Last Change Date'],
                AgentName:Med['Agent Name'],
                ManufacturerName:Med['Manufacturer Name'],


                  }
            batch.insert(newMedObj);



        
    }

    console.log("delete old meds db started")

    const result=await MedRecommendation.deleteMany( { } );

    console.log("delete old meds db ended")

    // Execute the Ordered Batch
    console.log("batch started")
    const resultt=await batch.execute();
    console.log(resultt)
    delete file

    fs.unlinkSync(req.file.path);
    // return successful response
    return successResMsg(res, 200, {message:req.t("Med_Recommendation_List_Has_Been_Created")});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.AddMedRecommendationUS = async (req, res) => {
  try {
            // Convert the buffer to a typed array
        const buffer = Buffer.from(req.file.buffer);
        const typedArray = new Uint8Array(buffer);

        const file = xlsx.read(typedArray, { type: 'array', cellDates: true });


    const ws = file.Sheets["Sheet1"]
  
     const medJsonObject=xlsx.utils.sheet_to_json(ws)
      // Initialize the Ordered Batch
    // You can use initializeUnorderedBulkOp to initialize Unordered Batch
    console.log(medJsonObject[0])
    const col = MedRecommendationUS.collection;

    var batch = col.initializeUnorderedBulkOp();


    for(let Med of medJsonObject){
      console.log("MEd",Med)
            var newMedObj={
              RXCUI:Med['1'],
              LAT:Med['2'],
              RXAUI:Med['8'],
              SAUI:Med['9'],
              SCUI:Med['10'],
              SAB:Med['12'],
              TTY:Med['13'],
              CODE:Med['14'],
              STR:Med['15'],
              SRL:Med['16'],
              SUPPRESS:Med['17'],
              


                  }
            batch.insert(newMedObj);



        
    }

    console.log("delete old meds db started")

    //const result=await MedRecommendation.deleteMany( { } );

    console.log("delete old meds db ended")

    // Execute the Ordered Batch
    console.log("batch started")
    const resultt=await batch.execute();
    console.log(resultt)
    delete file

    fs.unlinkSync(req.file.path);
    // return successful response
    return successResMsg(res, 200, {message:req.t("Med_Recommendation_List_Has_Been_Created")});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.GenerateApiKeysAndSecrets = async (req, res) => {
  try {
    const { NickName } = req.body;
    const token = crypto.randomBytes(64).toString('hex');

    const newAccess = new Access({
      NickName,
      Secret:token
    });

    const savedAccess = await newAccess.save();

    const Response={
      secret:savedAccess.Secret,
      NickName:savedAccess.NickName,
      Key:savedAccess._id
    }

    // return successful response
    return successResMsg(res, 200, Response);
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.GetFeedBacks = async (req, res) => {
 
  try {

   // const {id} =req.id
    const page=req.query.page||1
    const itemPerPage = 10 ;
    let totalItems;
   


        totalItems = await FeedBack.find().countDocuments();
    
          const feedbacks = await FeedBack.find()
            .sort({createdAt: -1})
            .skip((page - 1) * itemPerPage)
            .limit(itemPerPage)
            .populate({
              path: "User",
              select: "firstName lastName email"

            })
           
         
           const results= {
                total:totalItems,
                feedbacks
              }
    
    // return successful response
       
    return successResMsg(res, 200, {data:results});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

// send notifications to all users
exports.SendNotificationToAllUsers = async (req, res) => {
  try {

    const {title_ar,body_ar,title_en,body_en,data} =req.body
    const profiles =await Profile.find({}).populate("Owner.User")
    const clonedData=JSON.parse(JSON.stringify(data))
    for await (let profile of profiles) {

      await SendPushNotificationToUserRegardlessLangAndOs(profile,profile,"GeneralNotification",{
        Data:clonedData,
        title_ar,
        body_ar,
        title_en,
        body_en
      
      })

    }

    // return successful response
    return successResMsg(res, 200, {message:req.t("Notification_Sent_Successfully")});

 

   
        
     
   } catch (err) {
     // return error response
     console.log(err)
     return errorResMsg(res, 500, err);
   }
}


exports.Statics = async (req, res) => {
 
  try {

    
    const Users = await User.find().count({IsDependent:false})
    const VerifiedUsers = await User.find({verified:true,IsDependent:false}).count()
    const UnverifiedUsers = await User.find({verified:false,IsDependent:false}).count()
    const InternalDependentUsers =await User.find({IsDependent:true}).count()
    const Symptoms = await Symptom.find({isDeleted:false}).count()
    const Medications = await Medication.find({isDeleted:false}).count()
    const ConfirmedDoses = await Dose.find({isDeleted:false,Status:2}).count()
    const RejectedDoses = await Dose.find({isDeleted:false,Status:4}).count()
    const AllDoses = await Dose.find({isDeleted:false}).count()
    const notifications = await Notifications.find().count()
    const Links = await Link.find().count()
    const BloodGlucoseReadings = await BloodGlucose.find({Status:2}).count()
    const BloodPressureReadings = await BloodPressure.find({Status:2}).count()

    const statistics = {
      verifiedUsers: VerifiedUsers,
      unverifiedUsers: UnverifiedUsers,
      InternalDependentUsers,
      users: Users,
      symptoms: Symptoms,
      medications: Medications,
      confirmedDoses: ConfirmedDoses,
      rejectedDoses: RejectedDoses,
      AllDoses: AllDoses,
      notificationsSent: notifications,
      SharedLinks:Links,
      BloodGlucoseReadings,
      BloodPressureReadings
    };

   


 return successResMsg(res, 200, {data:statistics});

   
   
   
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};
