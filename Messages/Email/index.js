exports.InvitationSentToExistentCareGiverUser_EN = (InvitationFrom,userName) => {
	
  return `
    <!DOCTYPE html>
<html>
<head>
  <title>Care Circle Invitation</title>
  <style>
    /* Cool styles using CSS */
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    }
    h1 {
      color: #295788;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
      max-width: 600px;
      background-color: #fff;
      border: 2px solid #295788;
    }
    td {
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    img {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #295788;
      text-align: center;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td>
        <h1>Care Circle Invitation</h1>
        <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
        <p>Dear user,</p>
        <p>hello ${userName} , ${InvitationFrom} sent you invitation to become a caregiver </p>
        <p>please open voithy to check that</p>
        <p>Thank you,</p>
        <p>The Voithy Team</p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        For more information contact us at <a href="mailto:info@voithy.com">info@voithy.com</a>.
      </td>
    </tr>
  </table>
</body>
</html>

    
    `	


}


exports.InvitationSentToExistentCareGiverUser_AR = (InvitationFrom,userName) => {
  return `
  <!DOCTYPE html>
<html dir="rtl">
<head>
<title>Care Circle Invitation</title>
<style>
  /* Cool styles using CSS */
  body {
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
  }
  h1 {
    color: #295788;
    text-align: center;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;
    max-width: 600px;
    background-color: #fff;
    border: 2px solid #295788;
  }
  td {
    padding: 10px;
    text-align: left;
    vertical-align: top;
  }
  img {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    height: auto;
  }
  .otp {
    font-size: 24px;
    font-weight: bold;
    color: #295788;
    text-align: center;
    margin-top: 20px;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    font-size: 12px;
    color: #666;
  }
</style>
</head>
<body>
<table>
  <tr>
    <td>
      <h1>دعوة دائرة الرعاية</h1>
      <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
      <p> لديك دعوة جديدة </p>
      <p> يرجى فتح فويثي للتحقق من ذلك</p>
      <p>شكرا لك</p>
      <p>فريق فويثي</p>
    </td>
  </tr>
  <tr>
    <td class="footer">
    لمزيد من المعلومات اتصل بنا على <a href="mailto:info@voithy.com"> info@voithy.com </a>.    </td>
  </tr>
</table>
</body>
</html>

  
  `	


}




exports.InvitationSentToExistentDependentUser_EN = (InvitationFrom,userName) => {
  return `
  <!DOCTYPE html>
<html>
<head>
<title>Care Circle Invitation</title>
<style>
  /* Cool styles using CSS */
  body {
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
  }
  h1 {
    color:#295788;
    text-align: center;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;
    max-width: 600px;
    background-color: #fff;
    border: 2px solid #295788;
  }
  td {
    padding: 10px;
    text-align: left;
    vertical-align: top;
  }
  img {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    height: auto;
  }
  .otp {
    font-size: 24px;
    font-weight: bold;
    color: #295788;
    text-align: center;
    margin-top: 20px;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    font-size: 12px;
    color: #666;
  }
</style>
</head>
<body>
<table>
  <tr>
    <td>
      <h1>Care Circle Invitation</h1>
      <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
      <p>Dear user,</p>
      <p>hello ${userName} , ${InvitationFrom} sent you invitation to become a dependent </p>
      <p>please open voithy to check that</p>
      <p>Thank you,</p>
      <p>The Voithy Team</p>
    </td>
  </tr>
  <tr>
    <td class="footer">
      For more information contact us at <a href="mailto:info@voithy.com">info@voithy.com</a>.
    </td>
  </tr>
</table>
</body>
</html>

  
  `	



}

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

/** un done */
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
    <!DOCTYPE html>
