const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var MedRecommendationsSchema = new Schema({
  
            RXCUI:{
              type:String,
            },
              LAT:{
                type:String,
              },
              RXAUI:{
                type:String,
              },
              SAUI:{
                type:String,
              },
              SCUI:{
                type:String,
              },
              SAB:{
                type:String,
              },
              TTY:{
                type:String,
              },
              CODE:{
                type:String,
              },
              STR:{
                type:String,
              },
              SRL:{
                type:String,
              },
              SUPPRESS:{
                type:String,
              },
 
 
 
},{ timestamps: true });

const MedRecommendations = mongoose.model("MedRecommendationUS", MedRecommendationsSchema);

module.exports = MedRecommendations;