
const { pool } = require('../../utils/configs/database');

let userAdminModel = {};


/* This is a function that is used to get all the permissions from the database. */
userAdminModel.getAllPermissions = async function (reqData) {
    let resultData = {}
    let returnData = false
    let query = `SELECT "user_admin_panel_permissions".*, "user_admin_role"."uar_role_name" AS "uap_role_name" , "admin_sidebar"."as_title" AS module_name
    from "user_admin_panel_permissions" 
    LEFT JOIN "user_admin_role" ON "user_admin_panel_permissions"."uap_uar" = "user_admin_role"."uar_id" 
    LEFT JOIN "admin_sidebar" ON "user_admin_panel_permissions"."uap_module_id" = "admin_sidebar"."as_id"
    ORDER BY "uap_id" ASC; `
    try {
        let queryData = await pool.query(query)
        resultData = queryData.rows
    } catch (err) {
        console.log(err);
    }
    returnData = resultData
    return returnData
}


/* This function is used to add new url in permission table. */

userAdminModel.addNewUrlInPermission = async function (url) {
    console.log(url, "------------url");
    let returnData = {
        status: false,
        message: "some thing wents wrong.",
    }
    console.log(url, "url");
    if (url) {
        let moduleId = `SELECT * FROM public.admin_sidebar where as_url ='` + url + `'`;

        //  console.log(query, getRolesQuery);
        try {
            let getModuleId = await pool.query(moduleId);
            if (getModuleId && getModuleId.rows.length > 0) {
                url = getModuleId.rows[0].as_parent_id;
                let query =
                    `SELECT * from "user_admin_panel_permissions" where uap_module_id = '` +
                    url +
                    `'`;
                let getRolesQuery = `SELECT * FROM public.user_admin_role`;
                let queryData = await pool.query(query);
                let getRolesQueryData = await pool.query(getRolesQuery);
                let resultData = queryData.rows
                if (
                    resultData.length == 0 ||
                    getRolesQueryData.rows.length != resultData.length
                ) {
                    if (getRolesQueryData && getRolesQueryData.rows.length > 0) {
                        let allRoles = getRolesQueryData.rows
                        for (let i = 0; i < allRoles.length; i++) {
                            if (resultData.length != 0) {
                                let needToInsert = true
                                for (let k = 0; k < resultData.length; k++) {
                                    if (allRoles[i].uar_id == resultData[k].uap_uar) {
                                        needToInsert = false
                                    }
                                }
                                if (needToInsert) {
                                    let permissionStatus = false
                                    if (allRoles[i].uar_id == 1) {
                                        permissionStatus = true
                                    }
                                    let insertQuery =
                                        `INSERT INTO user_admin_panel_permissions(uap_module_id, uap_uar, uap_access_status) values('` +
                                        url +
                                        `', ` +
                                        allRoles[i].uar_id +
                                        `, ` +
                                        permissionStatus +
                                        `);`
                                    console.log(insertQuery);
                                    await pool.query(insertQuery)
                                }
                            } else {
                                let permissionStatus = false
                                if (allRoles[i].uar_id == 1) {
                                    permissionStatus = true
                                }
                                let insertQuery =
                                    `INSERT INTO user_admin_panel_permissions(uap_module_id, uap_uar, uap_access_status , uap_access_read , uap_access_write , uap_access_remove) values('` +
                                    url +
                                    `', ` +
                                    allRoles[i].uar_id +
                                    `, ` +
                                    permissionStatus +
                                    ` , ` +
                                    permissionStatus +
                                    ` , ` +
                                    permissionStatus +
                                    ` , ` +
                                    permissionStatus +
                                    `);`
                                console.log(insertQuery);
                                await pool.query(insertQuery)
                            }
                        }
                        returnData.status = true
                        returnData.message = "All Done"
                    } else {
                        console.log('hi i am iin error')
                        returnData.message = "Roles not able to fetched"
                    }
                } else {
                    returnData.message = "url already exist"
                }
            }

        } catch (err) {
            console.log(err);
            returnData.message = "err"
        }
        console.log(returnData, "returnDatareturnData");
        return returnData
    }
}



userAdminModel.updatePermissionData = async function ({
    permissionId,
    url,
    pStatus,
    rStatus,
    wStatus,
    dStatus,
}) {
    let returnData = {
        status: false,
        message: "some thing wents wrong.",
    }
    if (permissionId) {
        let updateQuery = `UPDATE user_admin_panel_permissions SET uap_access_status = ${pStatus}, uap_access_read = ${rStatus}, uap_access_write = ${wStatus}, uap_access_remove = ${dStatus} WHERE uap_id = ${permissionId};`
        if (url) {
            updateQuery =
                `Update user_admin_panel_permissions set uap_url = '` +
                url +
                `' where uap_id = ` +
                permissionId
        }
        try {
            //console.log(updateQuery, "updateQueryupdateQuery");
            await pool.query(updateQuery)
            returnData.status = true
            returnData.message = "All Done"
        } catch (err) {
            //console.log(err);
        }
    }
    return returnData
}


userAdminModel.getDataInEditTeamsBankAccess = async function(){

    let resultData = {};
    let returnData = false;
    let query = `SELECT user_admin.ua_id, user_admin.ua_name, user_admin_role.uar_role_name, tele_teams.* FROM user_admin 
    FULL JOIN tele_teams ON tele_teams.user_id = user_admin.ua_id 
    RIGHT JOIN user_admin_role On user_admin_role.uar_id = user_admin.ua_role 
    Where active_user = true
    order by user_admin.ua_id;`;

    try {
        let queryData = await pool.query(query);
        resultData = queryData.rows
    } catch (err) {
        console.log(err);
    }
    returnData = resultData
    return returnData;
}


userAdminModel.updateTeleTeamsData = async function({userId, upsertData}){

    let upsertQuery = `INSERT INTO tele_teams (user_id, ${upsertData.issuer}, created_by, updated_by) 
    VALUES (${userId}, ${upsertData.isChecked}, ${upsertData.loggedUser.ua_id}, ${upsertData.loggedUser.ua_id}) ON CONFLICT (user_id) DO UPDATE
    SET ${upsertData.issuer}  = excluded.${upsertData.issuer},
    updated_by = ${upsertData.loggedUser.ua_id},
    updated_at = (now() AT TIME ZONE 'Asia/Kolkata');`;
    console.log(upsertQuery, "<<<<<<")
    try {

        let dataFromDb = await pool.query(upsertQuery);
        
        return true;

        
    } catch (error) {
        console.log(error, "error");
        return false;
        
    }
}





module.exports = userAdminModel;