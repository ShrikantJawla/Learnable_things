const { pool } = require("../../../configration/database")
const commonHelper = require("../common/helper")
const imageModel = require("../model/imageModel")
const offerModel = require("../model/offerModel")
const middleWearObj = require("../common/middleware")



let commonobj = {}
commonobj.publishItem = async function (req, res, next) {
    let sidebarItemNo
    let { table, id } = req.params
    let published_at
    if (['offers', 'brands'].includes(table)) sidebarItemNo = 3
    else if (['lounge_details', 'lounge_network_lists', 'airports'].includes(table)) sidebarItemNo = 4
    else if (['credit_cards', 'card_issuers'].includes(table)) sidebarItemNo = 5


    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, sidebarItemNo, "W")
    if (middleWearObjRes) {
        if (req.query?.publish === 'unpublish') {
            const rr = await pool.query(`UPDATE ${table}
                                SET published_at  = NULL
                                WHERE id=${id} returning *;`)
            published_at = rr.rows[0].published_at
        }
        else {
            const rr = await pool.query(`UPDATE ${table}
                                SET published_at  = current_timestamp
                                WHERE id=${id} returning *;`)
            published_at = rr.rows[0].published_at
        }
        let returnData = {
            status: true,
            code: 'CI-APP-PUBLISHITEM-101',
            payload: {
                published_at: published_at
            }
        }
        commonHelper.successHandler(res, returnData)

    }
    else {
        res.render("error/noPermission")
    }

}
commonobj.imagePost = async function (req, res, next) {
    // console.log(req.body)
    let dataToDb = {
        uploadImages: req.files,
        itemId: req.body.itemId
    }
    // // console.log(dataToDb.uploadImages)
    // console.log(req.body.userdata)
    let returnDataFromModel = await imageModel.uploadImagesData(dataToDb, req.body.relatedType, req.body.edit, req.body.userdata.ua_strapi)
    let returnData = {
        status: true,
        code: 'CIA-APP-IMAGE-101',
        payload: { ...returnDataFromModel }
    }
    commonHelper.successHandler(res, returnData)
}

module.exports = commonobj