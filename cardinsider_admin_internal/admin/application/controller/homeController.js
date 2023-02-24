const homeModel = require("../model/homeModel");
const commonControllerObj = require("./commonController");
let homeObj = {};

homeObj.index = async function(req, res, next) {
    let sideBarData  = await commonControllerObj.commonSideBarData(req);
    res.render("homeViews/dashboard" , {sidebarDataByServer : sideBarData});
};



module.exports = homeObj;