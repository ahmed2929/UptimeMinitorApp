exports.InvitationSentToExistentCareGiverUser_EN = (InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to be a caregiver to him </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        
        </p>
        
       
        </div>
    </div>
</div>
       
`}


exports.InvitationSentToExistentCareGiverUser_AR = (InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to join voith </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        
        </p>
        
       
        </div>
    </div>
</div>
       
`}




exports.InvitationSentToExistentDependentUser_EN = (InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to be your caregiver </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        
        </p>
        
       
        </div>
    </div>
</div>
       
`}

exports.InvitationSentToCareGiverToBeMaster_EN = (InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to be your master </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        
        </p>
        
       
        </div>
    </div>
</div>
       
`}

exports.InvitationSentToCareGiverToBeMaster_AR = (InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to be your master (arabic) </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        
        </p>
        
       
        </div>
    </div>
</div>
       
`}


exports.InvitationSentToMyDependent_EN = (InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent  invitation to be a caregiver to one of your dependents </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        
        </p>
        
       
        </div>
    </div>
</div>
       
`}
exports.InvitationSentToMyDependent_AR= (InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent  invitation to be a caregiver to one of your dependents (arabic version) </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        
        </p>
        
       
        </div>
    </div>
</div>
       
`}

exports.InvitationSentToExistentDependentUser_AR= (InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to join voith </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        
        </p>
        
       
        </div>
    </div>
</div>
       
`}

exports.InvitationSentToDependent_EN = (otp,InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to join voith </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        your password is : ${otp}
        
        </p>
        
       
        </div>
    </div>
</div>
         `
}

exports.InvitationSentToDependent_AR= (otp,InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to join voith </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        your one time password is : ${otp}
        
        </p>
        
       
        </div>
    </div>
</div>
         `
}




exports.InvitationSentToCareGiver_EN = (otp,InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to join voith </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        your  password is : ${otp}
        
        </p>
        
       
        </div>
    </div>
</div>
         `
}


exports.InvitationSentToCareGiver_AR = (otp,InvitationFrom,userName) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">hello ${userName} , ${InvitationFrom} sent you invitation to join voith </p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        your one time password is : ${otp}
        
        </p>
        
       
        </div>
    </div>
</div>
         `
}




exports.verifyAccount_EN = (VerifictionCode) => {
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



exports.forgetMessage_EN = ( code) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
	<div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
		
		<p style="margin:0; font-size:20px ">Logo</p>
		<h3 style="color:white; padding-top:30px; padding-bottom:20px; font-size:20px; margin:0; font-weight: bold;"> Dont worry, we all forget sometimes</h3>
		
		<hr style="color:white"/>
		
		
		<p style="color:white;padding-top:10px; padding-bottom:10px; line-height: 2em;">.</p>
        <a style="text-decoration:none; color:white;" ""> OTP : ${code}
   
		<p style="color:white;padding-top:10px; line-height: 2em; margin:0">Cheers,</p>
		
	
		
	</div>
</div>
`
}

exports.resetSuccess_EN = (name) => {
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


exports.verifyAccount_AR = (VerifictionCode) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
    <div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
        
        <p style="margin:0; font-size:20px ">كود التفعيل</p>

    
        <p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">
            
        ${VerifictionCode} : كود التفعيل
        
        </p>
        
       
        </div>
    </div>
</div>
         `
}



exports.forgetMessage_AR = ( code) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
	<div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
		
		<p style="margin:0; font-size:20px ">Logo</p>
		<h3 style="color:white; padding-top:30px; padding-bottom:20px; font-size:20px; margin:0; font-weight: bold;">اعادة تعين كلمة المرور</h3>
		
		<hr style="color:white"/>
		
		
		<p style="color:white;padding-top:10px; padding-bottom:10px; line-height: 2em;">.</p>
        <a style="text-decoration:none; color:white;" ""> OTP : ${code}
   
		<p style="color:white;padding-top:10px; line-height: 2em; margin:0">Cheers,</p>
		
	
		
	</div>
</div>
`
}

exports.resetSuccess_AR = (name) => {
	return `
    <div style="font-family: sans-serif; margin:0; background-color:rgb(72, 72, 155);">
	<div style=" padding-top:30px; padding-left:40px; width:80%; margin-left:auto; margin-right:auto" >
		
		<p style="margin:0; font-size:20px ">Logo</p>
		<h3 style="color:white; padding-top:30px; padding-bottom:20px; font-size:20px; margin:0; font-weight: bold;"> You have got a new password</h3>
		
		
		
		<p style="color:white;padding-top:20px; padding-bottom:20px; line-height: 2em;">تم اعادة تعين كلمة المرور الخاصة بك بنجاح ${name}مرحبا </p>
		
		
		
	</div>
</div>
    `
}