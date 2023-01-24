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

describe("general api ", () => {
    beforeAll(async () => {
        await ConnetToDB()
    });

    it("login user", () => {
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
   

    it("search for a medication ", () => {
        return axiosInstance.get(BaseUrl+"general/search?name=bana", {
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(200)
           
        }).catch((err) => {
            expect(err.response.status).toBe(401)
        })
    })


   
     
    afterAll(async() => {
       
       await mongoose.disconnect();
      });
   
    
   

});