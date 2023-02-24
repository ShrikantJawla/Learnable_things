const cashbackModel = require("../model/cashbackModel")
const commonHelper = require("../common/helper")
const res = require("express/lib/response")
const commonControllerObj = require("./commonController")
const middleWearObj = require("../common/middleware")
const commonModel = require("../model/commonModel");

let cashbackControllerObj = {}

//cashback data here......
// cashbackControllerObj.demoDataAdd = async function (req, res, next) {
//     console.log('hi i am in');
//     let getAllIssuersDataSql = `SELECT td_uuid , td_id , td_status FROM public.transaction_details where td_status = 'Completed'`;
//     let result = await commonModel.getDataOrCount(getAllIssuersDataSql, [], 'D', true);
//     if (result && result.length > 0) {
//         let inserData = '';
//         for (let i = 0; result.length > i; i++) {
//             let query = `SELECT * FROM public.transation_applications_referrals_junction
//             where tarj_transaction_detail =   ${result[i].td_id}`;
//             let result1 = await commonModel.getDataOrCount(query, [], 'D', true);
//             result[i].more = result1;
//             if (result1.length > 0) {
//                 for (let k = 0; k < result1.length; k++) {
//                    // if (result[i].applicationcount > 0) {
//                         inserData = inserData + ` update approved_payment_tables set transaction_id = '${result[i].td_id}' , is_paid = true where application_id = '${result1[k].tarj_application}' ; `;
//                         console.log(result[i]);
//                     //}
//                 }
//             }


//         }
//         console.log(inserData , "inserDatainserData");
//         let result2 = await commonModel.getDataOrCount(inserData, [], 'U', true);
//     }


//     res.send(result);
// }

cashbackControllerObj.demoDataAdd = async function(req, res, next){
    console.log('hi i am in');
    let getAllIssuersDataSql = `SELECT card_applications.id as appID, "Application_number" , card_applications.updated_at  , "Application_Status", "card_issuer", card_applications.card_insider_user , "Cashback_to_be_paid" , "Cashback_paid"  FROM public.card_applications
    left join card_insider_users ON card_insider_users.id = card_applications.card_insider_user
    where "Application_Status" = 'Approved'`;
    let result = await commonModel.getDataOrCount(getAllIssuersDataSql, [], 'D', true);
    if (result && result.length > 0){
        let inserData = '';
        for (let i = 0; result.length > i; i++){
            inserData = inserData + ` INSERT INTO approved_payment_tables(user_id, payment_type, payment_amount, bank_name, application_number, is_paid, 
                notes, created_by, updated_by , application_id) 
                VALUES(${result[i].card_insider_user}, 'cashback', ${result[i].Cashback_to_be_paid}, '${result[i].card_issuer}', '${result[i].Application_number}', ${result[i].Cashback_paid}, 'Manually added', 1, 1 , ${result[i].appid});`;
            console.log(result[i]);
        }
        console.log(inserData , "inserDatainserData");
        let result2 = await commonModel.getDataOrCount(inserData, [], 'U', true);
    }


    res.send(result);
}

// -- FOR REFERAL ADD //

// cashbackControllerObj.demoDataAdd = async function(req, res, next){
//     console.log('hi i am in');
//     let getAllIssuersDataSql = `SELECT id , referred_by ,referral_paid , "Referral_commission_paid" , "Referrers_approved" , 
//     "refer_amount" , "cashback_claimed" ,
//     ( SELECT COUNT(*) FROM public.card_applications where "Application_Status" = 'Approved' AND 
//      card_applications.card_insider_user = card_insider_users.id) as applicationCount
//     FROM card_insider_users where "Referrers_approved" = 1  AND referral_paid is null  AND  "referred_by" IS NOT NUll ;`;
//     let result = await commonModel.getDataOrCount(getAllIssuersDataSql, [], 'D', true);
//     if (result && result.length > 0){
//         let inserData = '';
//         for (let i = 0; result.length > i; i++){
//             if (result[i].applicationcount > 0){
//                 inserData = inserData + ` INSERT INTO approved_payment_tables(user_id, payment_type, payment_amount, referred_to_id, is_paid, 
//                     notes, created_by, updated_by) 
//                     VALUES(${result[i].referred_by}, 'referral', 200, '${result[i].id}', false, 'Manually added', 1, 1);`;
//                 console.log(result[i]);
//             }

//         }
//         console.log(inserData , "inserDatainserData");
//         let result2 = await commonModel.getDataOrCount(inserData, [], 'U', true);
//     }


