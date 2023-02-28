// Here goes your custom javascript
function collapse(cell) {
    var row = cell.parentElement
    var target_row = row.parentElement.children[row.rowIndex + 1]
    if (target_row.style.display == "table-row") {
        cell.innerHTML = "+"
        target_row.style.display = "none"
    } else {
        cell.innerHTML = "-"
        target_row.style.display = "table-row"
    }
}
/* ===========>>>>>>>>>   Sign in user here....   <<<<<<<<<<<======================= */
function ValidateProcesSigninData() {
    
    let emailValue = document.getElementById("signInEmail").value
    let password = document.getElementById("signInPassword").value

    if (validateEmail(emailValue) && password.length >= 6) {
        $.ajax({
            url: "/sign-in-data",
            type: "POST",
            data: {
                email: emailValue,
                password: password,
            },

            success: function (result) {
                window.location.href = "/";
            },
            error: function(error){
              document.getElementById("sign-in-error").innerHTML = `${error.responseJSON.message} Please Contact Admin`;
           }
        })
    } else {
        alert("Please check your credentials")
    }
}

const validateEmail = (email) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
}

/* ===========>>>>>>>>>   Sign out user here....   <<<<<<<<<<<======================= */

function signOutUser() {
    ////console.log("hi im in this");
    $.ajax({
        url: "/sign-out-user",
        type: "POST",
        //contentType: "application/jsonrequest",
        //dataType: 'json',
        data: {},

        success: function (result) {
            //console.log("completing ajax req");
            //console.log(result);
            //window.location.href = window.location.href;
            window.location.href = "/"
        },
    })
}
window.addEventListener('keydown', e => {
    if (e.code === 'Enter' && window.location.pathname === '/') {
        ValidateProcesSigninData()
    }
})

/* ===========>>>>>>>>>   upload and process card application here....   <<<<<<<<<<<======================= */


const btn3_ctn = document.querySelector(".btn3_container");
const main = document.querySelector(".main");
const icon = document.querySelector(".btn");
btn3_ctn.addEventListener("click", () => {
  icon.classList.toggle("fa-check-circle");
  icon.classList.toggle("fa-times-circle");
  main.classList.toggle("active3");
  icon.classList.toggle("greenclr");
});
