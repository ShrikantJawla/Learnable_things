let helperObj = {}

helperObj.successHandler = function (res, options) {
    let status = ''
    if (options.status == false) {
        status = options.status
    } else {
        status = true
    }

    let obj = {
        status: status,
        code: (options && options.code) || "",
        message: (options && options.message) || 'Operation performed successfully',
        payload: (options && options.payload) || {}
    }
    res.send(obj)
}

helperObj.errorHandler = function (res, options, httpStatusCode = 501) {
    let status = ''
    if (options.status == '') {
        status = options.status
    } else {
        status = true
    }
    let obj = {
        status: status || false,
        code: (options && options.code) || "",
        message: (options && options.message) || 'Something went wrong',
        payload: (options && options.payload) || []
    }
    res.status(httpStatusCode).json(obj)
}

module.exports = helperObj;