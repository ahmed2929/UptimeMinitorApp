const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var InvitationsSchema = new Schema({
   From:{
         type:Schema.Types.ObjectId,
            ref:"Profile",
   },
    To:{
        type:Schema.Types.ObjectId,
        ref:"Profile",
    },
    Status:{
        type:Number,
        default:0, // 0:pending, 1:accepted , 2:rejected
    },
    dependent:{
        type:Schema.Types.ObjectId,
        ref:"Dependent",
    },
    permissions:{
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
    
         // CanWriteSymptoms:{
        //     type:Boolean,
        //     default:true,
        // },
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
     
    
        // CanWriteDoses:{
        //     type:Boolean,
        //     default:false,
        // },
        CanSuspendDoses:{
            type:Boolean,
            default:true,
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
    //    CanReadRefile:{
    //     type:Boolean,
    //     default:true,
    //     },
    
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
            // CanWrite:{
            //     type:Boolean,
            //     default:true,
            // },
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
    // CanWriteDoses:{
    //     type:Boolean,
    //     default:false,
    // }
            CanSuspendDoses:{
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
    
            CanReadDoses:{
                type:Boolean,
                default:true,
            },
            //////Refile/////
            // CanReadRefile:{
            //     type:Boolean,
            //     default:true,
            // },
            // CanWriteRefile:{
            //     type:Boolean,
            //     default:false,
            // },
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

     
    
    },
    AccountType:{
        /**
         * 1: the receiver will be a dependent
         * 2: if the receiver will be a caregiver,
         * 3: receiver will be MasterToDependent and the old master will be removed,
         * 4: will be MasterToDependent and the old master will remain
         * 
         */
        type:Number,  
        default:1
    },
    externalData:{
        type:Object,
        default:{}
    },


 
 
},{ timestamps: true });



const Invitation = mongoose.model("Invitation", InvitationsSchema);

module.exports = Invitation;