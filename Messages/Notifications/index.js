exports.NewInvitationFromCareGiver_EN_GCM=(InvitationFrom,InvitationID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `You received a new request from a Caregiver`,
            "body": `Please open Voithy to view the details`,
            "sound": "default",

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
            "title": `لقد تلقيت طلبًا جديدًا من مقدم الرعاية`,
                "body": `الرجاء فتح فويثي لعرض التفاصيل`,
                "sound": "default",
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
            "title": `Your invitation has been accepted`,
            "body": `Please open Voithy to view the details`,
            "sound": "default",
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
            "title": ` تم قبول دعوتك`,
            "body": `الرجاء فتح فويثي لعرض التفاصيل`,
            "sound": "default",
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
            "title": `You received a new request from a Dependent`,
            "body": `Please open Voithy to view the details`,
            "sound": "default",
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
            "title": `لقد تلقيت طلبًا جديدًا من تابع`,
            "body": `الرجاء فتح فويثي لعرض التفاصيل`,
            "sound": "default",
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
            "title": `Your invitation has been accepted `,
            "body": `Please open Voithy to view the details`,
            "sound": "default",
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
            "title": ` تم قبول دعوتك`,
            "body": `الرجاء فتح فويثي لعرض التفاصيل`,
            "sound": "default",
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
            "body": `Please open Voithy to view the details`,
            "sound": "default",
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
            "body": `الرجاء فتح فويثي لعرض التفاصيل`,
            "sound": "default",
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
           
                "title": `A dependent added a new symptom`,
                "body": `Please open Voithy to view the details`,
                "sound": "default",
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
            "title": `أضاف أحد التابعين أعراضًا جديدة `,
            "body": `الرجاء فتح فويثي لعرض التفاصيل`,
            "sound": "default",
           
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
           
            "title": `Your caregiver added a new symptom to you`,
            "body": `Please open Voithy to view the details`,
            "sound": "default",
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
           
            "title": `  تم اضافة عرض جديد `,
            "body": `الرجاء فتح فويثي لعرض التفاصيل`,
            "sound": "default",
        },
        "data":{
            "SymptomID": `${NewSymptomID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        
    }
    }
}

exports.NewMeasurementAddedByMyDependnet_EN_GCM=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
            "title": `A dependent added a new Measurement`,
            "body": `Please open Voithy to view the details`,
            "sound": "default",
        },
        "data":{
            "SymptomID": `${NewSymptomID}`,
            "NotificationActionType":`${NotificationActionType}`,
            "NotificationID":`${NotificationID}`
        
    }
    }
}
exports.NewMeasurementAddedByMyDependnet_AR_GCM=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "notification":{
           
            "title": ` تم اضافة قياس جديد `,
                "body": `الرجاء فتح فويثي لعرض التفاصيل`,
                "sound": "default",
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
                "title": `You received a new request from a Caregiver`,
                "body": `Please open Voithy to view the details`
            },
            "sound": "default",
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
                "title": `لقد تلقيت طلبًا جديدًا من مقدم الرعاية`,
                "body": `الرجاء فتح فويثي لعرض التفاصيل`
            },
            "sound": "default",
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
                "title": `Your invitation has been accepted`,
                "body": `Please open Voithy to view the details`
            },
            "sound": "default",
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
                "title": ` تم قبول دعوتك`,
                "body": `الرجاء فتح فويثي لعرض التفاصيل`
            },
            "sound": "default",
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
                "title": `You received a new request from a Dependent`,
            "body": `Please open Voithy to view the details`
            },
            "sound": "default",
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
                "title": `لقد تلقيت طلبًا جديدًا من تابع`,
                "body": `الرجاء فتح فويثي لعرض التفاصيل`
            },
            "sound": "default",
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
                "title": `Your invitation has been accepted `,
                "body": `Please open Voithy to view the details`
            },
            "sound": "default",
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
            "title": ` تم قبول دعوتك`,
            "body": `الرجاء فتح فويثي لعرض التفاصيل`
            },
            "sound": "default",
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
                "body": `Please open Voithy to view the details`
            },
            "sound": "default",
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
                "body": `الرجاء فتح فويثي لعرض التفاصيل`
            },
            "sound": "default",
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
                "title": `A dependent added a new symptom`,
                "body": `Please open Voithy to view the details`
            },
            "sound": "default",
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
                "title": `أضاف أحد التابعين أعراضًا جديدة `,
                "body": `الرجاء فتح فويثي لعرض التفاصيل`
            },
            "sound": "default",
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
                 
            "title": `Your caregiver added a new symptom to you`,
            "body": `Please open Voithy to view the details`
            },
            "sound": "default",
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
                "body": `الرجاء فتح فويثي لعرض التفاصيل`
            },
            "sound": "default",
            "data":{
                "SymptomID": `${NewSymptomID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}

exports.NewMeasurementAddedByMyDependnet_AR_APNS=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                "title": ` تم اضافة قياس جديد `,
                "body": `الرجاء فتح فويثي لعرض التفاصيل`
            },
            "sound": "default",
            "data":{
                "SymptomID": `${NewSymptomID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}

exports.NewMeasurementAddedByMyDependnet_EN_APNS=(patientName,NewSymptomID,NotificationActionType,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                 
            "title": `A dependent added a new Measurement`,
            "body": `Please open Voithy to view the details`
            },
            "sound": "default",
            "data":{
                "SymptomID": `${NewSymptomID}`,
                "NotificationActionType":`${NotificationActionType}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}


exports.GeneralNotification_APNS=(title,body,data,action,NotificationID)=>{
    return {
        "aps":{
            "alert":{
                 
            "title": title,
            "body": body
            },
            "sound": "default",
            "data":{
                "Data": data,
                "NotificationActionType":`${action}`,
                "NotificationID":`${NotificationID}`
            }
        }
    }
}

exports.GeneralNotification_GCM=(title,body,data,action,NotificationID)=>{
    return {
        "notification":{
            "title": title,
            "body": body,
            "sound": "default",
        },
        "data":{
            "Data": data,
            "NotificationActionType":`${action}`,
            "NotificationID":`${NotificationID}`,
            
        }
    }
}
