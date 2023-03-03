"use strict";

let pincode;
let oldPincode;
let phone;
let oldPhone;
let hiddenNumber;
let userInfoData = {};


// Date Filter
const d = new Date();
let currentYear = d.getFullYear();
$(document).ready(function () {
  $("#form_dob").attr({
    max: `${currentYear - 18}-12-31`,
    min: `${currentYear - 100}-12-31`,
  });
});
// Input Number Filter
$("#form_phone,#form_pincode,#form_income").on("keypress", function (event) {
  var regex = new RegExp("^[0-9]+$");
  var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
  if (!regex.test(key)) {
    event.preventDefault();
    return false;
  }
});
$("#form_name").on("keypress", function (event) {
  var regex = new RegExp("^[a-zA-Z_ ]+$");
  var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
  if (!regex.test(key)) {
    event.preventDefault();
    return false;
  }
});

$(document).ready(function () {
    $('#otpModal').modal({
        backdrop: 'static',
        keyboard: false
    })
   });

$(".form-select").change(function (e) {
  $(e.target).css("color", "#60697b");
});

// API Call for Pincode
$("#form_pincode").keyup(function (e) {
  if (e.target.value.length === 6) {
    pincode = e.target.value;
  } else {
    pincode = 0;
    $("#form_city").val("");
  }
  if (pincode != 0 && pincode != oldPincode) {
    oldPincode = pincode;
    getPincodeValue(pincode);
  }
});

// API Call for Pincode
$("#form_phone").keyup(function (e) {
  if (e.target.value.length === 10) {
    phone = e.target.value;
  } else {
    phone = 0;
  }
  if (phone != 0 && phone != oldPhone) {
    oldPhone = phone;
    hiddenNumber = "********" + String(phone).slice(-4);
    //VerifyPhoneNumber(phone);
    // need work here
  }
});

// API Call for Prefilled Data
let autoPin = $("#form_pincode").val();
if (autoPin.length === 6) {
  getPincodeValue(autoPin);
}
let autoDob = $("#form_dob").val();
let date = new Date(autoDob);
if (date != "Invalid Date") {
  let finalDate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  $("#form_dob").val(finalDate);
}

function VerifyPhoneNumber(value) {
  console.log("ran once");
  $.ajax({
    type: "POST",
    url: "/api/auth/sign-in-using-phone",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: {
      phone: value,
    },
    success: function (data, textStatus, jqXHR) {
      $("#otpModal").modal("show");
      $("#hidden-number").html(hiddenNumber)
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("SOMETHING WENT WRONG");
    },
  });
}

$("#validate").click(function(){
    const inputs = document.querySelectorAll("#otp > *[id]");
    for(let i = 0; i < inputs.length; i++){
        console.log(inputs[i].value);
    }
})

function getPincodeValue(value) {
  $.ajax({
    type: "POST",
    url: "/api/cibil-report/get-pincode-data",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: {
      pincode: value,
    },
    success: function (data, textStatus, jqXHR) {
      $("#form_city").val(data.payload.district);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("SOMETHING WENT WRONG");
    },
  });
}
$("#form_work").change(function (e) {
  let htmlString = "";

  if (e.target.value === "Salaried") {
    $("#salaried").remove();
    $("#self-employed").remove();
    $("#professional").remove();
    htmlString = `<div class="col-6" id="salaried">
        <div class="fv-row mb-8">
            <input type="text" id="form_salary" placeholder="Monthly Basic Salary *"  name="salary" autocomplete="off" class="form-control bg-transparent">
        </div></div>`;
    $(htmlString).insertAfter("#comapany-field");
  } else if (e.target.value === "Self Employed") {
    $("#salaried").remove();
    $("#self-employed").remove();
    $("#professional").remove();
    htmlString = `<div class="col-6" id="professional">
        <div class="fv-row mb-8">
            <input type="text" id="form_income" placeholder="Net annual income *"  name="income" autocomplete="off" class="form-control bg-transparent">
        </div></div>`;
    $(htmlString).insertAfter("#comapany-field");
  } else if (e.target.value === "Professional") {
    $("#salaried").remove();
    $("#self-employed").remove();
    $("#professional").remove();
    htmlString = `<div class="col-6" id="professional">
        <div class="fv-row mb-8">
            <input type="text" id="form_income" placeholder="Net annual income *"  name="income" autocomplete="off" class="form-control bg-transparent">
        </div></div>`;
    $(htmlString).insertAfter("#comapany-field");
  }
});

