exports.NewInvitationFromCareGiver_EN_GCM=(InvitationFrom,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `Care Circle Invitation`,
            "body": `You received a Care Circle invitation. Open Voithy app to view its details`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}
exports.NewInvitationFromCareGiver_AR_GCM=(InvitationFrom,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `لديك دعوة جديدة`,
                "body": `قم بفتح تطبيق فويثي`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}


exports.DependentAcceptedInvitation_EN_GCM=(DependentName,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `Your Invitation has been accepted `,
            "body": `Open Voithy to view the details`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}
exports.DependentAcceptedInvitation_AR_GCM=(DependentName,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": ` قبل دعوتك`,
            "body": ` قبل دعوتك`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}

exports.NewInvitationFromDependent_EN_GCM=(DependentName,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `Care Circle Invitation`,
            "body": `You received a Care Circle invitation. Open Voithy app to view its details`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}
exports.NewInvitationFromDependent_AR_GCM=(DependentName,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": ` بارسال دعوة`,
            "body": ` بارسال دعوة لك أن تكون مرافق له`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}

exports.CareGiverAcceptedInvitation_EN_GCM=(CareGiver,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `Your Invitation has been accepted `,
            "body": `Open Voithy to view the details.`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}

exports.CareGiverAcceptedInvitation_AR_GCM=(CareGiver,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": ` قبل دعوتك`,
            "body": ` قبل دعوتك`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}

exports.RefileAlert_EN_GCM=(patientName,MedName,MedID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `Refilel Alert`,
            "body": `Open Voithy app to view its details`
        },
        "data":{
            "MedID": `${MedID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}

exports.RefileAlert_AR_GCM=(patientName,MedName,MedID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `تنبيه إعادة التعبئة`,
            "body": `قم بفتح التطبيق `
        },
        "data":{
            "MedID": `${MedID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        }
    }
}

exports.NewSymptom_EN_GCM=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
           
                "title": `patient has new symptom`,
                "body": `patient has new symptom `
            },
            "data":{
                "SymptomID": `${NewSymptomID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            
        }
    }
}

exports.NewSymptom_AR_GCM=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `المريض لديه عرض جديد`,
            "body": `المريض لديه عرض جديد`,
           
            },
            "data":{
                "SymptomID": `${NewSymptomID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            
        }
    }
}
exports.NewSymptomAddedToMe_EN_GCM=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
           
            "title": `A new Symptom has been added`,
            "body": `CareGiver has added new symptom to you `
        },
        "data":{
            "SymptomID": `${NewSymptomID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        
    }
    }
}
exports.NewSymptom_AR_APNS=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
           
            "title": `  تم اضافة عرض جديد `,
            "body": `تم اضافة عرض جديد `
        },
        "data":{
            "SymptomID": `${NewSymptomID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        
    }
    }
}
/////////////////////////////////////////IOS/////////////////////////////////////////

exports.NewInvitationFromCareGiver_EN_APNS=(InvitationFrom,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `Care Circle Invitation.`,
                "body": `You received a Care Circle invitation. Open Voithy app to view its details`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
                
            }
        }
    }
}

exports.NewInvitationFromCareGiver_AR_APNS=(InvitationFrom,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `لديك دعوة جديدة`,
                "body": `قم بفتح تطبيق فويثي`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}

exports.DependentAcceptedInvitation_EN_APNS=(DependentName,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `Your Invitation has been accepted `,
                "body": `Open Voithy to view the details`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}

exports.DependentAcceptedInvitation_AR_APNS=(DependentName,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": ` قبل دعوتك`,
                "body": ` قبل دعوتك`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}
exports.NewInvitationFromDependent_EN_APNS=(DependentName,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `Care Circle Invitation`,
                "body": `You received a Care Circle invitation. Open Voithy app to view its details`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}
exports.NewInvitationFromDependent_AR_APNS=(DependentName,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": ` بارسال دعوة`,
                "body": ` بارسال دعوة لك أن تكون مرافق له`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}

exports.CareGiverAcceptedInvitation_EN_APNS=(CareGiver,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `Your Invitation has been accepted`,
                "body": `Open Voithy to view the details.`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}

exports.CareGiverAcceptedInvitation_AR_APNS=(CareGiver,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": ` قبل دعوتك`,
                "body": ` قبل دعوتك`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}
exports.RefileAlert_EN_APNS=(patientName,MedName,MedID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `Refilel Alert`,
                "body": `Open Voithy app to view its details`
            },
            "data":{
                "MedID": `${MedID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}
exports.RefileAlert_AR_APNS=(patientName,MedName,MedID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `تنبيه إعادة التعبئة`,
                "body": `تنبيه إعادة التعبئة`,
            },
            "data":{
                "MedID": `${MedID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}

exports.NewSymptom_EN_APNS=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `patient has new symptom`,
                "body": `patient has new symptom `
            },
            "data":{
                "SymptomID": `${NewSymptomID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}
exports.NewSymptom_AR_APNS=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `المريض لديه عرض جديد`,
                "body": ` لديه عرض جديد`
            },
            "data":{
                "SymptomID": `${NewSymptomID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}


exports.NewSymptomAddedToMe_EN_APNS=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `A new Symptom has been added`,
                "body": `CareGiver has added new symptom to you `
            },
            "data":{
                "SymptomID": `${NewSymptomID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}
exports.NewSymptom_AR_APNS=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": `  تم اضافة عرض جديد `,
                "body": `تم اضافة عرض جديد `
            },
            "data":{
                "SymptomID": `${NewSymptomID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}