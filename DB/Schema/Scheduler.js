const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var Scheduler = new Schema({
  medication:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'UserMedication'
  },
  User:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  StartDate:{
    type:Date,
    default:() => Date.now()

  },
  EndDate:{
    type:Date,
    default:null
  },

  AsNeeded:{
    type:Boolean,
    default:false

  },
  ScheduleType:{
    type:Number,
    enum:[0,1,2,3,4], // 0: Days of week schedule , 1: As Needed  , 2: Every Day , 3: Days Interval,4:fhir
    default:2
  },
  
  DaysInterval:{
    type:Number,
    default:null
  },
  SpecificDays:{
    type:[String],
    default:null
    },
 
  dosage:
    [
      {
        dose:{
          type:Number,
        },
        DateTime:{
          type:Date
        },
      

      }
    ],
    history:[{
      type:Object
    }],
    isDeleted:{
      type:Boolean,
      default:false
    },
    ProfileID:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Profile'
    },
    CreatorProfile:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Profile'
    },
    GenerateAutoOccurrence:{
      type:Boolean,
      default:false
    },
    Archived:{
      type:Boolean,
      default:false
    },
    fhir:{
      type:Boolean,
      default:false
    },
    fhirData:{
      fhirId:{
        type:String
      },
      fhirMedicationId:{
        type:String
      },
      authoredOn:{
        type:Date
      },
      reason:[{
        concept:{
          coding:[{
            system:{
              type:String,
              default:"http://snomed.info/sct"
            },
            code:{
              type:String,
              
            },
            display:{
              type:String,

            }
          }]
        }
      }],
      note:[{
        text:{
          type:String
        }
      }],
      dosageInstruction:[{
        sequence:{
          type:Number
        },
        text:{
          type:String
        },
        additionalInstruction:[{
          coding:[{
            system:{
              type:String,
              default:"http://snomed.info/sct"
            },
            code:{
              type:String,
            },
            display:{
              type:String,

            }
          }]
        }],
        patientInstruction:{
          type:String
        },

        timing:{
          repeat:{
            boundsPeriod:{
              start:{
                type:Date
              },
              end:{
                type:Date
              }
            },
            boundsDuration:{
              value:{
                type:Number,
              },
              unit:{
                type:String,
               
              },
              system:{
                type:String,
                default:"http://unitsofmeasure.org"
              },
              code:{
                type:String,

              },
              

            },

            frequency:{
              type:Number,
            
            },
            period:{
              type:Number,
            },
            periodMax:{
              type:Number,
            },
            periodUnit:{
              type:String,
            
            }
          },
        },
        asNeededFor:[{
          coding:[{
            system:{
              type:String,
              default:"http://snomed.info/sct"
            },
            code:{
              type:String,
            
            },
            display:{
              type:String,
            }
          }]
          
        }],
        route:{
          coding:[{
            system:{
              type:String,
              default:"http://snomed.info/sct"
            },
            code:{
              type:String,
            },
            display:{
              type:String,
            }
          }]
        },
        method:{
          coding:[{
            system:{
              type:String,
            },
            code:{
              type:String,

            },
            display:{
              type:String,

            }
          }]
        },
        doseAndRate:[{
       
          doseRange:{
            low:{
              value:{
                type:Number,
              },
              unit:{
                type:String,
              },
              system:{
                type:String,
              },
              code:{
                type:String,
              }
            },
            high:{
              value:{
                type:Number,
              },
              unit:{
                type:String,
              },
              system:{
                type:String,
              },
              code:{
                type:String,
              }
            },
          },
          doseQuantity:{
            value:{
              type:Number,
            },
            unit:{
              type:String,
            },
            system:{
              type:String,
            },
            code:{
              type:String,
            },
          },
          maxDosePerAdministration:{
            value:{
              type:Number,
              
            },
            unit:{
              type:String,
            },
            system:{
              type:String,
             
            },
            code:{
              type:String,
            },

          }
         
        }],
        GenerateAutoOccurrence:{
          type:Boolean,
          default:false
        }






      }],


    }
 

 
 
},{ timestamps: true });


const SchedulerSchema = mongoose.model("Scheduler", Scheduler);

module.exports = SchedulerSchema;