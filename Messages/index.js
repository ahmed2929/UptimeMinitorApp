

exports.welcomeMessage = (VerifictionCode) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">uptime</p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        your verifiction code is : ${VerifictionCode};
        
        </p>
        
       
        </div>
    </div>
</div>
         `
}

exports.forgetMessage = (email, emailtoken) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
	<div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
		
		<p style="margin:0; font-size:20px ">Logo</p>

		<h3 style="color:white; padding-top:30px; padding-bottom:20px; font-size:20px; margin:0; font-weight: bold;"> Dont worry, we all forget sometimes</h3>
		
		<hr style="color:white"/>
		
<p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">Hi ${email}, You recently asked to reset your password for this uptime monitoring account: <br>
${email}</p>
		
		<p style="color:white;padding-top:10px; padding-bottom:10px; line-height: 2em;">To update your account, click the button below.</p>

        <button style="background-color: white;  border-radius: 5px; padding:10px">
        <a style="text-decoration:none; color:blue;" href="http://www.localhost:3000/resetpage?token=${emailtoken}"">Reset my password</a>
    </button>

		<p style="color:white;padding-top:10px; line-height: 2em; margin:0">Cheers,</p>
		<p style="color:white; padding-bottom:10px; line-height: 2em;margin:0">uptime monitoring</p>
	
		<div style="color:white; text-decoration:none;padding-top:10px; padding-bottom:10px;">
			You are receiving this email because you are a registered user on <a href="https://www.uptime monitoringsdesk.co.uk"> uptime monitoring<a>
		</div>
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
		
		

		<button style="background-color: white;  border-radius: 5px; padding:10px; margin-top:20xp; margin-bottom: 40px;">
			<a style="text-decoration:none; color:blue; font-size:20px" href="https://localhost:3000">Go to uptime monitoring </a>
		</button>


		<hr style="color:white"/>
	
		<div style="color:white; text-decoration:none;padding-top:10px; padding-bottom:10px;">
			You are receiving this email because you are a registered user on <a href="https://www.uptime monitoringsdesk.co.uk"> uptime monitoring<a>
		</div>
	</div>
</div>
    `
}



