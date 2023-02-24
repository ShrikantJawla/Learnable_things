const offerModel = require("../model/offerModel")
const commonHelper = require("../common/helper")
const commonControllerObj = require("./commonController")
const middleWearObj = require("../common/middleware")
let offerObj = {}

/* ===========>>>>>>>>>   OFFERS  <<<<<<<<<<<============== */


/*----------------offer list page ui----------------*/
offerObj.getOfferPageUi = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("offers/offersList", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}
/*----------------new offer page UI----------------*/
offerObj.getNewOfferPageUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("offers/newOffer", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}

/*----------------edit offer page UI----------------*/
offerObj.getExistingOfferByIdUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "W")
    if (middleWearObjRes) {
        if (req.query.id) {
            let returnDataFromModel = await offerModel.fetchOfferById(parseInt(req.query.id))
            if (req.query.html === "false") {
                let returnData = {
                    status: true,
                    code: 'CI-APP-EXISTINGOFFERUI-101',
                    payload: {
                        offerDetail: returnDataFromModel[0],
                    }
                }
                commonHelper.successHandler(res, returnData)
            } else {
                if (returnDataFromModel === null || returnDataFromModel.length === 0) {
                    let returnData = {
                        status: false,
                        message: "No record Found",
                        code: 'CI-APP-EXISTINGOFFERUI-ERROR-101',
                    }
                    commonHelper.errorHandler(res, returnData, 404)
                } else {

                    let sideBarData = await commonControllerObj.commonSideBarData(req)
                    res.status(200).render("offers/editOffer", {
                        offerDetail: returnDataFromModel[0],
                        sidebarDataByServer: sideBarData,
                    })

                }
            }
        } else {
            res.status(404).json({ errMessage: "Please provide an Id" })
        }
    }
    else {
        res.render("error/noPermission")
    }

}
/*----------------filtered offers on offer page ----------------*/
offerObj.getFilteredOffers = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "R")
    if (middleWearObjRes) {
        let { returnDataFromModal, count } = await offerModel.getFilteredOffers(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTEREDOFFERS-101',
            payload: {
                offerList: returnDataFromModal,
                count,
            }
        }

        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }


}

/*----------------add new offer(used to get id of new offer added)----------------*/
offerObj.postForNewOffer = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "W")
    if (middleWearObjRes) {
        let returnDataFromModel = await offerModel.postNewOfferDataToDB(req.body.item, userdata.ua_strapi)
        let returnData = {
            status: true,
            code: 'CI-APP-POSTOFFER-101',
            payload: { ...returnDataFromModel }
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}

/*----------------update offer----------------*/
offerObj.updateOfferById = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "W");
    if (middleWearObjRes) {
        if (!req.query.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: 'CI-APP-UPDATEOFFER-ERROR-101',
            }
            commonHelper.errorHandler(res, returnData, 400)
        } else {
            let rr = await offerModel.updateOfferById(req.query.id, req.body.offer, userdata.ua_strapi)
            if (rr === 'success') {
                let returnData = {
                    status: true,
                    code: 'CI-APP-UPDATEOFFER-101',
                    payload: {}
                }
                commonHelper.successHandler(res, returnData)
            }
            else {
                let returnData = {
                    status: false,
                    message: "Please provide an id",
                    code: 'CI-APP-UPDATEOFFER-ERROR-102',
                }
                commonHelper.errorHandler(res, returnData, 400)
            }
        }

    }
    else {
        res.render("error/noPermission")
    }

}

/*----------------delete offer (DANGER AHEAD)----------------*/
offerObj.deleteOfferById = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "D")
    if (middleWearObjRes) {
        if (!req.params.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: "CIA-APP-DELETEOFFER-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }
        else {
            let offerId = req.params.id
            let returnData = {
                status: true,
                code: "CIA-APP-DELETEOFFER-101",
                payload: {},
            }

            await offerModel.deleteOfferById(offerId)
            commonHelper.successHandler(res, returnData)

        }
    }
    else {
        res.render("error/noPermission")
    }

}





/* ===========>>>>>>>>>  Brands  <<<<<<<<<<<======================= */


