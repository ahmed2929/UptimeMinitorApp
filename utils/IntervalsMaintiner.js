exports.IntervalsHandler=function(data,action){

    const Intervals=[];
    console.log("IntervalsHandler ",Intervals)
    return function(data,action){
        switch (action) {
            case action==='add':
                Intervals.push({
                    ...data
                  });
                
                break;
                case action==='update':
                     IntervalObj =  Intervals.filter(
                        (CheckObject) => CheckObject.CheckID == data.check._id
                      )[0];
                     
                      if(IntervalObj){
                          clearInterval(IntervalObj.interval);
                      }
                      Intervals.forEach((CheckObject) => {
                        if (CheckObject.CheckID == check._id) CheckObject.interval = data.interval;
                      });
                    
                    break;
                    
                    case action==='delete':
                         IntervalObj =  Intervals.find(
                            (CheckObject) => CheckObject.CheckID == data.check._id
                          )[0];
                          if(IntervalObj){
                              clearInterval(IntervalObj.interval);
                          }
                        
                        break;            
        
            default:
                break;
        }

        
    }



}

