exports.NewInvitationFromCareGiver_EN_GCM=(InvitationFrom,InvitationID,NotificationActionType)=>{
    return {
        "notification":{
            "title": `new invitation from ${InvitationFrom}`,
            "body": `${InvitationFrom} sent you invitation to be a dependent`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}
exports.NewInvitationFromCareGiver_AR_GCM=(InvitationFrom,InvitationID,NotificationActionType)=>{
    return {
        "notification":{
            "title": ` بارسال دعوة ${InvitationFrom} قام`,
            "body": ` بارسال دعوة لتكون مريض لديه ${InvitationFrom} قام`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}


exports.DependentAcceptedInvitation_EN_GCM=(DependentName,InvitationID,NotificationActionType)=>{
    return {
        "notification":{
            "title": `${DependentName}, accepted your invitation`,
            "body": `${DependentName}, accepted your invitation`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}
exports.DependentAcceptedInvitation_AR_GCM=(DependentName,InvitationID,NotificationActionType)=>{
    return {
        "notification":{
            "title": `${DependentName}, قبل دعوتك`,
            "body": `${DependentName}, قبل دعوتك`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}

exports.NewInvitationFromDependent_EN_GCM=(DependentName,InvitationID,NotificationActionType)=>{
    return {
        "notification":{
            "title": `${DependentName}, sent you invitation`,
            "body": `${DependentName}, sent you invitation to be his caregiver`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}
exports.NewInvitationFromDependent_AR_GCM=(DependentName,InvitationID,NotificationActionType)=>{
    return {
        "notification":{
            "title": `${DependentName}, بارسال دعوة`,
            "body": `${DependentName}, بارسال دعوة لك أن تكون مرافق له`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}

exports.CareGiverAcceptedInvitation_EN_GCM=(CareGiver,InvitationID,NotificationActionType)=>{
    return {
        "notification":{
            "title": `${CareGiver}, accepted your invitation`,
            "body": `${CareGiver}, accepted your invitation`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}

exports.CareGiverAcceptedInvitation_AR_GCM=(CareGiver,InvitationID,NotificationActionType)=>{
    return {
        "notification":{
            "title": `${CareGiver}, قبل دعوتك`,
            "body": `${CareGiver}, قبل دعوتك`
        },
        "data":{
            "InvitationID": `${InvitationID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}

exports.RefileAlert_EN_GCM=(patientName,MedName,MedID,NotificationActionType)=>{
    return {
        "notification":{
            "title": `Refilel Alert`,
            "body": `${patientName} need to Refilel ${MedName}`
        },
        "data":{
            "MedID": `${MedID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}

exports.RefileAlert_AR_GCM=(patientName,MedName,MedID,NotificationActionType)=>{
    return {
        "notification":{
            "title": `تنبيه إعادة التعبئة`,
            "body": `${patientName} يحتاج إلى إعادة تعبئة ${MedName}`
        },
        "data":{
            "MedID": `${MedID}`,
            "NotificationActionType":`${NotificationActionType}`
        }
    }
}


/////////////////////////////////////////IOS/////////////////////////////////////////

exports.NewInvitationFromCareGiver_EN_APNS=(InvitationFrom,InvitationID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `new invitation from ${InvitationFrom}`,
                "body": `${InvitationFrom} sent you invitation to be a dependent`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`
                
            }
        }
    }
}

exports.NewInvitationFromCareGiver_AR_APNS=(InvitationFrom,InvitationID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `بارسال دعوة ${InvitationFrom} قام`,
                "body": `بارسال دعوة لتكون مريض لديه ${InvitationFrom} قام`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`
            }
        }
    }
}

exports.DependentAcceptedInvitation_EN_APNS=(DependentName,InvitationID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `${DependentName}, accepted your invitation`,
                "body": `${DependentName}, accepted your invitation`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`
            }
        }
    }
}

exports.DependentAcceptedInvitation_AR_APNS=(DependentName,InvitationID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `${DependentName}, قبل دعوتك`,
                "body": `${DependentName}, قبل دعوتك`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`
            }
        }
    }
}
exports.NewInvitationFromDependent_EN_APNS=(DependentName,InvitationID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `${DependentName}, sent you invitation`,
                "body": `${DependentName}, sent you invitation to be his caregiver`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`
            }
        }
    }
}
exports.NewInvitationFromDependent_AR_APNS=(DependentName,InvitationID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `${DependentName}, بارسال دعوة`,
                "body": `${DependentName}, بارسال دعوة لك أن تكون مرافق له`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`
            }
        }
    }
}

exports.CareGiverAcceptedInvitation_EN_APNS=(CareGiver,InvitationID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `${CareGiver}, accepted your invitation`,
                "body": `${CareGiver}, accepted your invitation`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`
            }
        }
    }
}

exports.CareGiverAcceptedInvitation_AR_APNS=(CareGiver,InvitationID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `${CareGiver}, قبل دعوتك`,
                "body": `${CareGiver}, قبل دعوتك`
            },
            "data":{
                "InvitationID": `${InvitationID}`,
                "NotificationActionType":`${NotificationActionType}`
            }
        }
    }
}
exports.RefileAlert_EN_APNS=(patientName,MedName,MedID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `Refilel Alert`,
                "body": `${patientName} need to Refilel ${MedName}`
            },
            "data":{
                "MedID": `${MedID}`,
                "NotificationActionType":`${NotificationActionType}`
            }
        }
    }
}
exports.RefileAlert_AR_APNS=(patientName,MedName,MedID,NotificationActionType)=>{
    return {
        "aps":{
            "alert":{
                "title": `تنبيه إعادة التعبئة`,
                "body": `${patientName} يحتاج إلى إعادة تعبئة ${MedName}`
            },
            "data":{
                "MedID": `${MedID}`,
                "NotificationActionType":`${NotificationActionType}`
            }
        }
    }
}