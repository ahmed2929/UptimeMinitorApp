const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var MedRecommendationsSchema = new Schema({
  DrugCode:{
    type:String,

  },
  GreenrainCode:{
   type :String
  },
  PackageName:{
    type :String,
    index:true
   },
  GenericCode:{
    type :String
   },
  GenericName:{
    type :String,
    index:true
   },
  strenth:{
    type :String
   },
  DosageForm:{
    type :String
   },
  PackageSize:{
    type :String
   },
  DispenseMode:{
    type :String
   },
  PackagePriceToPublic:{
    type :String
   },
  PackagePriceToPhamacy:{
    type :String
   },
  UnitPriceToPublic:{
    type :String
   },
  UnitPriceToPharmacy:{
    type :String
   },
  status:{
    type :String,
    enum : ['Deleted','Active'],
    default: 'Active'
   },
  DeleteEffectiveDate:{
    type :Date
   },
  LastChangeDate:{
    type :Date
   },
  AgentName:{
    type :String
   },
  ManufacturerName:{
    type :String
   }
 
 
 
},{ timestamps: true });

const MedRecommendations = mongoose.model("MedRecommendation", MedRecommendationsSchema);

module.exports = MedRecommendations;