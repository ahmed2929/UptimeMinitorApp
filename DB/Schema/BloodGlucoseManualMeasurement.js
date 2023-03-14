const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var BloodGlucoseManualMeasurementSchema = new Schema({
    ProfileID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Profile'
      },
      glucoseLevel: {
        type: Number,
      
      },
        MeasurementDateTime:{
            type:Date,
        },
        MeasurementUnit:{
            type:String,
            
        },
        MeasurementNote:{
            type:String,
        },
        MeasurementSource:{
            type:String,
            default:'manual'
        },
        CreatorProfile:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Profile'
        },
        EditedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Profile'
        },
        isDeleted:{
            type:Boolean,
            default:false
        },
        PlannedDateTime:{
            type:Date,
        },
        Status:{
            type:Number,
            enum : [0,1,2,3,4,5], // 0: Status mean it's not yet active, 1: Status mean it's in Transit (time is here , not yet 60 mins passed), 2: status code means it's taken. , 3: it's ignored (60 minutes passed no action) 4:means its rejected,5:means 30m has passed and his care circle notified
            default: 0
        },
        MeasurementScheduler:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'MeasurementScheduler'
        },
        VoiceRecord:{
            type:String,
            default:null
        
        },
        Fasting:{
            type:Number,// 0: fasting 1: not fasting
        }

   

 
},{ timestamps: true });


const BloodGlucoseManual = mongoose.model("BloodGlucoseManualMeasurement", BloodGlucoseManualMeasurementSchema);

module.exports = BloodGlucoseManual;