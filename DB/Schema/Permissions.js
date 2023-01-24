const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var PermissionSchema = new Schema({
  Profile:{
    type:Schema.Types.ObjectId,
    ref:"Profile",
    
},
User:{// profile owner
    type:Schema.Types.ObjectId,
    ref:"User",
},
    Medications:[{
        Profile:{
            type:Schema.Types.ObjectId,
            ref:"Profile",
        },
        Med:{
            type:Schema.Types.ObjectId,
            ref:"UserMedication",
        },
        Permissions:{
            read:{
                type:Boolean,
                default:true
            },
            write:{
                type:Boolean,
                default:true
            },
            notify:{
                type:Boolean,
                default:true
            }
        }
       

    }],
    Symptoms:[{
        Profile:{
            type:Schema.Types.ObjectId,
            ref:"Profile",
        },
        Symptom:{
            type:Schema.Types.ObjectId,
            ref:"Symptom",
        },
        Permissions:{
            read:{
                type:Boolean,
                default:true
            },
            write:{
                type:Boolean, 
                default:true
            },
            notify:{
                type:Boolean,
                default:true
            }
        }
    }]

 
 
},{ timestamps: true });



const Permission = mongoose.model("Permission", PermissionSchema);

module.exports = Permission ;