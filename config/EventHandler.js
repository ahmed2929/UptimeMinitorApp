const EventEmitter = require("events");
const {ChecksRuner} =require("../Monitor/index")
console.log("global ob from event handler ",global.CheckIntervals)

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

  module.exports = eventEmitter;