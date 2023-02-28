// handles error from requests
const errorResMsg = (res, code, message) => {
    console.log("handled error:",message)
    console.log("handled error status:",code)
    return res.status(code).json({
        status: 'error',
        error: message,
    });
}

// handle success request
const successResMsg = (res, code, data) => {
    res.status(code).json({
        status: 'success',
        data,
    });
}


module.exports = {
    errorResMsg,
    successResMsg
}