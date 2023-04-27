//create e-prescription schema 
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ePrescriptionSchema = new Schema({
    ProfileID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Profile'

    },
    CreatorProfile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Profile'
    },
    EditedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Profile'
    },
    Medications:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'UserMedication'
    }],
    isDeleted:{
        type:Boolean,
        default:false
    },
    Archived:{
        type:Boolean,
        default:false
    }


})

module.exports = mongoose.model('ePrescription', ePrescriptionSchema);
