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
    CanReadRefil:{
        type:Boolean,
        default:true,
    },
    CanReadAllMeds:{
        type:Boolean,
        default:true,
    },
    CanReadSideEffect:{
        type:Boolean,
        default:true,
    },
    CanWriteSymtoms:{
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
        CanReadRefil:{
            type:Boolean,
            default:true,
        },
        CanWriteRefil:{
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
    }

 
 
},{ timestamps: true });



const Viewer = mongoose.model("Viewer", ViewerSchema);

module.exports = Viewer ;