// Submitting Credit Score Form
function submitCibilForm() {
  // Adding Data in User Object
  let name = $("#form_name").val();
  Object.assign(userInfoData, { name: name });
  let email = $("#form_email").val();
  Object.assign(userInfoData, { email: email });
  let gender = $("#form_gender").val();
  Object.assign(userInfoData, { gender: gender });
  let pin = $("#form_pincode").val();
  Object.assign(userInfoData, { pin: pin });
  let phone = $("#form_phone").val();
  Object.assign(userInfoData, { phone: phone });
  let pan = $("#form_pancard").val();
  Object.assign(userInfoData, { pan: pan });
  let dob = $("#form_dob").val();
  Object.assign(userInfoData, { dob: dob });
  let city = $("#form_city").val();
  Object.assign(userInfoData, { city: city });
  let work = $("#form_work").val();
  Object.assign(userInfoData, { work: work });
  let itr = $("#form_itr").val();
  Object.assign(userInfoData, { itr: itr });
  let company = $("#form_company").val();
  Object.assign(userInfoData, { company: company });

  if (work === "Salaried") {
    let income = $("#form_salary").val();
    Object.assign(userInfoData, { income: income * 12 });
  } else if (work === "Self Employed") {
    let income = $("#form_turnover").val();
    Object.assign(userInfoData, { income: income });
  } else if (work === "Professional") {
    let income = $("#form_income").val();
    Object.assign(userInfoData, { income: income });
  }

  $.ajax({
    type: "POST",
    url: "/api/cibil-report/post-cibil-user-data",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: userInfoData,
    success: function (data, textStatus, jqXHR) {
      alert("SUCCESS");
      console.log(data);
      userInfoData = {};
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("ERROR");
      userInfoData = {};
    },
  });
}
// Class definition
var KTSignupGeneral = (function () {
  // Elements
  var form;
  var submitButton;
  var validator;
  var passwordMeter;

  // Handle form
  var handleForm = function (e) {
    // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
    validator = FormValidation.formValidation(form, {
      fields: {
        name: {
          validators: {
            notEmpty: {
              message: "Full Name is required",
            },
          },
        },
        email: {
          validators: {
            regexp: {
              regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "The value is not a valid email address",
            },
            notEmpty: {
              message: "Email address is required",
            },
          },
        },
        gender: {
          validators: {
            notEmpty: {
              message: "Please select gender",
            },
          },
        },
        dob: {
          validators: {
            notEmpty: {
              message: "D.O.B is required",
            },
          },
        },
        phone: {
          validators: {
            notEmpty: {
              message: "Phone Number is required",
            },
          },
        },
        pan: {
          validators: {
            notEmpty: {
              message: "PAN is required",
            },
          },
        },
        pin: {
          validators: {
            notEmpty: {
              message: "Pincode is required",
            },
          },
        },
        city: {
          validators: {
            notEmpty: {
              message: "City is required",
            },
          },
        },
        work: {
          validators: {
            notEmpty: {
              message: "Work is required",
            },
          },
        },
        itr: {
          validators: {
            notEmpty: {
              message: "Do you file ITR?",
            },
          },
        },
        company: {
          validators: {
            notEmpty: {
              message: "Company is required",
            },
          },
        },
        toc: {
          validators: {
            notEmpty: {
              message: "You must accept the terms and conditions",
            },
          },
        },
      },
      plugins: {
        trigger: new FormValidation.plugins.Trigger({
          event: {
            password: false,
          },
        }),
        bootstrap: new FormValidation.plugins.Bootstrap5({
          rowSelector: ".fv-row",
          eleInvalidClass: "", // comment to enable invalid state icons
          eleValidClass: "", // comment to enable valid state icons
        }),
      },
    });

    // Handle form submit
    submitButton.addEventListener("click", function (e) {
      e.preventDefault();

      let workType = $("#form_work").val();
      let incomeValue;
      if (workType === "Salaried") {
        incomeValue = $("#form_salary").val();
      } else if (workType === "Self Employed") {
        incomeValue = $("#form_turnover").val();
      } else if (workType === "Professional") {
        incomeValue = $("#form_income").val();
      }
      validator.validate().then(function (status) {
        if (status == "Valid" && incomeValue.length != 0) {
          // Show loading indication
          submitButton.setAttribute("data-kt-indicator", "on");

          // Disable button to avoid multiple click
          submitButton.disabled = true;

          // Submitting Credit Score Form
          submitCibilForm();
        } else {
          // Show error popup. For more info check the plugin's official documentation: https://sweetalert2.github.io/
          Swal.fire({
            text: "Please fill out all the deatils.",
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Ok, got it!",
            customClass: {
              confirmButton: "btn btn-primary",
            },
          });
        }
      });
    });
  };

  // Password input validation
  var validatePassword = function () {
    return passwordMeter.getScore() === 100;
  };

  // Public functions
  return {
    // Initialization
    init: function () {
      // Elements
      form = document.querySelector("#kt_sign_up_form");
      submitButton = document.querySelector("#kt_sign_up_submit");
      handleForm();
    },
  };
})();

// On document ready
KTUtil.onDOMContentLoaded(function () {
  KTSignupGeneral.init();
});

document.addEventListener("DOMContentLoaded", function (event) {
  function OTPInput() {
    const inputs = document.querySelectorAll("#otp > *[id]");
    
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("keydown", function (event) {
        if (event.key === "Backspace") {
          inputs[i].value = "";
          if (i !== 0) inputs[i - 1].focus();
        } else {
          if (i === inputs.length - 1 && inputs[i].value !== "") {
            return true;
          } else if (event.keyCode > 47 && event.keyCode < 58) {
            inputs[i].value = event.key;
            if (i !== inputs.length - 1) inputs[i + 1].focus();
            event.preventDefault();
          } else if (event.keyCode > 64 && event.keyCode < 91) {
            inputs[i].value = String.fromCharCode(event.keyCode);
            if (i !== inputs.length - 1) inputs[i + 1].focus();
            event.preventDefault();
          }
        }
      });
    }
  }
  OTPInput();
});
