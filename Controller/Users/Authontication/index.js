const User = require("../../../DB/Schema/User");
const messages = require("../../../Messages/index")
const {SendEmailToUser} =require("../../../utils/HelperFunctions")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");

const {GenerateToken,GenerateRandomCode,GenerateRefreshToken} =require("../../../utils/HelperFunctions")


// Signup
exports.signUp = async (req, res) => {
 
  try {
    // get user with email
    const user = await User.findOne({
      email: req.body.email,
    });

    // check if user exists and return error if user already exists
    if (user) {
      return errorResMsg(res, 423, req.t("email_is_already_taken"));
    }
    // generate VerifictionCode and VerifictionXpireDate for user .
    // VerifictionXpireDate after 24 hours
    const VerifictionCode = await GenerateRandomCode(2);
    const VerifictionXpireDate =  Date.now()  + 8.64e+7 ;

    const UserInfo={
        ...req.body,
        VerifictionCode,
        VerifictionXpireDate
    }

    const newUser = await User.create(UserInfo);
    // create user token
    const token = GenerateToken(newUser._id);
    const refreshToken = GenerateRefreshToken(newUser._id);
    

    // create data to be returned
    const data = {
      token,
      refreshToken
    };

    const VerifictionMessage = messages.verifyAccount(VerifictionCode);

    await SendEmailToUser(newUser.email,VerifictionMessage)

    // return succesfull response
    return successResMsg(res, 201, data);
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

// Login
exports.logIn = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    // check if user exists and select password
    const user = await User.findOne({
      email,
    }).select("+password");

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
      refreshToken
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
  
    const {email} = req.body;
    if (!email) {
      return  errorResMsg(res, 406, req.r("Email_is_required"));
    }

    const user = await User.findOne({email:email});

     if(!user){
      return  errorResMsg(res, 406, req.t('user_is_not_found'));
     }

     const RestPasswordCode = await GenerateRandomCode(2);
     const ResetPasswordXpireDate =  Date.now()  + 8.64e+7 ;
     const ForgetPasswordMessage = messages.forgetMessage(RestPasswordCode);


    user.RestPasswordCode=RestPasswordCode;
    user.ResetPasswordXpireDate=ResetPasswordXpireDate;
    await user.save();

    await SendEmailToUser(user.email,ForgetPasswordMessage)
     
    return successResMsg(res, 200, req.r("rest_password_code_has_been_sent"));
  } catch (err) {
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.GenerateAccessResetPasswordToken= async (req, res) => {
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
    await user.save();
    const resetSucess=messages.resetSucess(user.firstName)
    await SendEmailToUser(user.email,resetSucess)
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
    } = req.body;

    const {id} = req.id;
    
    if (!id) {
     throw new Error('id is missing')
    }

    const user = await User.findById(id);
   
     // check for if the code is correct and hasnt expired

     if(!user){
      return  errorResMsg(res, 406, req.t("user_is_not_found"));
     }



     if(user.VerifictionCode.toString()!==verfiycode.toString()){
     
        return errorResMsg(res, 406, req.t("verifyCode_is_not_valid"));
     }
     
     if(user.VerifictionXpireDate<=Date.now()){
        return errorResMsg(res, 406, 'verifyCode_is_expired');
     }
     //activate user
    user.verified=true;
    await user.save();
    return successResMsg(res, 200, {message:req.t("acount_has_been_activated")});
  } catch (err) {
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.ResendVirificationCode = async (req, res) => {
  try {
  
    const {id} = req.id;
    if (!id) {
     next(new Error('id is missing'))
    }

    const user = await User.findById(id);

     if(!user){
      return  errorResMsg(res, 406, req.t("user_is_not_found"));
     }

     if(user.verified){
      return  errorResMsg(res, 406, req.t("user_is_already_activated"));
     }

     const VerifictionCode = await GenerateRandomCode(2);
     const VerifictionXpireDate =  Date.now()  + 8.64e+7 ;
     const VerifictionMessage = messages.verifyAccount(VerifictionCode);


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

