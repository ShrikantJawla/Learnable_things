let USERADMINS = {}
USERADMINS.upId = "";
USERADMINS.upName = "";
USERADMINS.upEmail = "";
USERADMINS.upRole = "";
USERADMINS.upTeleNumber = "";

USERADMINS.getUserAdminRoles = function () {
    $.ajax({
        url: "/users/user-roles-ajax",
        type: "GET",
        success: function (result) {
            console.log(result, "result from roles ")
            USERADMINS.userRolesInAddAdminUser(result.payload)
        },
    })
}

USERADMINS.userRolesInAddAdminUser = function (result) {
    let adminRoleTag =
        document.getElementById("userAdminRolesHere")
    let adminRoleTagu = document.getElementById(
        "userAdminRolesHereu"
    )
    let appendData = `<option value="0" selected>Select User Role</option>`
    for (let i = 0; i < result.length; i++) {
        appendData =
            appendData +
            `<option value="${result[i].uar_id}" >${result[i].uar_role_name}</option>`
    }
    adminRoleTag.innerHTML = appendData
    adminRoleTagu.innerHTML = appendData
}

// // adding new admin user

USERADMINS.addNewAdminUser = function () {
    let validEmailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    let newAdminUserName = $("#adminUserName").val()
    let newAdminEmail = $("#adminEmail").val()
    let newAdminPassword = $("#adminPassword").val()
    let newAdminRole = $("#userAdminRolesHere").val()
    let newAdminFormError = $("#errorShow");
    let newActiveUser = $("#new_active_user").is(":checked");
    let teleNumber = $("#teleNumber").val();
    console.log("New  active in user admin ------->>>>", teleNumber.length);

    if (
        newAdminUserName === "" ||
        newAdminUserName === null ||
        newAdminUserName === undefined
    ) {
        return newAdminFormError.html(
            `<p class="error-text"> Username can't be empty</p>`
        )
    } else if (!newAdminEmail.match(validEmailRegex)) {
        return newAdminFormError.html(
            `<p class="error-text">Not a valid email address</p>`
        )
    } else if (newAdminPassword.length <= 6) {
        return newAdminFormError.html(
            `<p class="error-text">Pasword can't be less than 6 characters.</p>`
        )
    } else if (newAdminRole == 0) {
        return newAdminFormError.html(
            `<p class="error-text">Please select a role</p>`
        )
    } else if (teleNumber && teleNumber.length != 10) {
        console.log(teleNumber.length);
        return newAdminFormError.html(
            `<p class="error-text">Please provide a tele number</p>`
        )
    } else {
        
        $.ajax({
            url: "/users/admin-add-new-user",
            type: "POST",
            data: {
                UAuserName: newAdminUserName,
                UAuserEmail: newAdminEmail,
                UApassword: newAdminPassword,
                UAuserRole: newAdminRole,
                UAActiveUser: newActiveUser,
                UATeleNumber: teleNumber
            },
            success: function (result) {
                console.log("hey user added ")

                if (result.status === true) {
                    console.log("hy")
                    $("#ciAddNewAdminUserForm").modal("toggle")
                    getTableBody()
                    USERADMINS.getUserAdminRoles()
                } else {
                    newAdminFormError.html(
                        `<p class="error-text">There is a problem while adding User</p>`
                    )
                }
            },
        })
    }
}

// // updating existing admin user
USERADMINS.updateAdminUser = function () {
    let validEmail =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    let userId = USERADMINS.upId
    let userName = $("#adminUserNameu").val();
    let userEmail = $("#adminEmailu").val();
    let userPassword = $("#adminPasswordu").val();
    let teleNumber = $("#teleNumberu").val();
    let userRole = $("#userAdminRolesHereu").val();
    let updateAdminFormError = $("#errorShowu");
    let userActiveUser = $("#edit_active_user").is(":checked");
    console.log("upade actice in user admin ------->>>>", userActiveUser);

    if (
        userName === "" ||
        userName === null ||
        userName === undefined
    ) {
        return updateAdminFormError.html(
            `<p class="error-text"> Username can't be empty</p>`
        )
    } else if (!userEmail.match(validEmail)) {
        return updateAdminFormError.html(
            `<p class="error-text">Not a valid email address</p>`
        )
    } else if (teleNumber.length < 10) {
        console.log(teleNumber.length);
        return updateAdminFormError.html(
            `<p class="error-text">Please provide a tele number</p>`
        )
    } else if (userRole == 0) {
        return updateAdminFormError.html(
            `<p class="error-text">Please select a role</p>`
        )
    } else {
        $.ajax({
            url: "/users/admin-update-user",
            type: "POST",
            data: {
                ua_id: userId,
                ua_password: userPassword,
                ua_name: userName,
                ua_email: userEmail,
                ua_role: userRole,
                ua_active_user: userActiveUser,
                ua_tele_number: teleNumber
            },
            success: function (result) {
                if (result.status === true) {
                    $("#ciUpdateAdminUserForm").modal("toggle")
                    getTableBody()
                    USERADMINS.getUserAdminRoles()
                } else {
                    newAdminFormError.html(
                        `<p class="error-text">There is a problem while updating user</p>`
                    )
                }
            },
        })
    }
}

$("#ciUpdateAdminUserForm").on("show.bs.modal", function (e) {
    console.log($(e.relatedTarget).data(), "ergt")
    //get data-id attribute of the clicked element
    USERADMINS.upId = $(e.relatedTarget).data("up-id")
    USERADMINS.upName = $(e.relatedTarget).data("up-name")
    USERADMINS.upEmail = $(e.relatedTarget).data("up-email")
    USERADMINS.upRole = $(e.relatedTarget).data("up-role")

    USERADMINS.upActive = $(e.relatedTarget).data("up-activeuser");
    USERADMINS.upTeleNumber = $(e.relatedTarget).data('up-telenumber');

    //populate the textbox
    $(e.currentTarget)
        .find('input[name="adminUserNameu"]')
        .val(USERADMINS.upName)
    $(e.currentTarget)
        .find('input[name="adminEmailu"]')
        .val(USERADMINS.upEmail)
    $(e.currentTarget)
        .find('input[name="teleNumberu"]')
        .val(USERADMINS.upTeleNumber)
    $(e.currentTarget)
        .find("#userAdminRolesHereu")
        .val(USERADMINS.upRole)
    $(e.currentTarget).find("#adminPasswordu").val("");
    $(e.currentTarget)
        .find("#edit_active_user").prop('checked', USERADMINS.upActive);
})

$(document).ready(function () {
    $("#ciAddNewAdminUserForm").modal({
        backdrop: "static",
        keyboard: false,
    })
    $("#ciUpdateAdminUserForm").modal({
        backdrop: "static",
        keyboard: false,
    })

    USERADMINS.getUserAdminRoles()
})

