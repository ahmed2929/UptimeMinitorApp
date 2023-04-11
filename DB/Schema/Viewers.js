const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ViewerSchema = new Schema({
    ViewerProfile:{
        type:Schema.Types.ObjectId,
        ref:"Profile",
    },
    DependentProfile:{
        type:Schema.Types.ObjectId,
        ref:"Profile",
    },
    CanWriteMeds:{
        type:Boolean,
    },
    //permissions

    //Medication
    CanDeleteAllMeds:{
        type:Boolean,
        default:false,
    },
    CanEditAllMeds:{
        type:Boolean,
        default:false,
    },
    CanReadAllMeds:{
        type:Boolean,
        default:false,
    },
    CanAddMeds:{
        type:Boolean,
        default:false,
    },

    //Symptom

     CanWriteSymptoms:{
        type:Boolean,
   
    },
    CanReadSymptoms:{
        type:Boolean,
        default:false,
    },
    CanDeleteSymptoms:{
        type:Boolean,
        default:false,
    },
    CanEditSymptoms:{
        type:Boolean,
        default:false,
    },
    CanAddSymptoms:{
        type:Boolean,
        default:false,
    },
   /////////////Doses////////////
 

    CanWriteDoses:{//deprecated
        type:Boolean,
       
    },
    CanSuspendDoses:{
        type:Boolean,
        default:false,
    },
    CanReadDoses:{
        type:Boolean,
        default:false,
    },
    CanAddNewDose:{
        type:Boolean,
        default:false,
    },
    CanEditDoses:{
        type:Boolean,
        default:false,
    },
    CanChangeDoseStatus:{
        type:Boolean,
        default:false,
    },



   ///////////Refile////////////////
   CanReadRefile:{
    type:Boolean,
   
    },

    /////////Share/////////////////
    CanShareAllMeds:{
        type:Boolean,
        default:false,
    },
    CanShareAllSymptoms:{
        type:Boolean,
        default:false,
    },
    CanShareAllDoses:{
        type:Boolean,
        default:false,
    },
    CanShareAllInfo:{
        type:Boolean,
        default:false,
    },
    // Measurements permissions
    CanReadBloodGlucoseMeasurement:{
        type:Boolean,
        default:false,
    },
    CanEditBloodGlucoseMeasurement:{
        type:Boolean,
        default:false,
    },
    CanDeleteBloodGlucoseMeasurement:{
        type:Boolean,
        default:false,
    },
    CanAddBloodGlucoseMeasurement:{
        type:Boolean,
        default:false,
    },
    CanReadBloodPressureMeasurement:{
        type:Boolean,
        default:false,
    },
    CanEditBloodPressureMeasurement:{
        type:Boolean,
        default:false,
    },
    CanDeleteBloodPressureMeasurement:{
        type:Boolean,
        default:false,
    },
    CanAddBloodPressureMeasurement:{
        type:Boolean,
        default:false,
    },

    CanReadSpacificMeds:[{
        Med:{
            type:Schema.Types.ObjectId,
             ref:"UserMedication",
        },
        //MED
        CanWrite:{
            type:Boolean,
       
        },
        CanRead:{
            type:Boolean,
            default:true,
        },
        CanEdit:{
            type:Boolean,
            default:true,
        },
        CanDelete:{
            type:Boolean,
            default:true,
        },
///////////////Doses////////////////     
        CanWriteDoses:{ //deprecated
            type:Boolean,
        },
        CanSuspendDoses:{
            type:Boolean,
            default:false,
        },

        CanAddNewDose:{
            type:Boolean,
            default:true,
        },
        CanEditDoses:{
            type:Boolean,
            default:true,
        },
        CanChangeDoseStatus:{
            type:Boolean,
            default:false,
        },

        CanReadDoses:{
            type:Boolean,
            default:true,
        },
        //////Refile/////
        CanReadRefile:{//deprecated
            type:Boolean,
        
        },
        CanWriteRefile:{
            type:Boolean,
        },
        //////Share/////
        CanShareMedInfo:{
            type:Boolean,
            default:false,
        },
        CanShareDosesInfo:{
            type:Boolean,
            default:false,
        }
      
        
    }],
    notify:{
        type:Boolean,
        default:true
    },
    IsDeleted:{
        type:Boolean,
        default:false
    },
    DependentProfileNickName:{
        type:String,
        default:null
    },
    CareGiverNickName:{
        type:String,
        default:null
    },
    Invitation:{
        type:Schema.Types.ObjectId,
        ref:"Invitation",
    },
    NotificationSettings:{
    DoseNotify30m:{
        type:Boolean,
        default:true
    },
    DoseNotify60m:{
        type:Boolean,
        default:true
    },
    MedRefile:{
        type:Boolean,
        default:true
    },
    NewSymptom:{
        type:Boolean,
        default:true
    },
    NewBloodGlucoseReading:{
        type:Boolean,
        default:true
    },
    BloodGlucoseReminder30m:{
        type:Boolean,
        default:true
    },
    BloodGlucoseReminder60m:{
        type:Boolean,
        default:true
    },
    NewBloodPressureReading:{
        type:Boolean,
        default:true
    },
    BloodPressureReminder30m:{
        type:Boolean,
        default:true
    },
    BloodPressureReminder60m:{
        type:Boolean,
        default:true
    },

 }

 
 
},{ timestamps: true });



const Viewer = mongoose.model("Viewer", ViewerSchema);

module.exports = Viewer ;