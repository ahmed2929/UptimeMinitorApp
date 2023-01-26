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
const UserMedication=require("../../DB/Schema/UserMedication")
const Scheduler =require("../../DB/Schema/Scheduler")
const Occurrences =require("../../DB/Schema/Occurrences");
const { default: axios } = require("axios");
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
                data.append('Scheduler', '{\n  "StartDate": 1672524000000,\n  "EndDate": null,\n  "AsNeeded": false,\n  "ScheduleType": "2",\n  "DaysInterval": null,\n  "SpecificDays":null,\n  \n  "dosage": [\n    {\n      "dose": 2,\n      "DateTime": 1674460659117\n    },\n    {\n      "dose": 1,\n      "DateTime": 1674460659117\n    }\n  ]\n}');
                data.append('externalInfo', '{"DrugCode":"H21-5135-05410-01"}');
                data.append('ProfileID', ProfileID);
                data.append('Refillable', 'true');
                data.append('RefileLevel', '5');

        return axios.post(BaseUrl+"medication/create/new/med", {
           data

        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
          }
        
        
        
        ).then((res) => {
            console.log(res)
            expect(res.status).toBe(200)
           
        }).catch((err) => {
            console.log(err.response.data.errors)
            expect(err.response.status).toBe(422)
        })
    })

  

   
    
    afterAll(async() => {
       const deletedMed= await UserMedication.findOneAndDelete({ProfileID:ProfileID})
        const deletedScheduler= await Scheduler.findOneAndDelete({ProfileID:ProfileID})
        const deletedOccurrences= await Occurrences.findOneAndDelete({ProfileID:ProfileID})
        console.log("deletedMed",deletedMed)
        console.log('deletedScheduler',deletedScheduler)
        console.log("deletedOccurrences",deletedOccurrences)
       await mongoose.disconnect();
      });
       
    
   

});