const { pool } = require("../../../configration/database")
const bcrypt = require("bcrypt")
const { rows } = require("pg/lib/defaults")
const cIHelpers = require("../common/helper")

let userAdminModel = {}

//user admins here.....

userAdminModel.getUserAdminAllData = async function (reqData) {
    let resultData = {}
    let returnData = false
    let query = `SELECT "user_admin"."ua_id", "user_admin"."ua_name", "user_admin"."ua_email", "user_admin"."ua_role", "user_admin"."created_by", 
    "user_admin"."created_at", "user_admin"."updated_at", "user_admin"."strapi_user_id", "user_admin"."active_user", 
    "user_admin_role"."uar_roll_name" AS "uap_role_name" 
        from "user_admin" 
        LEFT JOIN "user_admin_role" ON "user_admin"."ua_role" = "user_admin_role"."uar_id" ORDER BY "ua_id" ASC; `
    try {
        let queryData = await pool.query(query)
        resultData = queryData.rows
    } catch (err) {
        //console.log(err);
    }
    returnData = resultData;
    return returnData
}

userAdminModel.getUserAdminroles = async function () {
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

userAdminModel.addNewAdminUser = async function (
    userPassword,
    userName,
    userEmail,
    userRole,
    userStrapiId,
    created_by,
    userActiveUser,
) {
    let resultData = []
    let returnData = false
    // console.log(userPassword, userName, userEmail, userRole,
    //     userStrapiId,
    //     created_by,
    //     userActiveUser);

    let userPass = userPassword

    const hashSalt = await bcrypt.genSalt(6)

    let clientPassword = await bcrypt.hash(userPass, hashSalt)

    let addUserData = {
        userName: userName,
        userEmail: userEmail,
        userPassword: clientPassword,
        created_by: created_by,
        userRole: userRole,
        strapi_user_id: userStrapiId,
        userActive:userActiveUser
    }

    //console.log(addUserData, "adduser data ");

    let checkUserIfexists = []
    try {
        const checkUserResponse = await pool.query(
            `Select * from user_admin where ua_email = '${addUserData.userEmail}'`
        )
        checkUserIfexists = checkUserResponse.rows;
    } catch (error) {
        //console.log(error);
    }

    const addAdminQuery = `INSERT INTO user_admin(ua_name, ua_email, ua_role, created_by, ua_password,strapi_user_id, active_user) values ('${addUserData.userName}', '${addUserData.userEmail}', ${addUserData.userRole},
    ${addUserData.created_by}, '${addUserData.userPassword}',${addUserData.strapi_user_id}, ${addUserData.userActive}) returning *;`

    if (checkUserIfexists.length == 0) {
        try {
            let response = await pool.query(addAdminQuery)
            resultData = response.rows
            returnData = resultData
        } catch (error) {
            //console.log(error);
        }
    }

    //console.log(addUserData, "adduser datat here....");
    //console.log("original pasword", userPass);
    //console.log("ivgiu  ....>>>>", clientPassword);
    //console.log(resultData, "result data from db ");
    //console.log(checkUserIfexists, "checkUser if already exists");
    return returnData
}

//updating user admin

userAdminModel.updateAdminUser = async function (id, updateData) {
    let resultData = {}
    let returnData = false;
   // console.log("update data in model ---->>>",updateData);
    if (updateData.password != "") {
        //console.log("executing with password");
        console.log(updateData);
        const hashSalt = await bcrypt.genSalt(6)
        let clientPassword = await bcrypt.hash(updateData.password, hashSalt)
        let pquery = `UPDATE user_admin SET ua_name = '${updateData.name}', ua_email = '${updateData.email}',ua_password = '${clientPassword}', ua_role = ${updateData.userRole}, created_by = 1, strapi_user_id=${updateData.userStrapiId * 1} , active_user = ${updateData.userActiveUser} , updated_at = CURRENT_TIMESTAMP where ua_id = ${id};`
        try {
            let queryData = await pool.query(pquery)
            resultData = queryData
        } catch (err) { 
            //console.log(err);
        }
    } else {
        //console.log("executing without password");
        let nquery = `UPDATE user_admin SET ua_name = '${updateData.name}', ua_email = '${updateData.email}', ua_role = ${updateData.userRole}, created_by = 1,strapi_user_id=${updateData.userStrapiId * 1}, active_user = ${updateData.userActiveUser} , updated_at = CURRENT_TIMESTAMP where ua_id = ${id};`
        try {
            let queryDataN = await pool.query(nquery)
            resultData = queryDataN
        } catch (err) {
            //console.log(err);
        }
    }
    returnData = resultData
    return returnData
}

// permissions here.....

userAdminModel.getAllPermissions = async function (reqData) {
    let resultData = {}
    let returnData = false
    let query = `SELECT "user_admin_panel_permissions".*, "user_admin_role"."uar_roll_name" AS "uap_roll_name" , "admin_sidebar"."as_title" AS module_name
    from "user_admin_panel_permissions" 
    LEFT JOIN "user_admin_role" ON "user_admin_panel_permissions"."uap_uar" = "user_admin_role"."uar_id" 
    LEFT JOIN "admin_sidebar" ON "user_admin_panel_permissions"."uap_module_id" = "admin_sidebar"."as_id"
    ORDER BY "uap_id" ASC; `
    try {
        let queryData = await pool.query(query)
        resultData = queryData.rows
    } catch (err) {
        //console.log(err);
    }
    returnData = resultData
    return returnData
}

userAdminModel.addNewUrlInPermission = async function (url) {
    let returnData = {
        status: false,
        message: "some thing wents wrong.",
    }
    if (url) {
        let query =
            `SELECT * from "user_admin_panel_permissions" where uap_module_id = '` +
            url +
            `'`
        let getRolesQuery = `SELECT * FROM public.user_admin_role`
console.log(query, "auwfd");
console.log(url, "url here ");
        try {
            let queryData = await pool.query(query)
            let getRolesQueryData = await pool.query(getRolesQuery)
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
                                //console.log(insertQuery);
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
                            //console.log(insertQuery);
                            await pool.query(insertQuery)
                        }
                    }
                    returnData.status = true
                    returnData.message = "All Done"
                } else {
                    returnData.message = "Roles not able to fetched"
                }
            } else {
                returnData.message = "url already exist"
            }
        } catch (err) {
            //console.log(err);
            returnData.message = "err"
        }
        //console.log(returnData, "returnDatareturnData");
        return returnData
    }
}
userAdminModel.checkIsHavePermission = async function (roleId, cUrl) {
    let havePermission = false
    if (roleId == 1) {
        havePermission = true
    } else {
        let query =
            `SELECT * from "user_admin_panel_permissions" where uap_module_id = '` +
            cUrl +
            `' AND uap_uar = ` +
            roleId
        let queryData = await pool.query(query)
        if (queryData && queryData.rows.length > 0) {
            havePermission = queryData.rows[0]
        }
    }
    return havePermission
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

userAdminModel.removePermission = async function (removeid) {
    let resultData = {}
    let returnData = false
    if (removeid != "" || removeid != null) {
        let query = `DELETE FROM user_admin_panel_permissions where uap_id = ${removeid};`
        try {
            let queryData = await pool.query(query)
            resultData = queryData.rows
        } catch (err) {
            //console.log(err);
        }
        returnData = resultData
    }
    return returnData
}

userAdminModel.getUserAdminRole = async function (userId) {
    let resultData = {}
    let returnData = false
    let query = `SELECT ua_role from "user_admin" where ua_id = ` + userId
    try {
        let queryData = await pool.query(query)
        resultData = queryData.rows
    } catch (err) {
        //console.log(err);
    }
    returnData = resultData
    return returnData
}

userAdminModel.addNewRole = async function (newRole) {
    let resultData = {
        status: false,
        message: '',
    }
    let query = `SELECT * from "user_admin_role" where uar_roll_name = '${newRole}'`
    try {
        let queryData = await pool.query(query)
        let checkRoleExist = queryData.rows
        if (checkRoleExist.length == 0) {
            let insertRoleQuery = `INSERT into user_admin_role("uar_roll_name") values('${newRole}') Returning * `
            let newRoleDataByQuery = await pool.query(insertRoleQuery)
            let roleId = newRoleDataByQuery.rows[0].uar_id
            if (roleId) {
                let getAllSideBarParentsSql = `SELECT * FROM public.admin_sidebar where as_is_parent = true ORDER BY as_id ASC `
                let getAllSideBarParentsData = await pool.query(getAllSideBarParentsSql)
                let allPerants = getAllSideBarParentsData.rows
                if (allPerants && allPerants.length > 0) {
                    for (let i = 0; i < allPerants.length; i++) {
                        await userAdminModel.addNewUrlInPermission(allPerants[i].as_id)
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
        //console.log(err);
    }
    return resultData
}

module.exports = userAdminModel