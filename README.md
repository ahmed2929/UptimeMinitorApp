# Uptime Monitor App
## overview

uptime monitor app is used to enable users to monitor their website Availablity and get reports about their checks and be notified if the app changes from up to down or from down to up.

## design
Every time users make a new check or edit their old checks with a new interval check time a new event runs and registers the new interval function or edits the old one then the interval runs based on the time it should run when the function runs a new thread is created to check for the website availability and notify the user if the state has been changed. I decided to create a new thread to run the check functionality because the node is a single-threaded and check functionality and report creation are heavy functions so for better performance, a new thread is created to not affect the whole app response time.

## Props 
- scince the app uses multithreading the heavy operations run without blocking the main thread .
- uses javascript build-in function to setInterval which lives in memory so the operation of register intervals does not use a lot of resources .
## Coins
- intervals are living in the memory so when the app crashes or restarted a new request to the database is made to register the functions a gain to run .
- scalability difficulty if we are going to scale horizontally by creating multiple instances or containers to the same app because the intervals live in memory. I think we can solve it by dividing checks data between multiple containers and evry container or instance is responsible for checking a part of the data.
## Alternatives methods
- the monitoring functionality could be built with a job scheduler like cron jobs
## Notification System
- it's easy to add a new notifications system since the notification functionality and the other app functionality are decoupled from each other. 
- just impilemnt the function which handles sending the notifiction to (slack, pushover,..etc) and invoke it in the send notification event.

## Features
- restful APIs stateless design to consume the end-points.
- CRUD operations for URL checks
- notify user with email and webhooks 
- get detailed reports about the websites availability
- Search and filter options
-  the app is dockerized to run it easily
 ## check api options
- APIs are consuming and producing application/json.
- Authenication should be stateless.
- Each URL check may have the following options:
- name: The name of the check.
- url: The URL to be monitored.
- protocol: The resource protocol name HTTP, HTTPS, or TCP.
- path: A specific path to be monitored (optional).
- port: The server port number (optional).
- webhook: A webhook URL to receive a notification on (optional).
- timeout (defaults to 5 seconds): The timeout of the polling request (optional).
- interval (defaults to 10 minutes): The time interval for polling requests (optional).
- threshold (defaults to 1 failure): The threshold of failed requests that will create an alert (optional).
- authentication: An HTTP authentication header, with the Basic scheme, to be sent with the polling request (optional).
- authentication.username
- authentication.password
- httpHeaders: A list of key/value pairs custom HTTP headers to be sent with the - polling request (optional).
- assert: The response assertion to be used on the polling response (optional).
- assert.statusCode: An HTTP status code to be asserted.
- tags: A list of the check tags (optional).
- ignoreSSL: A flag to ignore broken/expired SSL certificates in case of using the HTTPS protocol.
## report api
- status: The current status of the URL.
- availability: A percentage of the URL availability.
- outages: The total number of URL downtimes.
- downtime: The total time, in seconds, of the URL downtime.
- uptime: The total time, in seconds, of the URL uptime.
- responseTime: The average response time for the URL.
- history: Timestamped logs of the polling requests.
- Markdown is a lightweight markup language based on the formatting conventions
- that people naturally use in email.

## Feature Enhancements
- add more test cases 
- API to resend the verification code
- implement refresh token

## to run the app
```sh

npm i
npm run start
```

## to run tests (Note you need to run the app first)

```sh
npm run test
```

## Api docs
 - https://documenter.getpostman.com/view/9032686/2s8YzRyNAU

## Me
- www.ahmed-tech.me
