const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var ProfileSchema = new Schema({
    AccountType:{ //type 0 normal user , type 1 dependent with no phone
    type:Number,
    default:0,
    required:true,

  },
  Owner:{ // the profile master
    User:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    Permissions:{
        read:{
            type:Boolean,
            default:true
        },
        write:{
            type:Boolean,
            default:true
        }
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
            }
     
}],
    Viewers:[{
       Profile:{
            type:Schema.Types.ObjectId,
            ref:"Profile",
        },
        Permissions:{
            type:Schema.Types.ObjectId,
            ref:"Permission",
        },
        CanWriteMeds:{
            type:Boolean,
            default:true
        },
        CanWriteSymptoms:{
            type:Boolean,
            default:true
        },
        notify:{
            type:Boolean,
            default:true
        }
    }],
    temp:{
        type:Boolean,
        default:false
    }

 
 
},{ timestamps: true });



const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;