const Checks= require("../DB/Schema/Check")
const {ChecksRuner} =require("../Monitor/index")
global.CheckIntervals = [];
exports.RunCheckIntervals=async()=>{
const checks=await Checks.find();
for (const check of checks) {
    const IntervalObjet = await ChecksRuner(check);
    global.CheckIntervals.push({
      CheckID: check._id,
      interval: IntervalObjet,
    });
}


}