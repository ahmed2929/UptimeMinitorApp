const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var ProfileSchema = new Schema({
    AccountType:{ //type 0 normal user , type 1 dependent with no phone
    type:Number,
    default:0,
    required:true,

  },
  Owner:{
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
    Dependents:{
        type:[{
            Profiles:{
                type:Schema.Types.ObjectId,
                ref:"Profile",
            }
        }]
    },
    Viewers:[{
        User:{
            type:Schema.Types.ObjectId,
            ref:"User",
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
        }
    }]

 
 
},{ timestamps: true });



const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;