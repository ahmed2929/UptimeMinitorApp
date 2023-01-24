require("dotenv").config();
require("dotenv").config()
const { wrapper } = require("axios-cookiejar-support");
const mongoose = require("mongoose");
const { CookieJar } = require("tough-cookie")
const jar = new CookieJar();
const axiosInstance = wrapper(require("axios").default.create({ jar }))
var FormData = require('form-data');
var fs = require('fs');
var data = new FormData(); 
const BaseUrl=`${process.env.BaseUrl}/api/v1/`

const User = require("../../DB/Schema/User");
const {ConnetToDB,CloseDBConnection} =require("../../DB/Server/index")
let token,refreshToken,testEmail="jest33@jest.com",testMobileNumber="025184875145";
let testPassword="123456789";
let VerifiedAccount ="jest5@jest.com"
let ProfileID


describe("Medication Test Suit ", () => {
    beforeAll(async () => {
        await ConnetToDB()
    });

   
    it("login", () => {
        return axiosInstance.post(BaseUrl+"auth/login", {
            email: VerifiedAccount,
            password: testPassword
        }).then((res) => {
            expect(res.status).toBe(200)
           token=res.data.data.token;
        refreshToken=res.data.data.refreshToken;
        ProfileID=res.data.data.user.profile;
        }).catch((err) => {
            expect(err.response.status).toBe(200)
        })
    })
   

    test("create new medication case every day ", () => {

        data.append('name', 'jest test every day');
            data.append('type', 'pill');
            data.append('strength', '20');
            data.append('unit', 'g');
            data.append('quantity', '25');
            data.append('instructions', 'test instruction');
            data.append('condition', 'testcondition');
            data.append('Scheduler', '{\n  "StartDate": 1674383236586,\n  "EndDate": 1675202400000,\n  "AsNeeded": false,\n  "ScheduleType": "2",\n  "DaysInterval": null,\n  "SpecificDays":null,\n  \n  "dosage": [\n    {\n      "dose": 2,\n      "DateTime": 1674460659117\n    },\n    {\n      "dose": 1,\n      "DateTime": 1674460659117\n    }\n  ]\n}');
            data.append('externalInfo', '{"DrugCode":"H21-5135-05410-01"}');
           // data.append('img', fs.createReadStream('/home/ahmed/Downloads/paracetamol.jpeg')); img ignored in this test
            data.append('ProfileID', ProfileID);
            data.append('Refillable', 'true');
            data.append('RefileLevel', '5');


        return axiosInstance.post(BaseUrl+"medication/create/new/med", {
           data:data

        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(200)
           
        }).catch((err) => {
            console.log(err.response.data)
            expect(err.response.status).toBe(422)
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