const loungeModelObj = require("../model/loungeModel")
const commonHelper = require("../common/helper")
const commonControllerObj = require("./commonController")
const middleWearObj = require("../common/middleware")
let loungeObj = {}

/* ===========>>>>>>>>>    Get airports list <<<<<<<<<<<======================= */

loungeObj.getAirportsList = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("lounges/airportsList", {
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}
loungeObj.getAllAirportCities = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "R")
    if (middleWearObjRes) {
        let returnDataFromModal = await loungeModelObj.getAllAirportCities()
        let returnData = {
            status: true,
            code: "CIA-APP-AIRPORTCITIES-101",
            payload: returnDataFromModal,
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }

}
loungeObj.deleteAirportById = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "D")
    if (middleWearObjRes) {
        if (!req.params.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: "CIA-APP-DELETEAIRPORT-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }
        else {
            let airportId = req.params.id
            let returnData = {
                status: true,
                code: "CIA-APP-DELETEAIRPORT-101",
                payload: {},
            }
            await loungeModelObj.deleteAirportById(airportId)
            commonHelper.successHandler(res, returnData)
        }
    }
    else {
        res.render("error/noPermission")
    }
}



loungeObj.getFilteredAirports = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "R")
    if (middleWearObjRes) {
        let { returnDataFromModal, count } = await loungeModelObj.getFilteredAirports(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTEREDAIRPORTS-101',
            payload: {
                airportsList: returnDataFromModal,
                count,
            }
        }

        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}

/* ===========>>>>>>>>>    Get Lounges list <<<<<<<<<<<======================= */

