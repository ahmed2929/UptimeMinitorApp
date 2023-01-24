require("dotenv").config();
require("dotenv").config()
const { wrapper } = require("axios-cookiejar-support");
const mongoose = require("mongoose");
const { CookieJar } = require("tough-cookie")
const jar = new CookieJar();
const axiosInstance = wrapper(require("axios").default.create({ jar }))
const BaseUrl=`${process.env.BaseUrl}/api/v1/`

const User = require("../../DB/Schema/User");
const {ConnetToDB,CloseDBConnection} =require("../../DB/Server/index")
let token,refreshToken,testEmail="jest33@jest.com",testMobileNumber="025184875145";
let testPassword="123456789";
let VerifiedAccount ="jest5@jest.com"

describe("Auth test ", () => {
    beforeAll(async () => {
        await ConnetToDB()
    });

    it("signup", () => {
        return axiosInstance.post(BaseUrl+"auth/signup", {
            "firstName":"ahmed",
            "lastName":"khaled",
            "mobileNumber":{
                "countryCode":"+2",
                "phoneNumber":testMobileNumber
            },
            "email":testEmail,
            "password":testPassword,
            "lang":"en"
        },{
            headers: {
                'Content-Type': 'application/json'

            }
        }).then((res) => {
           
            expect(res.status).toBe(201)
        }).catch((err) => {
            console.log(err.response.data.errors)
             expect(err.response.status).toBe(201)
        })
    })
    it("login", () => {
        return axiosInstance.post(BaseUrl+"auth/login", {
            email: VerifiedAccount,
            password: testPassword
        }).then((res) => {
            expect(res.status).toBe(200)
           token=res.data.data.token;
        refreshToken=res.data.data.refreshToken;
        }).catch((err) => {
            expect(err.response.status).toBe(200)
        })
    })
   

    it("check generate access token from refresh token ", () => {
        return axiosInstance.post(BaseUrl+"auth/generate/access/token", {
        },
        {
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(200)
           
        }).catch((err) => {
            console.log(err.response.data)
        })
    })

    it("check failure of verify account with wrong otp", () => {
        return axiosInstance.post(BaseUrl+"auth/verifyaccount", 
        {
            "otp":"123456",
            "email":testEmail
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(200)
        }).catch((err) => {
            expect(err.response.status).toBe(422)
        })
    })

    
    it("resend activation otp", () => {
        return axiosInstance.post(BaseUrl+"auth/resend/activation/code", 
        {
            "email":testEmail
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(200)
        }).catch((err) => {
            expect(err.response.status).toBe(200)
        })
    })
    
    // test rest password logic
    describe("rest password logic",()=>{
        it("send rest password code", () => {
            return axiosInstance.post(BaseUrl+"auth/send/restpassword/code", 
            {
                "email":testEmail
              }
            
            
            
            ).then((res) => {
                expect(res.status).toBe(200)
            }).catch((err) => {
                expect(err.response.status).toBe(200)
            })
        })
        it("check failure of rest password with wrong otp", () => {
            return axiosInstance.post(BaseUrl+"auth/generate/restpassword/token", 
            {
                "otp":"123456",
                "email":testEmail,
               
              }
            
            
            
            ).then((res) => {
                expect(res.status).toBe(200)
            }).catch((err) => {
                expect(err.response.status).toBe(422)
            })
        })
        it("resend rest password otp", () => {
            return axiosInstance.post(BaseUrl+"auth/send/restpassword/code", 
            {
                "email":testEmail
              }
            
            
            
            ).then((res) => {
                expect(res.status).toBe(200)
            }).catch((err) => {
                expect(err.response.status).toBe(200)
            })
        })

    })

   
    
    afterAll(async() => {
        await User.findOneAndDelete({email:testEmail})
       await mongoose.disconnect();
      });
       
    
   

});