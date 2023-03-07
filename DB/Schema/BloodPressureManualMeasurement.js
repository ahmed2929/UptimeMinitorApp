const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var BloodPressureMeasurementSchema = new Schema({
        ProfileID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Profile'
        },
        Systolic:{
            type: Number,
        
        },
        Diastolic:{
            type: Number,
        },
        Pulse:{
            type: Number,
        },
        PulseUnit:{
            type:String,
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
            default:0//0:should notified 1: should not notified
        },
        MeasurementScheduler:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'MeasurementScheduler'
        },
        MeasurementOccurred:{
            type:Boolean,
            default:false
        }


   

 
},{ timestamps: true });


const BloodPressureManual = mongoose.model("BloodPressureManualMeasurement", BloodPressureMeasurementSchema);

module.exports = BloodPressureManual;