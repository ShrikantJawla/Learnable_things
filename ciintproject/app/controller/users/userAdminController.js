let userAdminModel = require('../../model/users/userAdminModel')
let commonHelper = require('../../common/helper')

let commonController = require("../../controller/commonController")
let accessMiddleware = require('../../common/checkAccessMiddleware')

let userAdminObj = {}

// User admins here.....


/**
 * It checks if the string is a 10 digit number and if it is, it checks if it is a valid Indian mobile
 * number
 * 
 * Args:
 *   str: The string to be validated.
 * 
 * Returns:
 *   A function that takes a string as an argument and returns a boolean value.
 */
let validateNumber = function (str) {
    if (str.length == 10) {
        // Regular expression to check if string is a Indian mobile number
        const regexExp = /^[6-9]\d{9}$/gi;
        return regexExp.test(str);
    } else {
        return false;
    }
}

userAdminObj.userAdminListUI = async function (req, res, next) {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 47, "W")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req)
        res.render("users/userAdmins", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }

}
userAdminObj.getFilteredUserAdmins = async function (req, res, next) {
    let finalData = {
        status: false,
        code: "CIP-APPLICATION-ERR-102",
        message: "Something went wrong",
        payload: []
    }

    let dataFromDb = await userAdminModel.getFilteredUserAdmins(req.body);


    if (dataFromDb) {
        finalData.status = true
        finalData.code = "CIP-APPLICATION-SUC-102"
        finalData.message = "Operation performed successfully"
        finalData.payload = dataFromDb
        commonHelper.successHandler(res, finalData)

    } else {
        commonHelper.errorHandler(res, finalData,)
    }
}
userAdminObj.addNewAdminUser = async function (req, res, next) {
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-106",
        payload: [],
    }
    let dataFromDb = false
    // console.log("admin request data-----", req.body);
    if (
        req.body.UApassword &&
        req.body.UAuserName &&
        req.body.UAuserEmail &&
        req.body.UAuserRole &&
        req.body.UAActiveUser &&
        req.body.UATeleNumber
    ) {
        let validatedNumber = validateNumber(req.body.UATeleNumber);
        // console.log(validatedNumber);
        if (validatedNumber) {
            let teleNumber = "+91" + req.body.UATeleNumber;
            dataFromDb = await userAdminModel.addNewAdminUser(
                req.body.UApassword,
                req.body.UAuserName,
                req.body.UAuserEmail,
                req.body.UAuserRole,
                req.body.UAActiveUser,
                teleNumber
            );

        } else {
            dataFromDb = false;
        }


    }

    if (dataFromDb == false) {
        commonHelper.errorHandler(res, returnData)
    } else {
        (returnData.status = true),
            (returnData.code = "CIA-APP-USERADMINPANEL-106"),
            (payload = dataFromDb)
        commonHelper.successHandler(res, returnData)
    }
}

userAdminObj.updateAdminUser = async function (req, res, next) {
    // console.log(req.body);
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-107",
        payload: [],
    }
    let dataFromDb = false
    if (req.body.ua_id) {
        // console.log(req.body)
        let updateData = {
            password: req.body.ua_password ? req.body.ua_password : "",
            name: req.body.ua_name,
            email: req.body.ua_email,
            userRole: req.body.ua_role,
            userActive: req.body.ua_active_user,
            userTeleNumber: "+91" + req.body.ua_tele_number
        }
        //console.log("hi im in ua id");
        dataFromDb = await userAdminModel.updateAdminUser(
            req.body.ua_id,
            updateData
        );
        //console.log(dataFromDb, "datafrom db");
    }
    if (dataFromDb == false) {
        //console.log("hi im in this if");
        commonHelper.errorHandler(res, returnData)
    } else {
        //console.log("hi im in this else");
        (returnData.status = true),
            (returnData.code = "CIA-APP-USERADMINPANEL-107"),
            (payload = dataFromDb)
        commonHelper.successHandler(res, returnData)
    }
}
/* This is a function that is used to get the list of telecallers. */
userAdminObj.getTeleCallersList = async function (req, res, next) {
    /* This is a variable that is used to store the response that is to be sent to the client. */
    let finalData = {
        status: false,
        code: "CIP-APPLICATION-ERR-102",
        message: "Something went wrong",
        payload: []
    };
    /* This is a function that is used to get the list of telecallers. */
    let dataFromDb = await userAdminModel.getTelecallersList();
    if (dataFromDb) {
        finalData.status = true;
        finalData.code = "CIP-APPLICATION-SUC-102";
        finalData.message = "Operation performed successfully";
        finalData.payload = dataFromDb;
        commonHelper.successHandler(res, finalData);

    } else {
        commonHelper.errorHandler(res, finalData,);
    }
};



/* This is a function that is used to get the list of telecallers. */
userAdminObj.getTeleCallersListInAssignment = async function (req, res, next) {
    /* This is a variable that is used to store the response that is to be sent to the client. */
    let finalData = {
        status: false,
        code: "CIP-APPLICATION-ERR-302",
        message: "Something went wrong",
        payload: []
    };
    /* This is a function that is used to get the list of telecallers. */
    let dataFromDb = await userAdminModel.getTeleCallersListInAssignment({issuer: req.query.issuer});
    if (dataFromDb) {
        finalData.status = true;
        finalData.code = "CIP-APPLICATION-SUC-301";
        finalData.message = "Operation performed successfully";
        finalData.payload = dataFromDb;
        commonHelper.successHandler(res, finalData);

    } else {
        commonHelper.errorHandler(res, finalData,);
    }
};
module.exports = userAdminObj;