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
let dataValid = false;

// Class definition
var KTSigninGeneral = (function () {
  // Elements
  var form;
  var submitButton;
  var validator;

  // Handle form
  var handleForm = function (e) {
    validator = FormValidation.formValidation(form, {
      fields: {
        phone: {
          validators: {
            notEmpty: {
              message: "Phone Number or Email is required",
            },
          },
        },
        tac: {
          validators: {
            notEmpty: {
              message: "You must accept the terms and conditions",
            },
          },
        },
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
          submitButton.setAttribute("data-kt-indicator", "on");
          submitButton.disabled = true;
          dataInput = $("#phone-number").val();
          if(dataInput.match(phoneValidation91)) {
            dataInput.replace("+91", "");
            dataType = "mobile";
            dataValid = true;
          }
          else if (dataInput.match(phoneValidation)) {
            dataType = "mobile";
            dataValid = true;
          }else if (dataInput.match(mailValidation)) {
            dataType = "email";
            dataValid = true;
          }

          //Sending Post Request to Get OTP
          if (dataValid === true) {
            $.ajax({
              type: "POST",
              url: "/auth/send-otp",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              data: {
                data: dataInput,
                dataType: dataType,
              },
              success: function (data, textStatus, jqXHR) {
                if (data.status === true) {
                  console.log("otp success");
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
                submitButton.disabled = false;
                submitButton.setAttribute("data-kt-indicator", "pff");
              },
            });
          } else {
            Swal.fire({
              text: "Kindly enter a valid email ID or mobile number.",
              icon: "error",
              buttonsStyling: false,
              confirmButtonText: "Ok, got it!",
              customClass: {
                confirmButton: "btn btn-primary",
              },
            });
            submitButton.disabled = false;
            submitButton.setAttribute("data-kt-indicator", "pff");
            return false
          }

          stepOneOut();
          function stepOneOut() {
            $("#step-1").addClass("animate__backOutRight");
            hiddenNumber = "********" + String(dataInput).slice(-4);
            $("#otp-send-to").html(hiddenNumber);
            window.setTimeout(function () {
              $("#step-2").removeClass("d-none");
              $("#step-2")
                .addClass("animate__backInRight")
                .removeClass("animate__backOutRight");
              $("#step-1").addClass("d-none");
              $("#step-1").removeClass("animate__backOutRight");
            }, 300);

            // Starting Resend OTP Timer
            timeleft = 60;
            var otpTimer = setInterval(function () {
              timeleft--;
              document.getElementById("countdowntimer").textContent = timeleft;
              if (timeleft <= 0) clearInterval(otpTimer);
              if (timeleft === 0) {
                $("#resend-otp-btn").removeClass("disabled-link");
                $("#timer-span").addClass("d-none");
              }
            }, 1000);
          }
        } else {
          // Show error popup. For more info check the plugin's official documentation: https://sweetalert2.github.io/
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
    });
    $("#resend-otp-btn").click(function (e) {
      e.preventDefault();
      // Sending Post Request to Get OTP
      $.ajax({
        type: "POST",
        url: "/api/auth/sign-in-using-phone",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: {
          phone: dataInput,
        },
        success: function (data, textStatus, jqXHR) {
          if (data.status === true) {
            // Starting Resend OTP Timer
            $("#resend-otp-btn").addClass("disabled-link");
            $("#timer-span").removeClass("d-none");

            timeleft = 60;
            var otpTimer = setInterval(function () {
              timeleft--;
              document.getElementById("countdowntimer").textContent = timeleft;
              if (timeleft <= 0) clearInterval(otpTimer);
              if (timeleft === 0) {
                $("#resend-otp-btn").removeClass("disabled-link");
                $("#timer-span").addClass("d-none");
              }
            }, 1000);
          } else {
            alert("Error Sending OTP");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          alert("Error Sending OTP");
        },
      });
    });
    $("#change-number").click(function (e) {
      timeleft = 0;
      numberChange = dataInput;
      backPressed = true;
      submitButton.disabled = false;
      submitButton.setAttribute("data-kt-indicator", "pff");
      window.setTimeout(function () {
        $("#step-1")
          .removeClass("d-none")
          .removeClass("animate__backOutRight")
          .addClass("animate__backInRight");
        $("#step-2").addClass("d-none");
      }, 300);
    });
  };

  // Public functions
  return {
    // Initialization
    init: function () {
      form = document.querySelector("#kt_sign_in_form");
      submitButton = document.querySelector("#kt_sign_in_submit");

      handleForm();
    },
  };
})();

// On document ready
KTUtil.onDOMContentLoaded(function () {
  KTSigninGeneral.init();
});
