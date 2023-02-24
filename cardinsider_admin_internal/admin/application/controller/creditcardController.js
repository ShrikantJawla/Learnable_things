const creditCardModel = require("../model/creditCardModel")
const commonHelper = require("../common/helper")
const commonControllerObj = require("./commonController")
const middleWearObj = require("../common/middleware")
let creditcardsObj = {}

/* ===========>>>>>>>>>    CREDIT CARDS <<<<<<<<<<<======================= */


/*----------------UI----------------*/
// Credit Cards List 
creditcardsObj.getCreditcardsList = async function (req, res, next) {
    let returndata = await creditCardModel.fetchCreditCardsList()

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("creditCards/creditcardsList", {
            creditCardsList: returndata,
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}

// New Credit Cards
creditcardsObj.getNewCreditCardPageUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("creditCards/newCreditCard", {
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}

// Edit Credit Cards
creditcardsObj.getExistingCreditCardByIdUI = async function (req, res, next) {
    if (req.query.id) {
        let returnDataFromModel = await creditCardModel.fetchCreditCardById(
            parseInt(req.query.id)
        )
        if (req.query.html === "false") {
            let returnData = {
                status: true,
                code: 'CI-APP-EXISTINGCREDITCARDUI-101',
                payload: {
                    creditCardDetail: returnDataFromModel,
                }
            }
            commonHelper.successHandler(res, returnData)
        } else {
            if (returnDataFromModel === null) {
                let returnData = {
                    status: false,
                    message: "No record Found",
                    code: 'CI-APP-EXISTINGCREDITCARDUI-ERROR-101',
                }
                commonHelper.errorHandler(res, returnData, 404)
            } else {
                let middleWearObjRes = await middleWearObj.checkAccessPermition(
                    req,
                    5,
                    "W"
                )
                if (middleWearObjRes) {
                    let sideBarData = await commonControllerObj.commonSideBarData(req)
                    res.status(200).render("creditCards/editCreditCard", {
                        creditCardDetail: returnDataFromModel,
                        sidebarDataByServer: sideBarData,
                    })
                } else {
                    res.render("error/noPermission")
                }
            }
        }
    } else {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        let returnData = {
            status: false,
            message: "Please provide an Id",
            code: 'CI-APP-EXISTINGCREDITCARDUI-ERROR-102',
            payload: {
                errMessage: "Please provide an Id",
                sidebarDataByServer: sideBarData,
            }
        }
        commonHelper.errorHandler(res, returnData, 404)
    }
}


/*----------------AJAX----------------*/

// filtered credit cards on credit cards page
creditcardsObj.getFilteredCreditCards = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "R")
    if (middleWearObjRes) {
        let { returnDataFromModel, count } = await creditCardModel.getFilteredCreditCards(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTEREDCREDITCARDS-101',
            payload: {
                creditCardsList: returnDataFromModel,
                count
            }
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}

// add new credit card (returns id of added offer)
creditcardsObj.postForNewCreditCard = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "W")
    if (middleWearObjRes) {
        let returnDataFromModel
        if (req.query.duplicate) {
            returnDataFromModel = await creditCardModel.postNewCreditCardDataToDB(req.body.item, userdata.ua_strapi)
        }
        else {
            returnDataFromModel = await creditCardModel.postNewCreditCardDataToDB(JSON.parse(req.body.item), userdata.ua_strapi)
        }
        // let returnData = {
        //     status: true,
        //     code: 'CI-APP-POSTCREDITCARD-101',
        //     payload: { ...returnDataFromModel }
        // }
        req.body.itemId = returnDataFromModel.id
        req.body.userdata = userdata
        next()
    }
    else {
        res.render("error/noPermission")
    }

}

// update credit card
creditcardsObj.updateCreditCardById = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "W")
    if (middleWearObjRes) {
        if (req.query.id) {
           // console.log(JSON.parse(req.body.creditCard),"jkkoooo");
            let returnDataFromModel = await creditCardModel.updateCreditCardById(
                req.query.id,
                JSON.parse(req.body.creditCard),
                userdata.ua_strapi
            )
            if (returnDataFromModel.msg) {
                let returnData = {
                    status: false,
                    message: returnDataFromModel.msg,
                    code: "CIA-APP-UPDATECREDITCARD-ERROR-101",
                    payload: {}
                }
                commonHelper.errorHandler(res, returnData, 400)
            }
            else {
                req.body.itemId = req.query.id
                req.body.edit = true
                req.body.userdata = userdata
                next()
                // let returnData = {
                //     status: true,
                //     code: 'CI-APP-UPDATECREDITCARD-101',
                //     payload: { status: returnDataFromModel }
                // }
                // commonHelper.successHandler(res, returnData)
            }
        } else {
            let returnData = {
                status: false,
                message: "Please provide an Id",
                code: "CIA-APP-UPDATECREDITCARD-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }

    }
    else {
        res.render("error/noPermission")
    }


}
// delete credit card (DANGER AHEAD)
creditcardsObj.deleteCreditCardById = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "D")
    if (middleWearObjRes) {
        if (!req.params.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: "CIA-APP-DELETECREDITCARD-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }
        else {
            let creditCardId = req.params.id
            let returnData = {
                status: true,
                code: "CIA-APP-DELETECREDITCARD-101",
                payload: {},
            }

            await creditCardModel.deleteCreditCardById(creditCardId)
            commonHelper.successHandler(res, returnData)

        }
    }
    else {
        res.render("error/noPermission")
    }

}







