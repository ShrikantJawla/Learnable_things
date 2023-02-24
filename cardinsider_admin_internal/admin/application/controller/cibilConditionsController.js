/* Importing the middleware and commonController files. */
const middleWareObj = require("../common/middleware");
const commonControllerObj = require("./commonController");
const commonModelObj = require("../model/commonModel");

/* Creating an empty object. */
let controllerObj = {};

/* A function which is used to render the view file. */
controllerObj.renderCardIssuersCibilConditions = async function (req, res, next) {
	/* Checking the permission of the user. */
	let middleWareObjRes = await middleWareObj.checkAccessPermition(req, 33, "R");
	if (middleWareObjRes) {
		/* Calling the commonControllerObj.commonSideBarData function and assigning the result to
		sideBarData. */
		let sideBarData = await commonControllerObj.commonSideBarData(req);
		let getAllIssuersDataSql = `SELECT * FROM public.issuer_web_cibil_conditions LEFT JOIN card_issuers
		ON iwcc_issuer_id = id; `;
		let result = await commonModelObj.getDataOrCount(getAllIssuersDataSql, [], 'D', true);
		/* Rendering the view file. */
		res.render("cibilConditions/cardIssuersCibilConditions", {
			sidebarDataByServer: sideBarData,
			allRecord: result
		});
	} else {
		/* Rendering the error/noPermission view. */
		res.render("error/noPermission");
	}
}

/* A function which is used to render the view file. */
controllerObj.renderCardIssuersCibilConditionsAddNew = async function (req, res, next) {
	/* Checking the permission of the user. */
	let middleWareObjRes = await middleWareObj.checkAccessPermition(req, 33, "R");
	if (middleWareObjRes) {
		/* Calling the commonControllerObj.commonSideBarData function and assigning the result to
		sideBarData. */
		let sideBarData = await commonControllerObj.commonSideBarData(req)
		/* Rendering the view file. */
		let getAllIssuers = `SELECT * FROM public.card_issuers where creditreportshow = true ORDER BY id ASC `;
		let result = await commonModelObj.getDataOrCount(getAllIssuers, [], 'D', true);
		console.log(result, "resultresultresult");
		res.render("cibilConditions/newCardIssuerCibilCondition", {
			sidebarDataByServer: sideBarData,
			allIssuers: result,
		});
	} else {
		/* Rendering the error/noPermission view. */
		res.render("error/noPermission");
	}
}



/* A function which is used to render the view file. */
controllerObj.renderCreditCardsCibilConditions = async function (req, res, next) {
	/* Checking the permission of the user. */
	let middleWareObjRes = await middleWareObj.checkAccessPermition(req, 33, "R");
	if (middleWareObjRes) {
		/* Calling the function commonSideBarData from commonController.js and assigning the result to
		sideBarData. */
		let sideBarData = await commonControllerObj.commonSideBarData(req)
		/* Rendering the view file. */
		let getAllCCDataSql = `SELECT * FROM public.cards_web_cibil_conditions LEFT JOIN credit_cards
		ON cwcc_card_id = id  `;
		// LEFT JOIN card_categories
		// ON cwcc_category_id = cc_id; 
		console.log(getAllCCDataSql , "getAllCCDataSql");
		let result = await commonModelObj.getDataOrCount(getAllCCDataSql, [], 'D', true);
		let allCateSql = `SELECT * from card_categories`;
		let allCardsCateg =  await commonModelObj.getDataOrCount(allCateSql, [], 'D', true);
		let allCatObj = {};
		if (allCardsCateg && allCardsCateg.length > 0){
			for(let i =0 ; i < allCardsCateg.length; i++) {
				allCatObj[allCardsCateg[i].cc_id] = allCardsCateg[i].cc_name
			}
		}
		if (result && result.length > 0){
			for(let k =0 ; k < result.length; k++) {
				
				let cardCategories = result[k].cwcc_category_id;
				//result[k].cwcc_category_id = '';
				for (let g = 0; g < cardCategories.length; g++){
					if (g == 0 ){
						result[k].cwcc_category_id = allCatObj[cardCategories[g]];
					} else {
						result[k].cwcc_category_id = result[k].cwcc_category_id + ` , ` + allCatObj[cardCategories[g]];
					}
				
				}
				//allCatObj[allCardsCateg[i].cc_id] = allCardsCateg[i].name
			}
		}
		console.log(allCatObj);
		res.render("cibilConditions/creditCardsCibilConditions", {
			sidebarDataByServer: sideBarData,
			allRecord: result,
			allCardsCategObj : allCatObj
		});
	} else {
		/* Rendering the view file. */
		res.render("error/noPermission");
	}
}

