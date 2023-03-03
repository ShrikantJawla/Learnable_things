"use strict";

let dataInput;
let hiddenNumber;
let otp;
let userData;
let userToken;
let timeleft = 60;
let numberChange;
let backPressed;
let phoneValidation91 = /^((\+91?)|\+)?[7-9][0-9]{9}$/;
let phoneValidation = /^\d{10}$/;
let mailValidation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let dataType;
let phoneValid = false;
let emailValid = false;

// Class definition
var KTSigninGeneral = (function () {
  // Elements
  var form;
  var submitButton = document.getElementById('kt_account_profile_details_form');
  var validator;

  // Handle form
  var handleForm = function (e) {
    validator = FormValidation.formValidation(form, {
      fields: {
        name: {
            validators: {
              notEmpty: {
                message: "Please enter your name",
              },
            },
          },
        phone: {
          validators: {
            notEmpty: {
              message: "Please enter a valid phone number",
            },
          },
        },
        email: {
            validators: {
              regexp: {
                regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                message: "The value is not a valid email address",
              },
              notEmpty: {
                message: "Please enter a valid email",
              },
            },
          }
      },
      plugins: {
        trigger: new FormValidation.plugins.Trigger(),
        bootstrap: new FormValidation.plugins.Bootstrap5({
          rowSelector: ".fv-row",
          eleInvalidClass: "", // comment to enable invalid state icons
          eleValidClass: "", // comment to enable valid state icons
        }),
      },
    });

    // Handle form submit
    submitButton.addEventListener("click", function (e) {
      // Prevent button default action
      e.preventDefault();
      // Validate form
      validator.validate().then(function (status) {
        if (status == "Valid") {
          let user = $("#name").val();
          let phone = $("#phone").val();
          let email = $("#email").val();

          if(phone.match(phoneValidation91)) {
            phone.replace("+91", "");
            phoneValid = true;
          }
          else if (phone.match(phoneValidation)) {
            phoneValid = true;
          }
          if (email.match(mailValidation)) {
            emailValid = true;
          }
          console.log(phoneValid, emailValid)
          //Sending Post Request to Get OTP
          if (phoneValid === true && emailValid === true) {
            $.ajax({
              type: "POST",
              url: "/auth/complete-profile",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              data: {
                name : user,
                phone : phone,
                email : email
              },
              success: function (data, textStatus, jqXHR) {
                if (data.status === true) {
                  console.log("profile saved");
                  window.location.href = "/";
                }
              },
              error: function (jqXHR, textStatus, errorThrown) {
                Swal.fire({
                  text: jqXHR.responseJSON.message,
                  icon: "error",
                  buttonsStyling: false,
                  confirmButtonText: "Ok, got it!",
                  customClass: {
                    confirmButton: "btn btn-primary",
                  },
                });
                console.log("something went wrong")
              },
            });
          } 

        } else {
          
          Swal.fire({
            text: "Please provide all required details",
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Ok, got it!",
            customClass: {
              confirmButton: "btn btn-primary",
            },
          });
        }
      });
      // $.ajax({
      //   type: "POST",
      //   url: "/auth/complete-profile",
      //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
      //   data: {
      //     name : user,
      //     phone : phone,
      //     email : email
      //   },
      //   success: function (data, textStatus, jqXHR) {
      //     if (data.status === true) {
      //       console.log("profile saved");
      //       window.location.href = "/";
      //     }
      //   },
      //   error: function (jqXHR, textStatus, errorThrown) {
      //     Swal.fire({
      //       text: jqXHR.responseJSON.message,
      //       icon: "error",
      //       buttonsStyling: false,
      //       confirmButtonText: "Ok, got it!",
      //       customClass: {
      //         confirmButton: "btn btn-primary",
      //       },
      //     });
      //     console.log("something went wrong")
      //   },
      // });
    });
  };
  return {
    // Initialization
    init: function () {
      form = document.querySelector("#kt_account_profile_details_form");
      submitButton = document.querySelector("#kt_account_profile_details_submit");

      handleForm();
    },
  };
})();

// On document ready
KTUtil.onDOMContentLoaded(function () {
  KTSigninGeneral.init();
});
