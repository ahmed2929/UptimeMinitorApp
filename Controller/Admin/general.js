const MedRecommendation = require("../../DB/Schema/MedRecommendation");
const fs  =require("fs");
const xlsx =require("xlsx")
const {
  successResMsg,
  errorResMsg
} = require("../../utils/ResponseHelpers");



// add medRecommendation
exports.AddMedRecommendation = async (req, res) => {
  try {
    
    const file = xlsx.readFile(req.file.path,{
        cellDates:true
    });
    

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
                strenth:Med['Strength'],
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

    console.log("delete old meds db eneded")

    // Execute the Ordered Batch
    console.log("batch started")
    const reuslt=await batch.execute();
    console.log(reuslt)
    delete file

    fs.unlinkSync(req.file.path);
    // return succesfull response
    return successResMsg(res, 200, {message:req.t("Med_Recommendation_List_Has_Been_Created")});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};