/* ===========>>>>>>>>>    CARD ISSUERS   <<<<<<<<<<<======================= */



/*---------------- UI ----------------*/
// card issuers list
creditcardsObj.getCardIssuerList = async function (req, res, next) {

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("creditCards/cardissuersList", {
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}

// new card issuer
creditcardsObj.getNewCardIssuerPageUI = async function (req, res, next) {

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("creditCards/newCardIssuer", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }


}

// edit card issuer
creditcardsObj.getExistingCardIssuerByIdUI = async function (req, res, next) {
    if (req.query.id) {
        let returnDataFromModel = await creditCardModel.fetchCardIssuerById(
            parseInt(req.query.id)
        )
        if (req.query.html === "false") {
            let returnData = {
                status: true,
                code: 'CI-APP-EXISTINGCARDISSUERUI-101',
                payload: {
                    cardIssuerDetail: returnDataFromModel,
                }
            }
            commonHelper.successHandler(res, returnData)
        } else {
            if (returnDataFromModel === null) {
                let returnData = {
                    status: false,
                    message: "No record Found",
                    code: 'CI-APP-EXISTINGCARDISSUERUI-ERROR-101',
                }
                commonHelper.errorHandler(res, returnData, 404)
            } else {

                let middleWearObjRes = await middleWearObj.checkAccessPermition(
                    req,
                    5,
                    "W"
                )
                if (middleWearObjRes) {
                    let sideBarData = await commonControllerObj.commonSideBarData(req)
                    res.status(200).render("creditCards/editCardIssuer", {
                        cardIssuerDetail: returnDataFromModel,
                        sidebarDataByServer: sideBarData,
                    })
                } else {
                    res.render("error/noPermission")
                }




            }
        }
    } else {
        let returnData = {
            status: false,
            message: "Please provide an id",
            code: "CIA-APP-EXISTINGCARDISSUERUI-ERROR-102",
            payload: {}
        }
        commonHelper.errorHandler(res, returnData, 400)
    }
    return "success"
}



/*----------------AJAX----------------*/
// filtered card issuers on card issuers page
creditcardsObj.getFilteredCardIssuers = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "R")
    if (middleWearObjRes) {
        let { returnDataFromModel, count } = await creditCardModel.getFilteredCardIssuers(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTEREDCARDISSUERS-101',
            payload: {
                cardIssuersList: returnDataFromModel,
                count
            }
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }

}

// add new card issuer
creditcardsObj.postForNewCardIssuer = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "W")
    if (middleWearObjRes) {
        let returnDataFromModel = await creditCardModel.postNewCardIssuerDataToDB(JSON.parse(req.body.item), userdata.ua_strapi)
        if (returnDataFromModel.msg) {
            let returnData = {
                status: false,
                message: returnDataFromModel.msg,
                code: "CIA-APP-POSTCARDISSUER-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)

        }
        else {
            // let returnData = {
            //     status: true,
            //     code: 'CI-APP-POSTCARDISSUER-101',
            //     payload: { ...returnDataFromModel }
            // }
            // commonHelper.successHandler(res, returnData)
            req.body.itemId = returnDataFromModel.id
            req.body.userdata = userdata
            next()
        }
    }
    else {
        res.render("error/noPermission")
    }

}


