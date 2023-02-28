let { pool } = require('../../utils/configs/database');

let userAdminPermissionModel = require('../../model/users/userAdminPermissionModel');

let modelObj = {};


modelObj.getUserRoles = async function () {

    //console.log("hi im in model");
    let resultData = []
    let returnData = false
    let query = `SELECT * FROM user_admin_role;`
    try {
        let queryData = await pool.query(query)
        resultData = queryData.rows
    } catch (err) {
        //console.log(err);
    }
    returnData = resultData
    return returnData

}





modelObj.addNewRole = async function (newRole) {
    console.log("hi min in model");
    let resultData = {
        status: false,
        message: '',
    }
    let query = `SELECT * from "user_admin_role" where uar_role_name = '${newRole}'`;
    try {
        let queryData = await pool.query(query);
        let checkRoleExist = queryData.rows;
        if (checkRoleExist.length == 0) {
            let insertRoleQuery = `INSERT into user_admin_role("uar_role_name") values('${newRole}') Returning * `;
            let newRoleDataByQuery = await pool.query(insertRoleQuery);
            let roleId = newRoleDataByQuery.rows;
            //console.log(roleId, "roels");
            if (roleId.length > 0) {
                resultData.status = true;
                resultData.message = "Data inserted successfully";
                resultData.payload = roleId;
            }
            if (roleId) {
                let getAllSideBarParentsSql = `SELECT * FROM public.admin_sidebar where as_is_parent = false ORDER BY as_id ASC `
                let getAllSideBarParentsData = await pool.query(getAllSideBarParentsSql)
                let allPerants = getAllSideBarParentsData.rows
                if (allPerants && allPerants.length > 0) {
                    for (let i = 0; i < allPerants.length; i++) {
                        // console.log(allPerants[i], "allPerants[i].as_parent_id");
                        let result = await userAdminPermissionModel.addNewUrlInPermission(allPerants[i].as_url);
                        console.log(result, "result");
                    }
                    resultData.status = true
                    resultData.message = 'All Done.'
                }
            }
        } else {
            resultData.status = false
            resultData.message = 'Already exist.'
        }
    } catch (err) {
        console.log(err);
    }
    return resultData
}


module.exports = modelObj;