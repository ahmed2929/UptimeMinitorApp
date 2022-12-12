

exports.verifyAccount = (VerifictionCode) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">VerifictionCode</p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        your verifiction code is : ${VerifictionCode}
        
        </p>
        
       
        </div>
    </div>
</div>
         `
}



exports.forgetMessage = ( code) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
	<div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
		
		<p style="margin:0; font-size:20px ">Logo</p>
		<h3 style="color:white; padding-top:30px; padding-bottom:20px; font-size:20px; margin:0; font-weight: bold;"> Dont worry, we all forget sometimes</h3>
		
		<hr style="color:white"/>
		
		
		<p style="color:white;padding-top:10px; padding-bottom:10px; line-height: 2em;">.</p>
        <a style="text-decoration:none; color:blue;" ""> OTP : ${code}
   
		<p style="color:white;padding-top:10px; line-height: 2em; margin:0">Cheers,</p>
		
	
		
	</div>
</div>
`
}

exports.resetSucess = (name) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
	<div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
		
		<p style="margin:0; font-size:20px ">Logo</p>
		<h3 style="color:white; padding-top:30px; padding-bottom:20px; font-size:20px; margin:0; font-weight: bold;"> You have got a new password</h3>
		
		
		
		<p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">Hi ${name}, You have successfully updated your password, if you did not make this change, please contact us.</p>
		
		
		
	</div>
</div>
    `
}