/* A function which is used to render the view file. */
controllerObj.renderCreditCardsCibilConditionsAddNew = async function (req, res, next) {
	/* Checking the permission of the user. */
	let middleWareObjRes = await middleWareObj.checkAccessPermition(req, 33, "R");
	if (middleWareObjRes) {
		/* Calling the commonControllerObj.commonSideBarData function and assigning the result to
		sideBarData. */

		let sideBarData = await commonControllerObj.commonSideBarData(req)
		let getAllIssuers = `SELECT * FROM public.credit_cards where creditreportshowcard = true ORDER BY id ASC `;
		let result = await commonModelObj.getDataOrCount(getAllIssuers, [], 'D', true);
		let getCat = `SELECT * FROM public.card_categories
		ORDER BY cc_id ASC `;
		let result2 = await commonModelObj.getDataOrCount(getCat, [], 'D', true);
		/* Rendering the view file. */
		res.render("cibilConditions/newCreditCardCondition", {
			sidebarDataByServer: sideBarData,
			allCards: result,
			cardCategories: result2,
		});
	} else {
		/* Rendering the error/noPermission view. */
		res.render("error/noPermission");
	}
}

controllerObj.addNewDataAjex = async function (req, res, next) {
	console.log(req.body, "HIHIHIHIHIHIH");
	let returnData = {
		status: false,
		code: "CIA-APP-cibil-Error-200",
		payload: false,
	}
	let bodayData = req.body;
	let inserData = {
		iwcc_issuer_id: bodayData.selectCardIssuer,
		iwcc_min_cibil: bodayData.creditScore,
		iwcc_max_age: bodayData.maxAge,
		iwcc_min_age: bodayData.minAge,
	};
	let inserSql = await commonModelObj.insert('issuer_web_cibil_conditions', inserData, true);
	inserSql = inserSql + ` ON CONFLICT ("iwcc_issuer_id") DO UPDATE 
	SET "iwcc_min_cibil" = excluded."iwcc_min_cibil",
	"iwcc_min_age" = excluded."iwcc_min_age",
	"iwcc_max_age" = excluded."iwcc_max_age"`;
	let result = await commonModelObj.getDataOrCount(inserSql, [], 'U', true);

	console.log(result, "inserSqlinserSql");
	if (result) {
		returnData.status = true
		returnData.code = "CIA-APP-CIBIL-201"

	}
	res.send(returnData);
}

controllerObj.addNewCreditCardDataAjex = async function (req, res, next) {
	console.log(req.body.categ, "HIHIHIHIHIHIH");
	let returnData = {
		status: false,
		code: "CIA-APP-cibil-Error-200",
		payload: false,
	}
	let bodayData = req.body;
	// let inserData = {
	// 	cwcc_card_id: bodayData.selectCardIssuer,
	// 	cwcc_category_id: 'ARRAY['+JSON.parse(req.body.categ)+']',
	// 	cwcc_min_annual_income: bodayData.annulIncome,
	// };
	let inserQuery = `INSERT INTO cards_web_cibil_conditions( cwcc_card_id , cwcc_category_id , cwcc_min_annual_income ) VALUES( '`+bodayData.selectCardIssuer+`' , ARRAY[`+JSON.parse(req.body.categ)+`] , '`+bodayData.annulIncome+`' ) ON CONFLICT ("cwcc_card_id") DO UPDATE 
	SET "cwcc_category_id" = excluded."cwcc_category_id",
	"cwcc_min_annual_income" = excluded."cwcc_min_annual_income"`;
	console.log(inserQuery, "inserSqlinserSql");
	let inserSql = await commonModelObj.getDataOrCount(inserQuery, [], 'U', true);
	
	if (inserSql) {
		returnData.status = true
		returnData.code = "CIA-APP-CIBIL-201"

	}
	res.send(returnData);
}

controllerObj.getAllActiveDashboardIssuers = async function (req, res, next) {
	/* Checking the permission of the user. */
	// let middleWareObjRes = await middleWareObj.checkAccessPermition(req, 33, "R");
	// if (middleWareObjRes) {
	// 	/* Calling the commonControllerObj.commonSideBarData function and assigning the result to
	// 	sideBarData. */
	// 	let sideBarData = await commonControllerObj.commonSideBarData(req)
	// 	/* Rendering the view file. */
	// 	res.render("cibilConditions/newCreditCardCondition", {
	// 		sidebarDataByServer: sideBarData,
	// 	});
	// } else {
	// 	/* Rendering the error/noPermission view. */
	// 	res.render("error/noPermission");
	// }
}

module.exports = controllerObj;