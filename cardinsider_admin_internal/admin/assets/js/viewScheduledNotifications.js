let GET_APPLICATIONS = {};
let ALLICATIONS_DATA = [];
let processData = [];
let REQ_DATA = {};
let newTotalCount;
let prevPage = document.querySelector("#prevPage");
let nextPage = document.querySelector("#nextPage");
let pageNoElement = document.querySelector("#page-no");
let limit = document.querySelector("#entriesPerPage");
let pageNo = pageNoElement.value;
let pages = $("#pages");
let pageLimit = "200";
let selectAll = false;
let newClaimedPayment = false;

let filterObject = {
    sort_asec: "",
    sort_desc: "",
    null: [],
    notNull: [],
    revised: [],
    filter: {

    },
    select: {

    },
    date: {

    },
};

limit.addEventListener("change", (e) => {
    pageLimit = e.target.value;
    GET_APPLICATIONS.getData();
})

$("#page-no").change((e) => {
    pageNo = e.target.value;
    GET_APPLICATIONS.getData();
})

$("#created_at").change(function (e) {
    $('#created_at').attr('placeholder', e.target.value);
})

// $("#created_at").change(function (e) {
//     $('#updated_at').attr('placeholder', e.target.value);
// })
// $("#date_of_birth").change(function (e) {
//     $('#date_of_birth').attr('placeholder', e.target.value);
// })



prevPage.addEventListener("click", () => {
    pageNoElement.value =
        pageNoElement.value * 1 > 1 ? pageNoElement.value * 1 - 1 : 1;
    pageNo = pageNoElement.value;
    GET_APPLICATIONS.getData();
});

nextPage.addEventListener("click", () => {
    pageNoElement.value =
        pageNoElement.value * 1 < pageNoElement.getAttribute("max") * 1
            ? pageNoElement.value * 1 + 1
            : pageNoElement.getAttribute("max") * 1;
    pageNo = pageNoElement.value;
    GET_APPLICATIONS.getData();
});



$(document).ready(function () {
    GET_APPLICATIONS.getData();
});

GET_APPLICATIONS.getData = function (filterObject) {
    $("#loader").show();
    REQ_DATA.limit = pageLimit;
    REQ_DATA.pageNo = pageNo;
    // REQ_DATA.newClaimedPayment = newClaimedPayment;
    if (filterObject) {
        Object.assign(REQ_DATA, filterObject)
    }

    $.ajax({
        url: "/view-scheduled-notifications-data",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(REQ_DATA),
        success: function (result) {
			console.log(result);
            $("#loader").hide();
            $('#data-to-show').html(result);
            newTotalCount = $("#newTotalCount").val();
            $("#entries").html(`(${newTotalCount})`)
            $("#pages").html(` / ${Math.ceil(newTotalCount / pageLimit)}`);
        }
    })
}

// $("#newClaimedSlider").change(function(){
//     newClaimedPayment = $(this).is(":checked")
//     GET_APPLICATIONS.getData();
// })
// Event Listener for sort filter
$('#table-header').children('th').children(":first-child").children(":first-child").each(function () {

    $(this).click(function (e) {
        if (filterObject.sort_desc.includes(e.target.dataset.filter)) {
            filterObject.sort_desc = "";
            filterObject.sort_asec = "";
        } else {
            if (filterObject.sort_desc != e.target.dataset.filter) {
                filterObject.sort_desc = "";
            }
            if (filterObject.sort_asec.includes(e.target.dataset.filter)) {
                if (filterObject.sort_asec.length > 0) {
                    filterObject.sort_asec = "";
                }
                filterObject.sort_desc = e.target.dataset.filter;
            } else {
                filterObject.sort_asec = e.target.dataset.filter;
            }
        }
        GET_APPLICATIONS.getData(filterObject);
    })
});