//     res.send(result);
// }

cashbackControllerObj.cashbackData = async function (req, res, next) {

    let sideBarData = await commonControllerObj.commonSideBarData(req)
    if (req.query.id) {

        let rData = await cashbackModel.getcashbackClaims(req.query.id)
        let totalRefreal = 0
        let dataAddToList = {
            amountFrom: "",
            amount: "",
            refredToId: "",
            refredToName: "",
            applicationNumber: "",
            refredToEmail: "",
        }
        if (rData && rData.length > 0) {
            let getTotalRefrealOfUser = 0
            for (let i = 0; i < rData.length; i++) {
                rData[i].totalCasback = 0
                rData[i].totalReferrelCasback = 0
                rData[i].totalApplicationCasback = 0
                rData[i].refredAndCBList = []
                // //console.log(rData[i].user_id , 'rData[i].user_idrData[i].user_id');
                let earnReffSqlData = await cashbackModel.getTotalRefrealSql(
                    rData[i].user_id
                )
                ////console.log(earnReffSqlData , "earnReffSqlData");
                if (earnReffSqlData && earnReffSqlData.length > 0) {
                    for (let k = 0; k < earnReffSqlData.length; k++) {
                        if (earnReffSqlData[k].refer_amount > 0) {
                            //refredToList.push
                            rData[i].totalReferrelCasback =
                                rData[i].totalReferrelCasback +
                                Number(earnReffSqlData[k].refer_amount)
                            dataAddToList.amountFrom = "Referral"
                            dataAddToList.amount = earnReffSqlData[k].refer_amount
                            dataAddToList.refredToId = earnReffSqlData[k].id
                            dataAddToList.refredToEmail = earnReffSqlData[k].ciu_email
                            dataAddToList.refredToNumber = earnReffSqlData[k].ciu_number
                            dataAddToList.applicationNumber = "-"
                            dataAddToList.refredToName =
                                earnReffSqlData[k].ciu_first_name +
                                " " +
                                earnReffSqlData[k].ciu_last_name

                            rData[i].refredAndCBList.push(JSON.stringify(dataAddToList))
                        }
                    }
                }
                //rData[i].totalCasback = rData[i].totalCasback + rData[i].totalReferrelCasback;
                // getTotalRefrealOfUser = getTotalRefrealOfUser + rData[i].totalCasback;

                let earnApplicationCashBack =
                    await cashbackModel.getTotalApplicationsCBSql(rData[i].user_id)
                // console.log(earnApplicationCashBack, "rrrrr")
                if (earnApplicationCashBack && earnApplicationCashBack.length > 0) {
                    for (let r = 0; r < earnApplicationCashBack.length; r++) {
                        // console.log(earnApplicationCashBack[r], "earnReffSqlData")
                        if (earnApplicationCashBack[r].Cashback_to_be_paid > 0) {
                            rData[i].totalApplicationCasback =
                                rData[i].totalApplicationCasback +
                                Number(earnApplicationCashBack[r].Cashback_to_be_paid)
                            dataAddToList.amountFrom = "Application"
                            dataAddToList.amount =
                                earnApplicationCashBack[r].Cashback_to_be_paid
                            dataAddToList.refredToId = "-"
                            dataAddToList.refredToEmail = "-"
                            dataAddToList.refredToNumber = "-"
                            dataAddToList.applicationNumber =
                                earnApplicationCashBack[r].Application_number
                            dataAddToList.refredToName = "-"

                            rData[i].refredAndCBList.push(JSON.stringify(dataAddToList))
                        }
                    }
                }
                rData[i].totalCasback =
                    rData[i].totalCasback +
                    rData[i].totalReferrelCasback +
                    rData[i].totalApplicationCasback
                getTotalRefrealOfUser = getTotalRefrealOfUser + rData[i].totalCasback

            }
        }

        //console.log(rData, "<<<<<<<< ========= NEWONE");
        let middleWearObjRes = await middleWearObj.checkAccessPermition(
            req,
            2,
            "W"
        )
        if (middleWearObjRes) {
            console.log(rData)
            res.render("cashbacks/cashbackRequestDetail", {
                earningDetails: rData,
                sidebarDataByServer: sideBarData,
            })
        } else {
            res.render("error/noPermission")
        }
    } else {

        let middleWearObjRes = await middleWearObj.checkAccessPermition(
            req,
            2,
            "R"
        )
        if (middleWearObjRes) {
            res.render("cashbacks/cashbacksList", {
                sidebarDataByServer: sideBarData,
            })
        } else {
            res.render("error/noPermission")
        }
    }
}

