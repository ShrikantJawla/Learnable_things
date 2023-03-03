let formFilledInfo;
let creditCardInfo;
let axisBankData;
let auBankData;
let bobBankData;
let idfcBankData;
let yesBankData;

// // Ajax Calls For All Fields
// $.ajax({
//   url: "/admin/factory/get-user",
//   type: "GET",
//   dataType: "json",
//   success: function (res) {
//     if(res.ua_role === 3){
//       $("#daily_punch_in").removeClass("d-none")
//     }
//     if(res.punchInStatus === true){
//       $("#punch_in_button").prop("checked" , true);
//     }
//     $("#dashboard-user").html(res.ua_name);
//     if (res.ua_role === 1) {
//       getAdminFormData(1);
//       getAdminCardData(1);
//     } else if (res.ua_role === 3) {
//       $("#admin-data").addClass("d-none");
//     }
//   },
// });


// $.ajax({
//   url: "/admin/dashboard/get-bank-data",
//   type: "POST",
//   data: {
//     issuer_id: 1,
//   },
//   dataType: "json",
//   success: function (res) {
//     axisBankData = res;
//     setAllBankData(axisBankData, "Axis Bank Application Status");
//   },
// });
// $.ajax({
//   url: "/admin/dashboard/get-bank-data",
//   type: "POST",
//   data: {
//     issuer_id: 2,
//   },
//   dataType: "json",
//   success: function (res) {
//     bobBankData = res;
//     setAllBankData(bobBankData, "BOB Bank Application Status");
//   },
// });
// $.ajax({
//   url: "/admin/dashboard/get-bank-data",
//   type: "POST",
//   data: {
//     issuer_id: 7,
//   },
//   dataType: "json",
//   success: function (res) {
//     auBankData = res;
//     setAllBankData(auBankData, "AU Bank Application Status");
//   },
// });
// $.ajax({
//   url: "/admin/dashboard/get-bank-data",
//   type: "POST",
//   data: {
//     issuer_id: 4,
//   },
//   dataType: "json",
//   success: function (res) {
//     idfcBankData = res;
//     setAllBankData(idfcBankData, "IDFC Bank Application Status");
//   },
// });
// $.ajax({
//   url: "/admin/dashboard/get-bank-data",
//   type: "POST",
//   data: {
//     issuer_id: 11,
//   },
//   dataType: "json",
//   success: function (res) {
//     yesBankData = res;
//     setAllBankData(yesBankData, "Yes Bank Application Status");
//   },
// });

// function getAdminFormData(period) {
//   $.ajax({
//     url: "/admin/dashboard/form-filled-info",
//     type: "POST",
//     data: {
//       period: period,
//     },
//     dataType: "json",
//     success: function (res) {
//       formFilledInfo = res;
//       setAdminFormData();
//     },
//   });
// }
// function getAdminCardData(period) {
//   $.ajax({
//     url: "/admin/dashboard/credit-card-info",
//     type: "POST",
//     data: {
//       period: period,
//     },
//     dataType: "json",
//     success: function (res) {
//       creditCardInfo = res;
//       setAdminCardData();
//     },
//   });
// }
// function setAdminFormData() {
//   $("#axis-forms-filled").html(formFilledInfo.axis);
//   $("#yes-forms-filled").html(formFilledInfo.yesBank);
//   $("#idfc-forms-filled").html(formFilledInfo.idfc);
//   $("#au-forms-filled").html(formFilledInfo.au);
//   $("#bob-forms-filled").html(formFilledInfo.bob);
//   $("#total-forms-filled").html(formFilledInfo.allCount);
// }
// function setAdminCardData() {
//   $("#axis-credit-cards").html(creditCardInfo.axisApplied);
//   $("#yes-credit-cards").html(creditCardInfo.yesBankApplied);
//   $("#idfc-credit-cards").html(creditCardInfo.idfcApplied);
//   $("#au-credit-cards").html(creditCardInfo.auApplied);
//   $("#bob-credit-cards").html(creditCardInfo.bobApplied);
//   $("#total-credit-cards").html(creditCardInfo.allCountApplied);
// }
// function setAllBankData(data, name) {
//   let bankDataList = "";
//   for (const [key, value] of Object.entries(data)) {
//     bankDataList += `
//     <li class="widget-list-item widget-list-item-green">
//     <span class="widget-list-item-description dashboard-stats">
//       <a href="#" class="widget-list-item-description-title ">
//         ${key}
//       </a>
//       <span class="widget-list-item-description-subtitle">
//         ${value}
//       </span>
//     </span>
//   </li>`;
//   }
//   let htmlString = `<div class="col-xl-6">
//         <div class="card widget widget-list bankDataCard">
//           <div class="card-header d-flex">
//             <span class="material-icons-outlined text-info">
//               account_balance
//             </span>
//             <h5 class="card-title text-info dashboard-title">${name}</h5>
//             <span class="filter-button-wrapper">
//               <span class="badge rounded-pill badge-success badge-style-light">All</span>
//               <span class="badge rounded-pill badge-light badge-style-light">Month</span>
//               <span class="badge rounded-pill badge-light badge-style-light">Today</span>
//             </span>
//           </div>
//           <div class="card-body">
//             <ul class="widget-list-content list-unstyled bank-data-list">
//               ${bankDataList}
//             </ul>
//           </div>
//         </div>
//       </div>`;

//   $(".bank-data").append(htmlString);
// }

// $("#punch_in_button").change(function(){
//   let ua_tele_punch;

//   if($(this).is(":checked")){
//     ua_tele_punch = true;
//   }else{
//     ua_tele_punch = false;
//   }

//   $.ajax({
//     url: "/admin/factory/daily-punch-in",
//     type: "POST",
//     dataType: "json",
//     data : {
//       status : ua_tele_punch
//     },
//     success: function (res) {
//       console.log("ok")
//     },
//     error : function(err){
//       console.log(err)
//     }
//   });
// })




// async function getTeleStatsData(){
//   let teleSelectValue = $('#tele-info-callers').find(":selected").val();

//   $.ajax({

//     url: "/admin/dashboard/get-tele-stats",
//     type: "POST",
//     dataType: 'json',
//     data: {
//       caller: teleSelectValue
//     },
//     success: function(result){
//       console.log(result, "---- okokokok");
//     },
//     error: function(error){
//       console.log(error, " ------ error")
//     }

//   });

// }


// $(document).ready(() => {

//  // getTeleStatsData();
// 	// $("#loader").hide()
// 	// $('#loader').bind('ajaxStart', function () {
// 	// 	$(this).show()
// 	// }).bind('ajaxStop', function () {
// 	// 	$(this).hide()
// 	// })
// })