//update card issuer
creditcardsObj.updateCardIssuerById = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "W")
    if (middleWearObjRes) {
        if (req.query.id) {
            let returnDataFromModel = await creditCardModel.updateCardIssuerById(
                req.query.id,
                JSON.parse(req.body.cardIssuer),
                userdata.ua_strapi
            )
            if (returnDataFromModel && returnDataFromModel.msg) {
                let returnData = {
                    status: false,
                    message: returnDataFromModel.msg,
                    code: "CIA-APP-UPDATECARDISSUER-ERROR-101",
                    payload: {}
                }
                commonHelper.errorHandler(res, returnData, 400)
            }
            else {
                req.body.itemId = req.query.id
                req.body.edit = true
                req.body.userdata = userdata
                next()
                // let returnData = {
                //     status: true,
                //     code: 'CI-APP-UPDATECARDISSUER-101',
                //     payload: { status: returnDataFromModel }
                // }
                // commonHelper.successHandler(res, returnData)
            }
        } else {
            let returnData = {
                status: false,
                message: "Please provide an Id",
                code: "CIA-APP-UPDATECARDISSUER-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }

    }
    else {
        res.render("error/noPermission")
    }
}

//delete card issuer
creditcardsObj.deleteCardIssuerById = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "D")
    if (middleWearObjRes) {
        if (!req.params.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: "CIA-APP-DELETECARDISSUER-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }
        else {
            let cardIssuerId = req.params.id
            let returnData = {
                status: true,
                code: "CIA-APP-DELETECARDISSUER-101",
                payload: {},
            }

            await creditCardModel.deleteCardIssuerById(cardIssuerId)
            commonHelper.successHandler(res, returnData)

        }
    }
    else {
        res.render("error/noPermission")
    }

}




/* ===========>>>>>>>>>    RELATIONS USED IN OTHER ITEMS    <<<<<<<<<<<======================= */

//Credit Cards Present In Card Applications 
creditcardsObj.getCreditCardNamesForRelationPresentInCardApplications = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "R")
    if (middleWearObjRes) {
        let dFromDB =
            await creditCardModel.fetchCreditCardNamesForRelationPresentInCardApplications()
        let returnData = {
            status: true,
            code: "CIA-CREDITCARDRELATION-101",
            payload: dFromDB,
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}

// Credit Card By Card Issuer
creditcardsObj.getCreditcardsByIssuerAjax = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "R")
    if (middleWearObjRes) {
        console.log(req.body)
        let dataFromDb = await creditCardModel.fetchCreditCardByCardIssuer(
            req.body.id
        )
        let returnData = {
            status: true,
            code: "CIA-CREDITCARDLIST-101",
            payload: dataFromDb,
        }
        if (dataFromDb.length == 0) {
            returnData.status = false
            returnData.code = "CIA-CREDITCARDLIST-ERROR-101"

            commonHelper.errorHandler(res, returnData)
        } else {
            commonHelper.successHandler(res, returnData)
        }
    }
    else {
        res.render("error/noPermission")
    }
}

//Credit Cards 
creditcardsObj.getCreditCardNamesForRelation = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 5, "R")
    if (middleWearObjRes) {
        let dFromDB = await creditCardModel.fetchCreditCardNamesForRelation()
        let returnData = {
            status: true,
            code: "CIA-CREDITCARDRELATION-101",
            payload: dFromDB,
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}
// Card Issuers
creditcardsObj.getCardIssuerForRelation = async function (req, res, next) {
    let dataFromDb = await creditCardModel.fetchCardIssuersList()
    dataFromDb = dataFromDb.map((item) => ({
        id: item.id,
        IssuerName: item.IssuerName,
    }))
    let returnData = {
        status: true,
        code: "CIA-CARDISSUERLIST-101",
        payload: dataFromDb,
    }
    commonHelper.successHandler(res, returnData)
}

/*---------------- NOT USED BY RAHUL MEHNDIRATTA ----------------*/
creditcardsObj.getCardIssuerListAjax = async function (req, res, next) {
    let dataFromDb = await creditCardModel.fetchCardIssuersList()
    let returnData = {
        status: true,
        code: "CIA-CARDISSUERLIST-101",
        payload: dataFromDb,
    }
    if (dataFromDb.length == 0) {
        returnData.status = false
        returnData.code = "CIA-CARDISSUERLIST-ERROR-101"

        commonHelper.errorHandler(res, returnData)
    } else {
        commonHelper.successHandler(res, returnData)
    }
}



module.exports = creditcardsObj