<html>
<head>
  <title>Care Circle Invitation</title>
  <style>
    /* Cool styles using CSS */
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    }
    h1 {
      color: #295788;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
      max-width: 600px;
      background-color: #fff;
      border: 2px solid #295788;
    }
    td {
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    img {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #295788;
      text-align: center;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td>
        <h1>Care Circle Invitation</h1>
        <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
        <p>Dear user,</p>
        <p>hello ${userName} , ${InvitationFrom} sent you invitation to become a dependent </p>
        <p>please open voithy to check that</p>
        <p>Thank you,</p>
        <p>The Voithy Team</p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        For more information contact us at <a href="mailto:info@voithy.com">info@voithy.com</a>.
      </td>
    </tr>
  </table>
</body>
</html>

    
    `	


}
exports.InvitationSentToMyDependent_AR= (InvitationFrom,userName) => {
  return `
  <!DOCTYPE html>
<html dir="rtl">
<head>
<title>Care Circle Invitation</title>
<style>
  /* Cool styles using CSS */
  body {
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
  }
  h1 {
    color: #295788;
    text-align: center;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;
    max-width: 600px;
    background-color: #fff;
    border: 2px solid #295788;
  }
  td {
    padding: 10px;
    text-align: left;
    vertical-align: top;
  }
  img {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    height: auto;
  }
  .otp {
    font-size: 24px;
    font-weight: bold;
    color: #295788;
    text-align: center;
    margin-top: 20px;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    font-size: 12px;
    color: #666;
  }
</style>
</head>
<body>
<table>
  <tr>
    <td>
      <h1>دعوة دائرة الرعاية</h1>
      <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
      <p> لديك دعوة جديدة </p>
      <p> يرجى فتح فويثي للتحقق من ذلك</p>
      <p>شكرا لك</p>
      <p>فريق فويثي</p>
    </td>
  </tr>
  <tr>
    <td class="footer">
    لمزيد من المعلومات اتصل بنا على <a href="mailto:info@voithy.com"> info@voithy.com </a>.    </td>
  </tr>
</table>
</body>
</html>

  
  `		

}

exports.InvitationSentToExistentDependentUser_AR= (InvitationFrom,userName) => {
  return `
  <!DOCTYPE html>
<html dir="rtl">
<head>
<title>Care Circle Invitation</title>
<style>
  /* Cool styles using CSS */
  body {
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
  }
  h1 {
    color: #295788;
    text-align: center;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;
    max-width: 600px;
    background-color: #fff;
    border: 2px solid #295788;
  }
  td {
    padding: 10px;
    text-align: left;
    vertical-align: top;
  }
  img {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    height: auto;
  }
  .otp {
    font-size: 24px;
    font-weight: bold;
    color: #295788;
    text-align: center;
    margin-top: 20px;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    font-size: 12px;
    color: #666;
  }
</style>
</head>
<body>
<table>
  <tr>
    <td>
      <h1>دعوة دائرة الرعاية</h1>
      <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
      <p> لديك دعوة جديدة </p>
      <p> يرجى فتح فويثي للتحقق من ذلك</p>
      <p>شكرا لك</p>
      <p>فريق فويثي</p>
    </td>
  </tr>
  <tr>
    <td class="footer">
    لمزيد من المعلومات اتصل بنا على <a href="mailto:info@voithy.com"> info@voithy.com </a>.    </td>
  </tr>
</table>
</body>
</html>

  
  `		
}

/**un done */
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
    <!DOCTYPE html>
<html>
<head>
  <title>Care Circle Invitation</title>
  <style>
    /* Cool styles using CSS */
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    }
    h1 {
      color: #295788;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
      max-width: 600px;
      background-color: #fff;
      border: 2px solid #295788;
    }
    td {
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    img {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #295788;
      text-align: center;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td>
        <h1>Care Circle Invitation</h1>
        <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
        <p>Dear user,</p>
        <p>hello ${userName} , ${InvitationFrom} sent you invitation to become a caregiver </p>
        <p>please open voithy to check that</p>
        <p>Thank you,</p>
        <p>The Voithy Team</p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        For more information contact us at <a href="mailto:info@voithy.com">info@voithy.com</a>.
      </td>
    </tr>
  </table>
</body>
</html>

    
    `
}

/**un done  */
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


/*************************** */

exports.verifyAccount_EN = (VerifictionCode) => {
	return`<!DOCTYPE html>
    <html>
    <head>
      <title>Voithy Verification</title>
      <style>
        /* Cool styles using CSS */
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
        }
        h1 {
          color: #295788;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 auto;
          max-width: 600px;
          background-color: #fff;
          border: 2px solid #295788;
        }
        td {
          padding: 10px;
          text-align: left;
          vertical-align: top;
        }
        img {
          display: block;
          margin: 0 auto;
          max-width: 100%;
          height: auto;
        }
        .otp {
          font-size: 24px;
          font-weight: bold;
          color: #295788;
          text-align: center;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
            <h1>Voithy Verification</h1>
            <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
            <p>Dear user,</p>
            <p>Thank you for using Voithy. Your verification OTP is:</p>
            <div class="otp">${VerifictionCode}</div>
            <p>Please enter this OTP in the app to verify your account.</p>
            <p>If you did not request this verification, please ignore this email.</p>
            <p>Thank you,</p>
            <p>The Voithy Team</p>
          </td>
        </tr>
        <tr>
          <td class="footer">
            For more information contact us at <a href="mailto:info@voithy.com">info@voithy.com</a>.
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
}



exports.forgetMessage_EN = ( code) => {
	return `
    <!DOCTYPE html>
<html>
<head>
  <title>Voithy Password Reset</title>
  <style>
    /* Cool styles using CSS */
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    }
    h1 {
      color: #295788;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
      max-width: 600px;
      background-color: #fff;
      border: 2px solid #295788;
    }
    td {
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    img {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #295788;
      text-align: center;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td>
        <h1>Voithy Password Reset</h1>
        <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
        <p>Dear user,</p>
        <p>You are receiving this email because you requested a password reset for your Voithy account.</p>
        <p>Your verification OTP is:</p>
        <div class="otp">${code}</div>
        <p>Please enter this OTP in the app to reset your password.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p>Thank you,</p>
        <p>The Voithy Team</p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        For more information contact us at <a href="mailto:info@voithy.com">info@voithy.com</a>.
      </td>
    </tr>
  </table>
</body>
</html>

    
    `
}

exports.resetSuccess_EN = (name) => {
    return`<!DOCTYPE html>
    <html>
    <head>
      <title>Password Rest</title>
      <style>
        /* Cool styles using CSS */
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
        }
        h1 {
          color: #295788;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 auto;
          max-width: 600px;
          background-color: #fff;
          border: 2px solid #295788;
        }
        td {
          padding: 10px;
          text-align: left;
          vertical-align: top;
        }
        img {
          display: block;
          margin: 0 auto;
          max-width: 100%;
          height: auto;
        }
        .otp {
          font-size: 24px;
          font-weight: bold;
          color: #295788;
          text-align: center;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
          <p>Your request was processed successfully.</p>
            <p>Thank you,</p>
            <p>The Voithy Team</p>
          </td>
        </tr>
        <tr>
          <td class="footer">
            For more information contact us at <a href="mailto:info@voithy.com">info@voithy.com</a>.
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
}


exports.verifyAccount_AR = (VerifictionCode) => {
	return `
  <!DOCTYPE html>
   <html dir="rtl" lang="ar">
    
    <head>
     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Voithy Verification</title>
      <style>
        /* Cool styles using CSS */
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
        }
        h1 {
          color: #295788;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 auto;
          max-width: 600px;
          background-color: #fff;
          border: 2px solid #295788;
        }
        td {
          padding: 10px;
          text-align: left;
          vertical-align: top;
        }
        img {
          display: block;
          margin: 0 auto;
          max-width: 100%;
          height: auto;
        }
        .otp {
          font-size: 24px;
          font-weight: bold;
          color: #295788;
          text-align: center;
          margin-top: 55px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        p{
            float: right;
        }
        table {   direction: rtl; }
        td {   direction: rtl; }
      </style>
    </head>
    <body>
      <table dir="rtl">
        <tr>
          <td td dir="rtl">
            <h1>تفعيل الحساب </h1>
            <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
            <p> عزيزي المستخدم، </p>
            <p>شكرا لاستخدام فويثي كود التحقق الخاص بك هوا </p>
            <div class="otp">${VerifictionCode}</div>
            <p>يرجى إدخال OTP هذا في التطبيق للتحقق من حسابك</p>
            <p>إذا لم تطلب هذا التحقق ، يرجى تجاهل هذا البريد الإلكتروني.</p>
            <p>شكرًا لك</p>
            <p>فريق فويثي</p>
          </td>
        </tr>
        <tr>
          <td class="footer">
          لمزيد من المعلومات اتصل بنا على <a href="mailto:info@voithy.com"> info@voithy.com </a>.          </td>
        </tr>
      </table>
    </body>
    </html>
         
         `
}



exports.forgetMessage_AR = ( code) => {
	return `
    <!DOCTYPE html>
<html dir="rtl">
<head>
  <title>اعادة تعين كلمة المرور</title>
  <style>
    /* Cool styles using CSS */
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    }
    h1 {
      color: #295788;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
      max-width: 600px;
      background-color: #fff;
      border: 2px solid #295788;
    }
    td {
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    img {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #295788;
      text-align: center;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td>
        <h1>إعادة تعيين كلمة المرور </h1>
        <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
        <p>عزيزي المستخدم</p>
        <p> تتلقى هذا البريد الإلكتروني لأنك طلبت إعادة تعيين كلمة المرور لحساب  الخاص بك.</p>
        <p>كود اعادة تعين كلمة المرور:</p>
        <div class="otp">${code}</div>
        <p>يرجى إدخال OTP هذا في التطبيق لإعادة تعيين كلمة المرور الخاصة بك</p>
        <p>ذا لم تطلب إعادة تعيين كلمة المرور هذه ، فيرجى تجاهل هذا البريد الإلكتروني.</p>
        <p>شكرًا لك</p>
        <p>فريق فويثي</p>
      </td>
    </tr>
    <tr>
      <td class="footer">
      لمزيد من المعلومات اتصل بنا على <a href="mailto:info@voithy.com"> info@voithy.com </a>.      </td>
    </tr>
  </table>
</body>
</html>

    
    
    `
}

exports.resetSuccess_AR = (name) => {
    return`<!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>Password Rest</title>
      <style>
        /* Cool styles using CSS */
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
        }
        h1 {
          color: #295788;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 auto;
          max-width: 600px;
          background-color: #fff;
          border: 2px solid #295788;
        }
        td {
          padding: 10px;
          text-align: left;
          vertical-align: top;
        }
        img {
          display: block;
          margin: 0 auto;
          max-width: 100%;
          height: auto;
        }
        .otp {
          font-size: 24px;
          font-weight: bold;
          color: #295788;
          text-align: center;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
          <p>تمت اعادة تعين كلمة المرور نجاح.</p>
            <p>شكرًا لك،</p>
            <p>فريق فويثي</p>
          </td>
        </tr>
        <tr>
          <td class="footer">
          لمزيد من المعلومات اتصل بنا على <a href="mailto:info@voithy.com"> info@voithy.com </a>.          </td>
        </tr>
      </table>
    </body>
    </html>
    `
}


exports.NewFeedBack_EN = (FeedBack) => {
	
  return `
    <!DOCTYPE html>
<html>
<head>
  <title>New FeedBack</title>
  <style>
    /* Cool styles using CSS */
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    }
    h1 {
      color: #295788;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
      max-width: 600px;
      background-color: #fff;
      border: 2px solid #295788;
    }
    td {
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    img {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #295788;
      text-align: center;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td>
        <h1>New Feedback</h1>
        <img src="https://i.ibb.co/dr2Mc9J/Voithy-Logo.png" alt="Voithy Logo">
        <p>user name :${FeedBack.firstName} ${FeedBack.lastName}</p>
        <p>user email :${FeedBack.email}</p>
        <p>user mobile :${FeedBack.CountryCode}${FeedBack.phoneNumber}</p>
        <p>feedback type :${FeedBack.type}</p>
        <p>feedback Description :${FeedBack.Description}</p>
        <p> has img :${FeedBack.img}</p>
        <p> has voice :${FeedBack.voice}</p>
        <p>Thank you,</p>
        <p>The Voithy Team</p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        For more information contact us at <a href="mailto:info@voithy.com">info@voithy.com</a>.
      </td>
    </tr>
  </table>
</body>
</html>

    
    `	


}