// Event listener for null filter
$('#table-header').children('th').children(":nth-child(2)").each(function () {
    $(this).click(function (e) {
        $(e.target).toggleClass("active");
        let filterValue = e.target.dataset.filter;

        // Removing Null When Adding Not Null
        if (e.target.dataset.filter.includes("-")) {
            let index = filterObject.notNull.indexOf(filterValue.slice(1));
            if (index > -1) {
                filterObject.notNull.splice(index, 1);
            }

            $(`.${filterValue.slice(1)}`).removeClass("active");
        } else if (e.target.dataset.filter.includes("-") === false) {
            let index = filterObject.notNull.indexOf(`-${filterValue}`);
            if (index > -1) {
                filterObject.notNull.splice(index, 1);
            }
            $(`.-${filterValue}`).removeClass("active");
        }

        let nullFilter = e.target.dataset.filter.replace("-", "");

        // Removing duplicate filter from array
        if (filterObject.notNull.includes(nullFilter)) {
            const index = filterObject.notNull.indexOf(nullFilter);
            if (index > -1) {
                filterObject.notNull.splice(index, 1);
            }
        }
        // Adding filter in array
        if (filterObject.null.includes(nullFilter)) {
            const index = filterObject.null.indexOf(nullFilter);
            if (index > -1) {
                filterObject.null.splice(index, 1);
            }
        } else {
            filterObject.null.push(nullFilter);
        }
        GET_APPLICATIONS.getData(filterObject);
    })
});

$(".revised").click(function (e) {
    let filter = e.target.dataset.filter;
    if (filterObject.revised.includes(filter)) {
        const index = filterObject.revised.indexOf(filter);
        if (index > -1) {
            filterObject.revised.splice(index, 1);
        }
        $(this).removeClass("active")
        GET_APPLICATIONS.getData(filterObject);
    } else {
        filterObject.revised.push(filter);
        $(this).addClass("active")
        GET_APPLICATIONS.getData(filterObject);
    }
})

// Event Listener for not null filter
$('#table-header').children('th').children(":nth-child(3)").each(function () {
    $(this).click(function (e) {
        $(e.target).toggleClass("active");
        let filterValue = e.target.dataset.filter;

        // Removing Null When Adding Not Null
        if (e.target.dataset.filter.includes("-")) {
            let index = filterObject.notNull.indexOf(filterValue.slice(1));
            if (index > -1) {
                filterObject.notNull.splice(index, 1);
            }

            $(`.${filterValue.slice(1)}`).removeClass("active");
        } else if (e.target.dataset.filter.includes("-") === false) {
            let index = filterObject.notNull.indexOf(`-${filterValue}`);
            if (index > -1) {
                filterObject.notNull.splice(index, 1);
            }
            $(`.-${filterValue}`).removeClass("active");
        }

        let notNullFilter = e.target.dataset.filter.replace("-", "");

        // Removing duplicate filter from array
        if (filterObject.null.includes(notNullFilter)) {
            const index = filterObject.null.indexOf(notNullFilter);
            if (index > -1) {
                filterObject.null.splice(index, 1);
            }
        }
        // Adding filter in array
        if (filterObject.notNull.includes(notNullFilter)) {
            const index = filterObject.notNull.indexOf(notNullFilter);
            if (index > -1) {
                filterObject.notNull.splice(index, 1);
            }
        } else {
            filterObject.notNull.push(notNullFilter);
        }
        GET_APPLICATIONS.getData(filterObject);
    })
});

// Event Listener on input fields
$("#table-filter-row").children("th").children("input").each(function () {

    $(this).change(function (e) {
        if (e.target.id === "select_all") {
            return
        }
        let newValue = {
            [e.target.id]: e.target.value
        }
        if (e.target.id === "created_at") {
            Object.assign(filterObject.date, newValue)
        } else {

            Object.assign(filterObject.filter, newValue)
        }

        GET_APPLICATIONS.getData(filterObject);
    })

})

