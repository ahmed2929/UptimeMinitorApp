require("dotenv").config();
require("dotenv").config()
const { wrapper } = require("axios-cookiejar-support");
const mongoose = require("mongoose");
const { CookieJar } = require("tough-cookie")
const jar = new CookieJar();
const axiosInstance = wrapper(require("axios").default.create({ jar }))
const BaseUrl=`${process.env.BaseUrl}/api/v1/`

const User = require("../DB/Schema/User");
const {ConnetToDB,CloseDBConnection} =require("../DB/Server/index")
let token,CheckID;

describe("Check crud operations test ", () => {
    beforeAll(async () => {
        await ConnetToDB()
    });

    it("singup", () => {
        return axiosInstance.post(BaseUrl+"auth/signup", {
            email: "ahmed@gmail.com",
            password: "123456"
        }).then((res) => {
            expect(res.status).toBe(201)
        }).catch((err) => {

             expect(err.response.status).toBe(201)
        })
    })
    it("login", () => {
        return axiosInstance.post(BaseUrl+"auth/login", {
            email: "ahmed@gmail.com",
            password: "123456"
        }).then((res) => {
            expect(res.status).toBe(200)
           token=res.data.data.token
        }).catch((err) => {
            expect(err.response.status).toBe(200)
        })
    })
    it("create new check", () => {
        return axiosInstance.post(BaseUrl+"check/createcheck", {

            "name":"http-test",
            "url":"web.dev/enable-https/",
            "protocol":"https",
            "path":"/",
            "interval":"35",
            "ignoreSSL":false,
            "tag":["httpS-info"]


        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(201)
            CheckID=res.data.data.data.id
        }).catch((err) => {
            expect(err.response.status).toBe(201)
        })
    })

    it("failed to create dublicate check", () => {
        return axiosInstance.post(BaseUrl+"check/createcheck", {

            "name":"http-test",
            "url":"web.dev/enable-https/",
            "protocol":"https",
            "path":"/",
            "interval":"35",
            "ignoreSSL":false,
            "tag":["httpS-info"]


        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(422)
            CheckID=res.data.data.data.id
        }).catch((err) => {
            expect(err.response.status).toBe(422)
        })
    })

    it("get check", () => {
        return axiosInstance.get(BaseUrl+"check/all", 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(200)
        }).catch((err) => {
            expect(err.response.status).toBe(200)
        })
    })


    it("get report", () => {
        return axiosInstance.get(BaseUrl+"report/all", 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(200)
        }).catch((err) => {
            expect(err.response.status).toBe(200)
        })
    })
    

    it("edit check", () => {
        return axiosInstance.put(BaseUrl+"check/edit", {

            "CheckID":`${CheckID}`,
            "name":"editTest",
           "interval":"30",
           "protocol":"https",
           "ignoreSSL":true


        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
          }
        
        
        
        ).then((res) => {
            expect(res.status).toBe(202)
        }).catch((err) => {
            expect(err.response.status).toBe(202)
        })
    })


    it("delete check", () => {
        return axiosInstance.delete(BaseUrl+"check/delete", {
            headers: {
              Authorization: `Bearer ${token}`
            },
            data: {
                CheckID:`${CheckID}`
            }
          })
        
        .then((res) => {
            expect(res.status).toBe(202)
        }).catch((err) => {
            expect(err.response.status).toBe(202)
        })
    })


   
    
    afterAll(async() => {
        await User.findOneAndDelete({email:"ahmed@gmail.com"})
       await mongoose.disconnect();
      });
       
    
   

});