// get cashback list data here ....

cashbackControllerObj.getCashbackDataList = async function (req, res, next) {
    console.log("\n\n\n\n------------------------ hi im in cashback-----------------\n\n\n\n");
    // console.log(req.body);

    let { returnDataFromModal, count } = await cashbackModel.getFilteredCashbackClaims(req.body)




    // let returnData = {
    //     status: true,
    //     code: "CIA-GET-CB_DATA-101",
    //     payload: returnDataFromModal
    // };
    // commonHelper.successHandler(res, returnData);
    //    console.log(returnDataFromModal, "<<<<<<<< ========= returnDataFromModal returnDataFromModal\n\n\n");
    // res.render("./cashbacks/cashbackListTable", { cashbackList: returnDataFromModal })

    let returnData = {
        status: true,
        code: 'CIA-APP-FILTEREDAPPROVEDAPPLICATIONS-101',
        payload: {
            claimCashbackRequestsLists: returnDataFromModal,
            count,
        }
    }


    //    console.log(returnData.payload.claimCashbackRequestsLists[2], "<<<<<<<< ========= rdataNew");

    commonHelper.successHandler(res, returnData)

}

cashbackControllerObj.setCashbackRefferalsPaid = async function (req, res, next) {
    let returnData = {
        status: false,
        code: "CIA-APP-CASHBACK-Error-200",
        payload: false,
    }
    // console.log("line no 283 in cashback controller", req.body)
    if (req.body && req.body.identifier) {
        let returnDataFromModel = await cashbackModel.setCashbackReferralsPaid(req.body.identifier, req.body.checkCashback, req.body.checkReferrals)
        returnData.status = true
        returnData.payload = returnDataFromModel
        returnData.code = "CIA-APP-CASHBACK-201"
        res.send(returnData)
    } else {
        res.send(returnData)
    }

}




// get approved applications here.....

cashbackControllerObj.getApprovedAppliations = async function (req, res, next) {

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 2, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("./cashbacks/approvedApplications", {
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}


// get approved applications data here...

cashbackControllerObj.getFilteredApprovedApplications = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 4, "R")
    if (middleWearObjRes) {
        // console.log(req.body, "---request body --")
        let { returnDataFromModal, count } = await cashbackModel.getFilteredApprovedApplications(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTEREDAPPROVEDAPPLICATIONS-101',
            payload: {
                approvedApplicationsList: returnDataFromModal,
                count,
            }
        }

        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
    //console.log(dataFromModel);

}



// mark approved applications as paid here....

cashbackControllerObj.markApprovedAsPaid = async function (req, res, next) {
    // console.log("hi im in this /approved-mark-paid", req.body)
    let returnData = {
        status: true,
        code: "CIA-APP-CASHBACK-105",
        payload: false,
    }
    if (req.body && req.body.checkedData) {
        let dataFromModel = await cashbackModel.approvedMarkAsPaid(
            req.body.checkedData
        )

        if (dataFromModel !== false) {
            returnData.payload = dataFromModel
            commonHelper.successHandler(res, returnData)
        } else {
            returnData.status = false
            returnData.code = "CIA-APP-CASHBACK-ERROR-105"
            commonHelper.errorHandler(res, returnData)
        }
    } else {
        returnData.status = false
        returnData.code = "CIA-APP-CASHBACK-ERROR-106"
        commonHelper.errorHandler(res, returnData)
    }

}

cashbackControllerObj.updatePaymentDetails = async function (req, res, next) {
    console.log(req.body)
}


cashbackControllerObj.getTransactionsReport = async function (req, res, next) {

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 2, "R");
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req);
        // let reportData = await cashbackModel.getTransactionReportData();
        // console.log(reportData, "++++++++ report data ++++++++");
        res.render("./cashbacks/transactionReport", {
            sidebarDataByServer: sideBarData,
           // reportData: reportData
        });
    } else {
        res.render("error/noPermission");
    }
}


cashbackControllerObj.getTransactionsReportAjex = async function (req, res, next) {
    console.log("hi i am in this " , req.body);
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 2, "R");
    if (middleWearObjRes) {
        let reportData = await cashbackModel.getTransactionReportData(req.body);
        res.render("./cashbacks/transactionReportAjex", {
            reportData: reportData.paymentData,
            totalCount : reportData.count,
        });
    } else {
        res.render("error/noPermission");
    }
}

module.exports = cashbackControllerObj