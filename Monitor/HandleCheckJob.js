const { workerData,Worker } = require("worker_threads")
const {PrepareCheckRequest,pingToSingleServer,GenerateReportData}=require("../utils/HelperFunctions")
const Report =require('../DB/Schema/Report');
const CheckData = JSON.parse(workerData);
const {ConnetToDB, CloseDBConnection} =require("../DB/Server/index")
ConnetToDB()

const JobRun =async(check)=>{
            try {
                console.log("global ob is ",global.CheckIntervals)
                console.log("new job has started , interval is",CheckData.interval)
                  //preparte request data
            const {URL,options} =await PrepareCheckRequest(CheckData);
           
            //sending request to the server
            const ServerResponse=await pingToSingleServer(URL,options);
           // console.log("server response ois ", ServerResponse.error)
            // generating report
            const report =await Report.findOne({check:CheckData._id})
            const GeneratedReportData =GenerateReportData(report,ServerResponse,CheckData);
            // check for data change
            if(report.status!==GenerateReportData.status){
                // notify the user
            }

            //set data
            report.status=GeneratedReportData.status;
            report.availability=GeneratedReportData.availability;
            report.uptime=GeneratedReportData.uptime
            report.downtime=GeneratedReportData.downtime
            report.outages=GeneratedReportData.outages
            report.reaches=GeneratedReportData.reaches
            report.responseTimes=GeneratedReportData.responseTimes
            report.responseTime=GeneratedReportData.responseTime
            report.history=GeneratedReportData.history
            
            await report.save()
            process.exit();

            } catch (error) {
                console.log(error)
                process.exit();
                
            }
          
            


     

}

JobRun()

