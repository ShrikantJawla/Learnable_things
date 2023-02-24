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
helperObj.getCurrentDateTime = function () {
    let date_ob = new Date()


    let date = ("0" + date_ob.getDate()).slice(-2)

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2)

    // current year
    let year = date_ob.getFullYear()

    // current hours
    let hours = date_ob.getHours()

    // current minutes
    let minutes = date_ob.getMinutes()

    // current seconds
    let seconds = date_ob.getSeconds()
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds

}

helperObj.getTitleAndMessageForCardNotification = function (bankName, status, actionFor) {
    let title = '';
    let message = '';
    title = bankName + ' Credit Card Application Status';
    if (status == 'Processing') {
        message = 'Thank you for applying ' + bankName + ' Credit Card. Your Application is under processing state. Kindly expect an update within 5 - 7 working days.';
    } else if (status == 'Rejected') {
        message = 'Thank you for applying '+bankName+' Credit Card. Your Credit Card Application is rejected. You can apply for another bank credit card here.'; 
    } else if (status == 'Approved'){
        message = 'Thank you for applying '+bankName+' Credit Card. Your Application has been approved. Please fill the details on Card Insider App to get Cashback.'
    }
    if(actionFor == 'T'){
        return title;
    } else if(actionFor == 'M'){
        return message;
    }

}

/* Checking if the value is an integer or not. */
helperObj.checkIsInt = function(value) {
    if (isNaN(value)) {
      return false;
    }
    var x = parseFloat(value);
    return (x | 0) === x;
  }


module.exports = helperObj;