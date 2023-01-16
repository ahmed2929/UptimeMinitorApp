const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var ProfileSchema = new Schema({
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
    firstName:{
        type:String,
       
    },
    lastName:{
        type:String,
       
    },
    email:{
        type:String,
     

    },
    mobileNumber:{
        countryCode:{
          type:String,

        },
        phoneNumber:{
          type:String,
      
        }
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
            }
        }]

    }

 
 
},{ timestamps: true });



const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;