$("#table-filter-row").children("th").children("select").each(function () {
    $(this).change(function (e) {

        let newValue = {
            [e.target.id]: $(e.target).val()
        }
        // if (e.target.id === "form_filled_array" || e.target.id === "banks_applied_array" || e.target.id === "banks_approved_array" || e.target.id === "low_cibil_score" || e.target.id === "cold_calling_bank_assigned_array") {
        //     Object.assign(filterObject.select, newValue)
        // } else {
            Object.assign(filterObject.filter, newValue)
        // }

        GET_APPLICATIONS.getData(filterObject);
    })
})


// // Function to add eventlistener
// $("#process_button").click(function(){
//     $("#loader").show();
//     processData = [];
//     $("#data-to-show").children("tr").children("td:nth-child(1)").children("input").each(function () {
//         if($(this).is(":checked")){
//             processData.push($(this).attr("id"))
//         }
//     })
    
//     if(processData.length > 0){
//         $.ajax({
//             url: "/insert-transaction",
//             type: "POST",
//             data: {
//                 id: JSON.stringify(processData)
//             },
//             success: function (result) {
//                 $("#loader").hide();
//                 $("#process_data_modal").modal("show");
//                 let htmlString = ``;
//                 for(let i = 0 ; i < result.payload.length ; i++){
//                     htmlString += `<tr>
//                     <td>${i+1}</td>
//                     <td>${result.payload[i].id}</td>
//                     <td>${result.payload[i].data.allDone}</td>
//                     <td colspan="2">${result.payload[i].data.message}</td>
//                   </tr>`
//                 }
//                 $("#response-table-body").html(htmlString)
//                 GET_APPLICATIONS.getData();
//                 processData = [];
//             },
//             error : function(err){
//                 alert("Something went wrong")
//                 console.log(err);
//                 processData = [];
//             }
//         })
//     }else{
//         alert("Please select applications")
//     }
    
// })



// $("#select_all").click(function(){
//     $("#data-to-show").children("tr").children("td:nth-child(1)").children("input").each(function () {
//         if($(this).is(":checked")){
//             $($(this)).prop("checked", false);
//         }else{
//             $($(this)).prop("checked", true);
//         }
//     })
// })

// Initializing Date Pickers

flatpickr('#created_at', {
    mode: "single",
    dateFormat: "Y/m/d",
});

// flatpickr('#updated_at', {
//     mode: "range",
//     dateFormat: "Y/m/d",
// });

// flatpickr('#date_of_birth', {
//     mode: "range",
//     dateFormat: "Y/m/d",
// });

$("#filterReset").click(function () {
    window.location.reload();
})

// function assignValue(element) {
//     $("#assign").prop("disabled", false);
//     $("#remove").prop("disabled", false);
// }

// $("#addIssuerSelect").change(function (e) {
//     $("#addTelecallerSelect").prop("disabled", false)
// })
// $("#removeIssuerSelect").change(function (e) {
//     $("#removeTelecallerSelect").prop("disabled", false)
// })

// $("#addTelecallerSelect").change(function (e) {
//     $("#assign-submit").prop("disabled", false)
// })
// $("#removeTelecallerSelect").change(function (e) {
//     $("#remove-submit").prop("disabled", false)
// })

// function processRequest(id){
//     processData.push(id)
//     $("#loader").show();
//     $.ajax({
//         url: "/insert-transaction",
//         type: "POST",
//         data: {
//             id: JSON.stringify(processData)
//         },
//         success: function (result) {
//             $("#loader").hide();
//             $("#process_data_modal").modal("show");
//             let htmlString = ``;
//             for(let i = 0 ; i < result.payload.length ; i++){
//                 htmlString += `<tr>
//                 <td>${i+1}</td>
//                 <td>${result.payload[i].id}</td>
//                 <td>${result.payload[i].data.allDone}</td>
//                 <td colspan="2">${result.payload[i].data.message}</td>
//               </tr>`
//             }
//             $("#response-table-body").html(htmlString)
//             GET_APPLICATIONS.getData();
//             processData = [];
//         }
//     })
// }