offerObj.getBrandsList = async function (req, res, next) {
    let sideBarData = await commonControllerObj.commonSideBarData(req)
    if (req.query.id) {
        let returnById = await offerModel.fetchBrandDetailsByIdForEdit(
            req.query.id
        )
        if (returnById == null || returnById.length == 0) {
            res.status(404).send({ data: "No record Found" })
        } else {
            let middleWearObjRes = await middleWearObj.checkAccessPermition(
                req,
                3,
                "R"
            )
            if (middleWearObjRes) {
                res.status(200).render("offers/brandDetail", {
                    brandDetail: returnById[0],
                    sidebarDataByServer: sideBarData,
                })
            } else {
                res.render("error/noPermission")
            }
        }
    } else {
        let returnData = await offerModel.fetchBrandsList()

        let middleWearObjRes = await middleWearObj.checkAccessPermition(
            req,
            3,
            "R"
        )
        if (middleWearObjRes) {
            res.status(200).render("offers/brandsList", {
                brandsList: returnData,
                sidebarDataByServer: sideBarData,
            })
        } else {
            res.render("error/noPermission")
        }
    }
}


offerObj.getFilteredBrands = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "R")
    if (middleWearObjRes) {
        let { returnDataFromModal, count } = await offerModel.getFilteredBrands(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTEREDBRANDS-101',
            payload: {
                brandsList: returnDataFromModal,
                count,
            }
        }

        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}

offerObj.postForNewBrand = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let dataToDb = {
        brandData: JSON.parse(req.body.brand),
        strapi_id: userdata.ua_strapi
    }
    let returnData = await offerModel.postNewBrandDataToDB(dataToDb, userdata.ua_strapi)

    req.body.itemId = returnData.id
    req.body.userdata = userdata
    next()
}

// offerObj.imagePostForNewBrand = async function (req, res, next) {
//     let dataToDb = {
//         brandData: JSON.parse(req.body.brand),
//         uploadImages: req.files,
//         brandId: req.body.brandId
//     }
//     // //console.log(dataToDb, "dataToDbdataToDbdataToDb")
//     let returnDataFromModel = await offerModel.uploadBrandImagesData(dataToDb)
//     let returnData = {
//         status: true,
//         code: 'CIA-APP-FILTEREDOFFERS-101',
//         payload: { ...returnDataFromModel }
//     }

//     commonHelper.successHandler(res, returnData)
//     //res.json({ ...returnData, status: "success" });
// }

offerObj.getNewBrandPageUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("offers/newBrand", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}

offerObj.updateBrandById = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    if (req.query.id) {
        console.log(req.files)
        let rr = await offerModel.updateBrandById(req.query.id, JSON.parse(req.body.brand), userdata.ua_strapi)
        req.body.itemId = req.query.id
        req.body.edit = true
        req.body.userdata = userdata
        next()
    } else {
        res.status(404).json({ errMessage: "Please provide an Id" })
    }
}

offerObj.getExistingBrandByIdUI = async function (req, res, next) {
    if (req.query.id) {
        let returnData = await offerModel.fetchBrandDetailsById(
            parseInt(req.query.id)
        )
        if (req.query.html === "false") {
            res.status(200).json({
                brandDetail: returnData,
            })
        } else {
            if (returnData == null || returnData.length === 0) {
                res.status(404).send({ data: "No record Found" })
            } else {
                let middleWearObjRes = await middleWearObj.checkAccessPermition(
                    req,
                    3,
                    "W"
                )
                if (middleWearObjRes) {
                    let sideBarData = await commonControllerObj.commonSideBarData(req)
                    res.status(200).render("offers/editBrand", {
                        brandDetail: returnData,
                        sidebarDataByServer: sideBarData,
                    })
                } else {
                    res.render("error/noPermission")
                }
            }
        }
    } else {
        res.status(404).json({ errMessage: "Please provide an Id" })
    }
    return "success"
}

offerObj.deleteBrandById = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "D")
    if (middleWearObjRes) {
        if (!req.params.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: "CIA-APP-DELETEBRAND-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }
        else {
            let offerId = req.params.id
            let returnData = {
                status: true,
                code: "CIA-APP-DELETEBRAND-101",
                payload: {},
            }

            await offerModel.deleteBrandById(offerId)
            commonHelper.successHandler(res, returnData)

        }
    }
    else {
        res.render("error/noPermission")
    }
}

/* ===========>>>>>>>>>   USED IN OTHER ITEMS LIKE BRANDS,CREDIT CARDS etc  <<<<<<<<<<<======================= */
offerObj.getOfferNameForRelation = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 3, "W")
    if (middleWearObjRes) {
        let dataFromDb = await offerModel.fetchOfferNameForRelation()
        let returnData = {
            status: true,
            code: "CIA-APP-OFFERFORRELATION-101",
            payload: dataFromDb,
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}

offerObj.getBrandsNameForRelation = async function (req, res, next) {
    let dataFromDb = await offerModel.fetchBrandsNameForRelation()
    let returnData = {
        status: true,
        code: "CIA-APP-BRANDRELATION-101",
        payload: dataFromDb,
    }
    commonHelper.successHandler(res, returnData)
}


module.exports = offerObj