const User = require("../../../DB/Schema/User");
const Profile = require("../../../DB/Schema/Profile");
const Permission = require("../../../DB/Schema/Permissions");
const messages = require("../../../Messages/index")
const {SendEmailToUser} =require("../../../utils/HelperFunctions")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");

const {GenerateToken,GenerateRandomCode,GenerateRefreshToken} =require("../../../utils/HelperFunctions")


// Signup
exports.signUp = async (req, res) => {

  /**
   * req: an object containing the HTTP request data, including the request body which should contain the user's email, mobile number, and other information needed to create a new user account.
    • res: an object containing the HTTP response data, including functions for sending a response back to the client.
    The function first tries to find an existing user with the provided email or mobile number. If a user is found, it returns an error message indicating that the email or mobile number is already taken. If no user is found, it generates a verification code and a verification expiration date (24 hours from the current time) and creates a new user account with this information. It also generates a token and a refresh token for the new user.
    If the new user's preferred language is English, it sends an email to the user's email address containing a message in English to verify their account using the generated verification code. If the language is not English, it sends a message in Arabic instead. Finally, it sends a successful response to the client containing the generated token and refresh token.
    If there is an error during the process, it returns an error response with a status code of 500 and the error message.
   * 
   * 
   */
 
  try {
    // get user with email
    const user = await User.findOne(
      { "$or": [ { email: req.body.email }, { 'mobileNumber.phoneNumber':req.body.mobileNumber.phoneNumber} ] }
    );

    // check if user exists and return error if user already exists
    if (user) {
      return errorResMsg(res, 423, req.t("email_is_already_taken_Or_phone"));
    }
    // generate VerifictionCode and VerifictionXpireDate for user .
    // VerifictionXpireDate after 24 hours
    const VerifictionCode = await GenerateRandomCode(2);
    const VerifictionXpireDate =  Date.now()  + 8.64e+7 ;

    const UserInfo={
        ...req.body,
        VerifictionCode,
        VerifictionXpireDate,
        temp:false
    }

    const newUser = await User.create(UserInfo);
    const newProfile =await Profile.create({
      Owner:{
        User:newUser._id
      }
      

    })
    newUser.profile=newProfile._id

 

    await newUser.save()
    // create user token
    const token = GenerateToken(newUser._id);
    const refreshToken = GenerateRefreshToken(newUser._id);
    

    // create data to be returned
    // const data = {
    //   token,
    //   refreshToken,
    //   user:{
    //     firstName:req.body.firstName,
    //     lastName:req.body.lastName,
    //     email:req.body.email,
    //     lang:req.body.lang||"en",
    //     verified:newUser.verified||false,
    //     profile:newProfile._id
        
    //   }
   
    // };

    if(newUser.lang==="en"){
      const VerifictionMessage = messages.verifyAccount_EN(VerifictionCode);
      await SendEmailToUser(newUser.email,VerifictionMessage)
    }else{
      const VerifictionMessage = messages.verifyAccount_AR(VerifictionCode);
      await SendEmailToUser(newUser.email,VerifictionMessage)
    }

   

    // return succesfull response
    return successResMsg(res, 201, req.t("registration_successful"));
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

// Login
exports.logIn = async (req, res) => {
  /**
   * the login process for an existing user. It takes in two parameters:
    • req: an object containing the HTTP request data, including the request body which should contain the user's email and password.
    • res: an object containing the HTTP response data, including functions for sending a response back to the client.
      The function first retrieves the user's email and password from the request body. It then checks if a user with the provided email exists, and retrieves the user's password if it does. It then checks if the provided password is correct by calling the correctPassword method on the user object. If the password is incorrect or the user does not exist, it returns an error message indicating that the email or password is incorrect.
      If the email and password are correct, it generates a token and a refresh token for the user and sends a successful response to the client containing the generated tokens.
      If there is an error during the process, it returns an error response with a status code of 500 and the error message.
   * 
   */
  try {
    const {
      email,
      password
    } = req.body;
    // check if user exists and select password
    console.log("email is ",email)
    const user = await User.findOne({
      email,
    }).select("+password");
    console.log("user i s ",user)
    if(!user){
      return errorResMsg(res, 401, req.t("User_not_found"));
    }
    if(user.verified===false){
      return errorResMsg(res, 401, req.t("Please_Verify_Your_Account"));
    }
    // check if user exists and if the password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      // return error message if password is wrong
      return errorResMsg(res, 401, req.t("Incorrect_email_or_password"));
    }

    // create user token
    const token = GenerateToken(user._id)
    const refreshToken = GenerateRefreshToken(user._id);
    // create data to be returned
    const data = {
      token,
      refreshToken,
      user:{
        firstName:user.firstName,
        lastName:user.lastName,
        email:user.email,
        lang:user.lang,
        verified:user.verified,
        profile:user.profile
        
      },
      ShouldRestPassword:user.ShouldRestPassword
    };
    // return succesfull response
    return successResMsg(res, 200, data);
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.SendRestPasswordCode= async (req, res) => {
  try {
    /**
     * The SendRestPasswordCode function is an asynchronous function that sends a reset password code to a user's email address.
      The function takes in two arguments: req and res. The req argument is the HTTP request object, which contains information about the incoming request, such as the body of the request, query parameters, and headers. The res argument is the HTTP response object, which is used to send a response back to the client.
      The function begins by trying to retrieve the email property from the req.body object. If the email property is not present, the function sends an error response with a status code of 406 (Not Acceptable) and a message indicating that the email is required.
      Next, the function uses the User model to try to find a user with the specified email address. If no user is found, the function sends an error response with a status code of 406 (Not Acceptable) and a message indicating that the user is not found.
      If a user is found, the function generates a random code using the  following equation  `Math.floor(Math.random()*9000+1000) `  
      and set expiration time to 24h from the  current time



      It then sends an email to the user with the reset password code. The email message is generated using a separate function (either messages.forgetMessage_EN or messages.forgetMessage_AR) depending on the user's language preference.
          4. The reset password code and expiration date are then saved to the user's record in the database.
          5. Finally, the function returns a success message saying that the reset password code has been sent.
      If any errors occur during the process, the function returns an error message with an HTTP status code of 500
     * 
     */
    const {email} = req.body;
    if (!email) {
      return  errorResMsg(res, 406, req.t("Email_is_required"));
    }

    const user = await User.findOne({email:email});

     if(!user){
      return  errorResMsg(res, 406, req.t('user_is_not_found'));
     }

     const RestPasswordCode = await GenerateRandomCode(2);
     const ResetPasswordXpireDate =  Date.now()  + 8.64e+7 ;
     if(user.lang==="en"){
      const ForgetPasswordMessage = messages.forgetMessage_EN(RestPasswordCode);
      await SendEmailToUser(user.email,ForgetPasswordMessage)
     }else{
      const ForgetPasswordMessage = messages.forgetMessage_AR(RestPasswordCode);
      await SendEmailToUser(user.email,ForgetPasswordMessage)
     }


    user.RestPasswordCode=RestPasswordCode;
    user.ResetPasswordXpireDate=ResetPasswordXpireDate;
    await user.save();

   
     
    return successResMsg(res, 200, req.t("rest_password_code_has_been_sent"));
  } catch (err) {
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.GenerateAccessResetPasswordToken= async (req, res) => {
  /**
   * The function starts by destructuring the email and code from the request body.
    1. It then searches for a user with the given email using the User.findOne() method.
    2. If no user is found, it sends an error response with a message saying "user is not found".
    3. If a user is found, it checks if the code provided in the request body matches the code stored in the user's record.
    4. If the codes do not match, it sends an error response with a message saying "code is not valid".
    5. If the codes match, it checks if the expiration date of the code has passed using the Date.now() method.
    6. If the expiration date has passed, it sends an error response with a message saying "code is expired".
    7. If the code is still valid, it generates a new token using the GenerateToken function and the user's id.
    8. It sends a successful response with the generated token using the successResMsg() function.
    Note: The errorResMsg() and successResMsg() functions are helper functions that are used to 
    send error and success responses to the client, respectively.
     The GenerateToken() function is a helper function that is used to generate a new token.
   * 
   * 
   */

  try {
    const {
      email,
      code
    } = req.body;
    const user = await User.findOne({
      email,
    })

    if(!user){
      return errorResMsg(res, 406, req.t("user_is_not_found"));
    }

    if(user.RestPasswordCode.toString()!==code.toString()){
     
      return errorResMsg(res, 406, req.t("code_is_not_valid"));
   }
   
   if(user.ResetPasswordXpireDate<=Date.now()){
      return errorResMsg(res, 406, req.t("code_is_expired"));
   }

   const token = GenerateToken(user._id)

    // return succesfull response
    return successResMsg(res, 200, {token});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.ResetPassword = async (req, res) => {
  try {
    const {
      NewPassword,
    } = req.body;

    const {id} = req.id;
    if (!id) {
     next( new Error('id is missing'))
    }

    const user = await User.findById(id);
   
     if(!user){
      return  errorResMsg(res, 406, req.t("user_is_not_found"));
     }

    user.password=NewPassword
    user.ShouldRestPassword=false
    await user.save();
    if(user.lang==="en"){
      const resetSucess=messages.resetSucess_EN(user.firstName)
      await SendEmailToUser(user.email,resetSucess)
    }else{
      const resetSucess=messages.resetSucess_AR(user.firstName)
      await SendEmailToUser(user.email,resetSucess)
    }
    return successResMsg(res, 200, {message:req.t("password_has_been_updated")});
  } catch (err) {
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.VerifyAccount = async (req, res) => {
  try {
    const {
      verfiycode,
      email
    } = req.body;
  
    if(!email){
      return  errorResMsg(res, 406, req.t("Email_is_required"));
    }
    const user = await User.findOne({email:email});
   
     // check for if the code is correct and hasnt expired

     if(!user){
      return  errorResMsg(res, 406, req.t("user_is_not_found"));
     }
     
     if(user.verified){
      return  errorResMsg(res, 406, req.t("user_is_already_activated"));
     }


     
     if(user.VerifictionCode.toString()!==verfiycode.toString()){
     console.log(user.VerifictionCode.toString(),verfiycode.toString())
        return errorResMsg(res, 406, req.t("verifyCode_is_not_valid"));
     }
     
     if(user.VerifictionXpireDate<=Date.now()){
        return errorResMsg(res, 406, 'verifyCode_is_expired');
     }
     //activate user
    user.verified=true;
    user.VerifictionCode="";
    user.VerifictionXpireDate=""
    await user.save();
    return successResMsg(res, 200, {message:req.t("acount_has_been_activated")});
  } catch (err) {
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.ResendVirificationCode = async (req, res) => {
  try {
  
    const {email} = req.body;
    if (!email) {
      return    errorResMsg(res, 406, req.t("Email_is_required"));

    }

    const user = await User.findOne({email:email});
    console.log("user is ",email)
     if(!user){
      return  errorResMsg(res, 406, req.t("user_is_not_found"));
     }

     if(user.verified){
      return  errorResMsg(res, 406, req.t("user_is_already_activated"));
     }

     const VerifictionCode = await GenerateRandomCode(2);
     const VerifictionXpireDate =  Date.now()  + 8.64e+7 ;
     const VerifictionMessage = messages.verifyAccount_EN(VerifictionCode);


    user.VerifictionCode=VerifictionCode;
    user.VerifictionXpireDate=VerifictionXpireDate;
    await user.save();

    await SendEmailToUser(user.email,VerifictionMessage)
     
    return successResMsg(res, 200, {message:req.t("activation_code_has_been_sent")});
  } catch (err) {
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};


exports.GenerateAccessToken = async (req, res) => {
  try {
    const UserID=req.id.id
    const user = await User.findOne({
      UserID,
    });

    // check if user exists and if the password is correct
    if (!user) {
      // return error message if user not found
      return errorResMsg(res, 401, req.t("user_is_not_found"));
    }

    // create user token
    const token = GenerateToken(user._id)

    // create data to be returned
    const data = {
      accessToken:token
    };
    // return succesfull response
    return successResMsg(res, 200, data);
  } catch (err) {
    // return error response
    return errorResMsg(res, 500, err);
  }
};

