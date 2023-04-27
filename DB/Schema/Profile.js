const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var ProfileSchema = new Schema({
  Owner:{ // the profile master
    User:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
  },
  Permissions:{
    CanRead:{
        type:Boolean,
        default:true
    },
    CanAddMeds:{
        type:Boolean,
        default:true
    },
    CanEditMeds:{
        type:Boolean,
        default:true
    },
    CanDeleteMeds:{
        type:Boolean,
        default:true
    },
    CanTakeDose:{
        type:Boolean,
        default:true
    },
    CanEditSingleDose:{
        type:Boolean,
        default:true
    },
    CanAddSingleDose:{
        type:Boolean,
        default:true
    },
    CanSuspendDoses:{
        type:Boolean,
        default:true
    },
    CanAddSymptom:{
        type:Boolean,
        default:true
    },
    CanEditSymptom:{
        type:Boolean,
        default:true
    },
    CanDeleteSymptom:{
        type:Boolean,
        default:true
    },
    CanManageCareCircle:{
        type:Boolean,
        default:true
    },
    CanEditProfile:{
        type:Boolean,
        default:true
    },
    CanManageMeasurement:{
        type:Boolean,
        default:true
    },
    CanReadMeasurement:{
        type:Boolean,
        default:true
    },
    //ePrescription
    CanDeleteAllEPrescriptions:{
        type:Boolean,
        default:true,
    },
    CanEditAllEPrescriptions:{
        type:Boolean,
        default:true,
    },
    CanReadAllEPrescriptions:{
        type:Boolean,
        default:true,
    },
    CanAddEPrescriptions:{
        type:Boolean,
        default:true,
    }
    },
    Dependents:[{
    
            Profile:{
                type:Schema.Types.ObjectId,
                ref:"Profile",
            },
            AccountType:{ //type 0 normal user , type 1 dependent with no phone
                type:Number,
                default:0
            },
            Dependent:{
                type:Schema.Types.ObjectId,
                ref:"Dependent",
            },
            viewer:{
                type:Schema.Types.ObjectId,
                ref:"Viewer",
            }
     
    }],
    Viewers:[{
        viewer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Viewer"
        },
        Dependent:{
            type:Schema.Types.ObjectId,
            ref:"Dependent",
        }
   
    }],
    temp:{
        type:Boolean,
        default:false
    },
 
    lang:{
        type:String,
        default:"en"
    },
    NotificationInfo:{
        IOS:{
            type:Boolean,
            default:false
        },
        Android:{
            type:Boolean,
            default:false
        },
        DevicesTokens:[{
            DeviceOs:{
                type:String,
                required:true
            },
            DeviceToken:{
                type:String,
                required:true
            },
            NotificationRegister:{
               type: Object
            }
        }]

    },
    Deleted:{
        type:Boolean,
        default:false
    },
    gender:{
        type:Number, //0:male,1:female
    },
    DateOfBirth:{
        type:Date,
        
    },
    MasterUsers:[{
        type:Schema.Types.ObjectId,
        ref:"User",
    }],
    MasterProfiles:[{
        type:Schema.Types.ObjectId,
        ref:"Profile",
    }],
    test:{
        type:Boolean,
        default:false
      }


 
 
},{ timestamps: true });



const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;