loungeObj.getFilteredLounges = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "R")
    if (middleWearObjRes) {
        let { returnDataFromModel, count } = await loungeModelObj.getFilteredLounges(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTEREDLOUNGES-101',
            payload: {
                loungesList: returnDataFromModel,
                count
            }
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}
loungeObj.getLoungesList = async function (req, res, next) {
    let sideBarData = await commonControllerObj.commonSideBarData(req)
    if (req.query.id) {
        let rr = await loungeModelObj.fetchLoungeDetailById(req.query.id)
        if (rr == null || rr.length == 0) {
            res.status(404).send({ data: "No record Found" })
        } else {
            let middleWearObjRes = await middleWearObj.checkAccessPermition(
                req,
                4,
                "R"
            )
            if (middleWearObjRes) {
                res.status(200).render("lounges/loungeDetail", {
                    loungeDetail: rr[0],
                    sidebarDataByServer: sideBarData,
                })
            } else {
                res.render("error/noPermission")
            }
        }
    } else {
        let returnData = await loungeModelObj.fetchLoungesList()
        let middleWearObjRes = await middleWearObj.checkAccessPermition(
            req,
            4,
            "R"
        )
        if (middleWearObjRes) {
            res.render("lounges/loungesList", {
                loungesList: returnData,
                sidebarDataByServer: sideBarData,
            })
        } else {
            res.render("error/noPermission")
        }
    }
}

loungeObj.getAllAirports = async function (req, res, next) {
    const data = await loungeModelObj.fetchAirportsList()
    res.status(200).json({
        payload: data,
    })
}
loungeObj.getAirportsForRelation = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        let dataFromDb = await loungeModelObj.getAirportsForRelation()
        let returnData = {
            status: true,
            code: "CIA-APP-AIRPORTSFORRELATION-101",
            payload: dataFromDb,
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}


loungeObj.getNewAirportPageUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("lounges/newAirport", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}
loungeObj.getNewLoungePageUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("lounges/newLounge", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}

loungeObj.getLoungesNameForRelation = async function (req, res, next) {
    let dataFromDb = await loungeModelObj.getLoungesNameForRelation()
    let returnData = {
        status: true,
        payload: dataFromDb,
    }
    res.status(200).json(returnData)
}

loungeObj.postForNewAirport = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        let returnDataFromModel = await loungeModelObj.postNewAirportDataToDB(JSON.parse(req.body.airport), userdata.ua_strapi)

        // let returnData = {
        //     status: true,
        //     code: 'CI-APP-POSTAIRPORT-101',
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
loungeObj.publishAirport = async function (req, res, next) {
    let dataFromDb = await loungeModelObj.publishAirportDataToDb(
        req.params.id,
        req.query
    )
    res.status(200).json({
        status: "success",
        published_at: dataFromDb,
    })
}
loungeObj.getExistingAirportByIdUI = async function (req, res, next) {
    if (req.query.id) {
        let returnDataFromModel = await loungeModelObj.fetchAirportById(
            parseInt(req.query.id)
        )
        if (req.query.html === "false") {
            let returnData = {
                status: true,
                code: 'CI-APP-EXISTINGAIRPORTUI-101',
                payload: {
                    airportDetail: returnDataFromModel[0],
                }
            }
            commonHelper.successHandler(res, returnData)
        } else {
            if (returnDataFromModel === null) {
                let returnData = {
                    status: false,
                    message: "No record Found",
                    code: 'CI-APP-EXISTINGAIRPORTUI-ERROR-101',
                }
                commonHelper.errorHandler(res, returnData, 404)
            } else {
                let middleWearObjRes = await middleWearObj.checkAccessPermition(
                    req,
                    4,
                    "W"
                )
                if (middleWearObjRes) {
                    let sideBarData = await commonControllerObj.commonSideBarData(req)
                    res.status(200).render("lounges/editAirport", {
                        airportDetail: returnDataFromModel[0],
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
            code: 'CI-APP-EXISTINGAIRPORTUI-ERROR-102',
            payload: {
                errMessage: "Please provide an Id",
                sidebarDataByServer: sideBarData,
            }
        }
        commonHelper.errorHandler(res, returnData, 404)
    }

}
loungeObj.getExistingLoungeByIdUI = async function (req, res, next) {
    if (req.query.id) {
        let returnDataFromModel = await loungeModelObj.fetchLoungeById(
            parseInt(req.query.id)
        )
        if (req.query.html === "false") {
            let returnData = {
                status: true,
                code: 'CI-APP-GETEXISTINGLOUNGE-101',
                payload: {
                    loungeDetail: returnDataFromModel,
                }
            }
            commonHelper.successHandler(res, returnData)

        } else {
            if (returnDataFromModel === null) {
                let returnData = {
                    status: false,
                    message: "No record Found",
                    code: 'CI-APP-GETEXISTINGLOUNGE-ERROR-101',
                }
                commonHelper.errorHandler(res, returnData, 404)
            } else {
                let middleWearObjRes = await middleWearObj.checkAccessPermition(
                    req,
                    4,
                    "W"
                )
                if (middleWearObjRes) {
                    let sideBarData = await commonControllerObj.commonSideBarData(req)

                    res
                        .status(200)
                        .render("lounges/editLounge", {
                            loungeDetail: returnDataFromModel,
                            sidebarDataByServer: sideBarData
                        })
                } else {
                    res.render("error/noPermission")
                }
            }
        }
    } else {
        let returnData = {
            status: false,
            message: "Please provide an Id",
            code: "CIA-APP-GETEXISTINGLOUNGE-ERROR-101",
            payload: {}
        }
        commonHelper.errorHandler(res, returnData, 400)
    }
}

loungeObj.updateAirportById = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        if (req.query.id) {
            let returnDataFromModel = await loungeModelObj.updateAirportById(
                req.query.id,
                JSON.parse(req.body.airport),
                userdata.ua_strapi
            )
            if (returnDataFromModel && returnDataFromModel.msg) {
                let returnData = {
                    status: false,
                    message: returnDataFromModel.msg,
                    code: "CIA-APP-UPDATEAIRPORT-ERROR-101",
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
                //     code: 'CI-APP-UPDATEAIRPORT-101',
                //     payload: { status: returnDataFromModel }
                // }
                // commonHelper.successHandler(res, returnData)
            }
        } else {
            let returnData = {
                status: false,
                message: "Please provide an Id",
                code: "CIA-APP-UPDATEAIRPORT-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }

    }
    else {
        res.render("error/noPermission")
    }

}
loungeObj.updateLoungeById = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        if (req.query.id) {
            let returnDataFromModel = await loungeModelObj.updateLoungeById(
                req.query.id,
                JSON.parse(req.body.lounge),
                userdata.ua_strapi
            )
            console.log(returnDataFromModel)
            if (returnDataFromModel && returnDataFromModel.msg) {
                let returnData = {
                    status: false,
                    message: returnDataFromModel.msg,
                    code: "CIA-APP-UPDATELOUNGE-ERROR-101",
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
                //     code: 'CI-APP-UPDATELOUNGE-101',
                //     payload: { status: returnDataFromModel }
                // }
                // commonHelper.successHandler(res, returnData)
            }
        } else {
            let returnData = {
                status: false,
                message: "Please provide an Id",
                code: "CIA-APP-UPDATELOUNGE-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }

    }
    else {
        res.render("error/noPermission")
    }
}

///////New Lounges
loungeObj.postForNewLounge = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        let returnDataFromModel
        if (req.query.duplicate) {
            returnDataFromModel = await loungeModelObj.postNewLoungeDataToDB(req.body.item, userdata.ua_strapi)
        }
        else {
            returnDataFromModel = await loungeModelObj.postNewLoungeDataToDB(JSON.parse(req.body.item), userdata.ua_strapi)
        }
        // let returnData = {
        //     status: true,
        //     code: 'CI-APP-POSTLOUNGE-101',
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


loungeObj.deleteLoungeById = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "D")
    if (middleWearObjRes) {
        if (!req.params.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: "CIA-APP-DELETELOUNGE-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }
        else {
            let loungeId = req.params.id
            let returnData = {
                status: true,
                code: "CIA-APP-DELETELOUNGE-101",
                payload: {},
            }

            await loungeModelObj.deleteLoungeById(loungeId)
            commonHelper.successHandler(res, returnData)

        }
    }
    else {
        res.render("error/noPermission")
    }

}



/* ===========>>>>>>>>>    get Lounge Network list <<<<<<<<<<<======================= */
loungeObj.getLoungeNetworksForRelation = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        let dataFromDb = await loungeModelObj.getLoungeNetworksForRelation()
        let returnData = {
            status: true,
            code: "CIA-APP-LOUNGENETWORKSFORRELATION-101",
            payload: dataFromDb,
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}


loungeObj.getLoungeNetworkList = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("lounges/loungeNetworkList", {
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}

loungeObj.getNewLoungeNetworkPageUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("lounges/newLoungeNetwork", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}

loungeObj.getExistingLoungeNetworkByIdUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        if (req.query.id) {
            let returnDataFromModel = await loungeModelObj.fetchLoungeNetworkById(parseInt(req.query.id))
            if (req.query.html === "false") {
                let returnData = {
                    status: true,
                    code: 'CI-APP-EXISTINGLOUNGENETWORKUI-101',
                    payload: {
                        loungeNetworkDetail: returnDataFromModel,
                    }
                }
                commonHelper.successHandler(res, returnData)
            } else {
                if (returnDataFromModel === null) {
                    let returnData = {
                        status: false,
                        message: "No record Found",
                        code: 'CI-APP-EXISTINGLOUNGENETWORKUI-ERROR-101',
                    }
                    commonHelper.errorHandler(res, returnData, 404)
                } else {

                    let sideBarData = await commonControllerObj.commonSideBarData(req)
                    res.status(200).render("lounges/editLoungeNetwork", {
                        loungeNetworkDetail: returnDataFromModel,
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
/*----------------filtered loungeNetworks on loungeNetwork page ui----------------*/
loungeObj.getFilteredLoungeNetworks = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "R")
    if (middleWearObjRes) {
        let { returnDataFromModal, count } = await loungeModelObj.getFilteredLoungeNetworks(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTEREDLOUNGENETWORKS-101',
            payload: {
                loungeNetworkList: returnDataFromModal,
                count,
            }
        }

        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }


}

/*----------------add new loungeNetwork(used to get id of new loungeNetwork added)----------------*/
loungeObj.postForNewLoungeNetwork = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        let returnDataFromModel = await loungeModelObj.postNewLoungeNetworkDataToDB(req.body.item, userdata.ua_strapi)
        let returnData = {
            status: true,
            code: 'CI-APP-POSTLOUNGENETWORK-101',
            payload: { ...returnDataFromModel }
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}

/*----------------update loungeNetwork----------------*/
loungeObj.updateLoungeNetworkById = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "W")
    if (middleWearObjRes) {
        if (!req.query.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: 'CI-APP-UPDATELOUNGENETWORK-ERROR-101',
            }
            commonHelper.errorHandler(res, returnData, 400)
        } else { 
            let rr = await loungeModelObj.updateLoungeNetworkById(req.query.id, req.body.loungeNetwork, userdata.ua_strapi)
            if (rr === 'success') {
                let returnData = {
                    status: true,
                    code: 'CI-APP-UPDATELOUNGENETWORK-101',
                    payload: {}
                }
                commonHelper.successHandler(res, returnData)
            }
            else {
                let returnData = {
                    status: false,
                    message: "Please provide an id",
                    code: 'CI-APP-UPDATELOUNGENETWORK-ERROR-102',
                }
                commonHelper.errorHandler(res, returnData, 400)
            }
        }

    }
    else {
        res.render("error/noPermission")
    }

}

/*----------------delete loungeNetwork (DANGER AHEAD)----------------*/
loungeObj.deleteLoungeNetworkById = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "D")
    if (middleWearObjRes) {
        if (!req.params.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: "CIA-APP-DELETELOUNGENETWORK-ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }
        else {
            let loungeNetworkId = req.params.id
            let returnData = {
                status: true,
                code: "CIA-APP-DELETELOUNGENETWORK-101",
                payload: {},
            }

            await loungeModelObj.deleteLoungeNetworkById(loungeNetworkId)
            commonHelper.successHandler(res, returnData)

        }
    }
    else {
        res.render("error/noPermission")
    }

}
module.exports = loungeObj