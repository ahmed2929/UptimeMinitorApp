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
    CanReadDoses:{
        type:Boolean,
        default:true,
    },
    CanReadRefile:{
        type:Boolean,
        default:true,
    },
    CanReadAllMeds:{
        type:Boolean,
        default:true,
    },
    CanReadSymptoms:{
        type:Boolean,
        default:true,
    },
    CanWriteSymptoms:{
        type:Boolean,
        default:true,
    },
    CanAddMeds:{
        type:Boolean,
        default:true,
    },
    CanReadSpacificMeds:[{
        Med:{
            type:Schema.Types.ObjectId,
             ref:"Medication",
        },
        CanRead:{
            type:Boolean,
            default:true,
        },
        CanWrite:{
            type:Boolean,
            default:true,
        },
        CanReadDoses:{
            type:Boolean,
            default:true,
        },
        CanReadRefile:{
            type:Boolean,
            default:true,
        },
        CanWriteRefile:{
            type:Boolean,
            default:false,
        },
        CanWriteDoses:{
            type:Boolean,
            default:false,
        }
        
    }],
    CanWriteDoses:{
        type:Boolean,
        default:false,
    },
    notify:{
        type:Boolean,
        default:true
    },
    IsDeleted:{
        type:Boolean,
        default:false
    }
 

 
 
},{ timestamps: true });



const Viewer = mongoose.model("Viewer", ViewerSchema);

module.exports = Viewer ;