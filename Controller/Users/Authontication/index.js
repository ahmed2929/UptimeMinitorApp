const bcrypt = require("bcryptjs");
const User = require("../../../DB/Schema/User");
const jwt = require("jsonwebtoken");
const messages = require("../../../Messages/index")

const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");
const mail = require("../../../config/MailConfig");

const {GenerateToken,GenerateRandomCode} =require("../../../utils/HelperFunctions")


// Signup
exports.signUp = async (req, res) => {
 
  try {
    // get user with email
    const user = await User.findOne({
      email: req.body.email,
    });

    // check if user exists and return error if user already exists
    if (user) {
      return errorResMsg(res, 423, "This user already exists");
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

    // create data to be returned
    const data = {
      token,
    };

    const VerifictionMessage = messages.verifyAccount(VerifictionCode);

    // send mail
    const mailOptions = {
      from: process.env.EmailSender,
      to: newUser.email,
      subject: "Account Verification",
      html: VerifictionMessage,
    };

    mail.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err)
        throw new Error(err)
      } else {
        console.log(info);
      }
    });

    // return succesfull response
    return successResMsg(res, 201, data);
  } catch (err) {
    // return error response
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
      return errorResMsg(res, 401, "Incorrect email or password");
    }

    // create user token
    const token = GenerateToken(user._id)

    // create data to be returned
    const data = {
      token
    };
    // return succesfull response
    return successResMsg(res, 200, data);
  } catch (err) {
    // return error response
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
     if(user.VerifictionCode.toString()!==verfiycode.toString()){
     
        return errorResMsg(res, 406, 'invalid code');
     }
     
     if(user.VerifictionXpireDate<=Date.now()){
        return errorResMsg(res, 406, 'code has been expired');
     }
     //activate user
    user.verified=true;
    await user.save();
    return successResMsg(res, 200, 'acount has been activated');
  } catch (err) {
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const {
      oldPassword,
      newPassword
    } = req.body;

    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const id = decodedToken.id;

    const user = await User.findOne({
      _id: id,
    }).select("+password");

    if (!user || !(await user.correctPassword(oldPassword, user.password))) {
      return errorResMsg(res, 401, "Incorrect password");
    }

    const password = await bcrypt.hash(newPassword, 12);

    const updatedUser = await User.findByIdAndUpdate(
      id, {
      password,
    }, {
      new: true,
    }
    );

    const resetSucces = messages.resetSucess(updatedUser.director[0].fullName)

    // send mail
    const mailOptions = {
      from: '"RONZL" <admin@ronzl.com>',
      to: updatedUser.email,
      subject: "Password Reset",
      html: resetSucces,
    };

    mail.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
    });
    return successResMsg(res, 200, updatedUser);
  } catch (err) {
    return errorResMsg(res, 500, err);
  }
};
