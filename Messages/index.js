

exports.verifyAccount = (VerifictionCode) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">uptime</p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        your verifiction code is : ${VerifictionCode}
        
        </p>
        
       
        </div>
    </div>
</div>
         `
}


exports.StatusChange = (Status,url) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(220,220,220);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">uptime</p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        your application status changed to : ${Status}
       for url : ${url}
        
        </p>
        
       
        </div>
    </div>
</div>
         `
}

