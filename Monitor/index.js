const {Worker} =require('worker_threads')
const path =require("path")

const ChecksRuner =async(check,JobHandler=`./Monitor/HandleCheckJob.js`)=>{

const intervalObject= setInterval(()=>{

    return new Promise((resolve, reject) => {
        const worker = new Worker(JobHandler, { workerData: JSON.stringify(check) });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            console.log("process exit")
            if (code !== 0)
                reject(new Error(`stopped with  ${code} exit code`));
        })
    })


},check.interval*1000)


return intervalObject
  

}

module.exports={
    ChecksRuner
}