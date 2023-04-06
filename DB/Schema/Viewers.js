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
        default:true,
    },
    //permissions

    //Medication
    CanDeleteAllMeds:{
        type:Boolean,
        default:true,
    },
    CanEditAllMeds:{
        type:Boolean,
        default:true,
    },
    CanReadAllMeds:{
        type:Boolean,
        default:true,
    },
    CanAddMeds:{
        type:Boolean,
        default:true,
    },

    //Symptom

     CanWriteSymptoms:{
        type:Boolean,
        default:true,
    },
    CanReadSymptoms:{
        type:Boolean,
        default:true,
    },
    CanDeleteSymptoms:{
        type:Boolean,
        default:true,
    },
    CanEditSymptoms:{
        type:Boolean,
        default:true,
    },
    CanAddSymptoms:{
        type:Boolean,
        default:true,
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
        default:true,
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
        default:true,
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
        default:true,
    },
    CanEditBloodGlucoseMeasurement:{
        type:Boolean,
        default:true,
    },
    CanDeleteBloodGlucoseMeasurement:{
        type:Boolean,
        default:true,
    },
    CanAddBloodGlucoseMeasurement:{
        type:Boolean,
        default:true,
    },
    CanReadBloodPressureMeasurement:{
        type:Boolean,
        default:true,
    },
    CanEditBloodPressureMeasurement:{
        type:Boolean,
        default:true,
    },
    CanDeleteBloodPressureMeasurement:{
        type:Boolean,
        default:true,
    },
    CanAddBloodPressureMeasurement:{
        type:Boolean,
        default:true,
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
            default:true,
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