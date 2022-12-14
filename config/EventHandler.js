const EventEmitter = require("events");
const {ChecksRuner} =require("../Monitor/index")
const  mail = require("../config/MailConfig");
const {StatusChange} =require("../Messages/index")
const {sendWebhook} =require("../utils/HelperFunctions")
const messages =require("../Messages/index");
const {getUserEmailFromId,SendEmailToUser} =require("../utils/HelperFunctions")
const eventEmitter = new EventEmitter();
eventEmitter.on("CheckCreated", async(check) => {
    console.log("event runs")
    const IntervalObjet = await ChecksRuner(check);
    global.CheckIntervals.push({
      CheckID: check._id,
      interval: IntervalObjet,
    });
  });

  eventEmitter.on("CheckUpdated", async (check) => {
    let IntervalObj =  global.CheckIntervals.filter(
      (CheckObject) => CheckObject.CheckID.toString() == check._id.toString()
    )[0];
   
    if(IntervalObj){
        clearInterval(IntervalObj.interval);
    }
    
    const NewIntervalObjet = await ChecksRuner(check);
    global.CheckIntervals.forEach((CheckObject) => {
      if (CheckObject.CheckID.toString() == check._id.toString()) CheckObject.interval = NewIntervalObjet;
    });
  });  

  eventEmitter.on("CheckDeleted", async (check) => {
    let IntervalObj =  global.CheckIntervals.find(
      (CheckObject) => CheckObject.CheckID.toString() == check._id.toString()
    )[0];
    if(IntervalObj){
        clearInterval(IntervalObj.interval);
    }
    
    clearInterval(IntervalObj.interval);
    
  });  


  eventEmitter.on("StateChanged", async (data) => {
   
    // sending email
    const email=await getUserEmailFromId(data.owner)
    const StatusChangeMessage = messages.StatusChange(data.status,data.url); 
    await SendEmailToUser(email,StatusChangeMessage)
    if(data.webhook){
      await sendWebhook(data.webhook,`system status chaned to ${data.status}`)
    }
    


    
  });  

  

  module.exports = eventEmitter;