let GET_APPLICATIONS = {};
let ALLICATIONS_DATA = [];
let REQ_DATA = {};
let newTotalCount;
let prevPage = document.querySelector("#prevPage");
let nextPage = document.querySelector("#nextPage");
let pageNoElement = document.querySelector("#page-no");
let limit = document.querySelector("#entriesPerPage");
let pageNo = pageNoElement.value;
let pages = $("#pages");
let pageLimit = "200";
let issuerName= window.location.href.split("/")[window.location.href.split("/").length - 2];

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

$("#created_at").change(function (e) {
    $('#updated_at').attr('placeholder', e.target.value);
})
$("#date_of_birth").change(function (e) {
    $('#date_of_birth').attr('placeholder', e.target.value);
})



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
    $('#device_type').select2();
    $("#form_filled_array").select2();
    $("#banks_applied_array").select2();
    $("#banks_approved_array").select2();
    $("#cold_calling_bank_assigned_array").select2();
    $("#sms_status").select2();
    $("#occupation").select2();
    $("#state").select2();
    $("#assign").click(function (e) {
        $("#assignModalNew").modal("show");
    })
    $("#remove").click(function (e) {
        $("#removeModalNew").modal("show");
    })
    $("#assignLaterBtn").click(function () {
        $("#assignModalNew").modal("hide");
    })
    $("#assign-btn-close").click(function () {
        $("#assignModalNew").modal("hide");
    })

    $("#removeLaterBtn").click(function () {
        $("#removeModalNew").modal("hide");
    })

    $("#assign-submit").click(function () {
        $("#loader").show();
        let sendData = {
            main_id: []
        };
        sendData.issuer = $("#addIssuerSelect").val();
        sendData.assign_to = $("#addTelecallerSelect").val();
        $("#data-to-show").children("tr").children("td:nth-child(2)").children("input").each(function () {
            if ($(this).is(":checked")) {
                sendData.main_id.push(this.id)
            }
        })
        $.ajax({
            url: "/applications/insert-new-cc",
            type: "POST",
            data: sendData,
            success: function (result) {
                $("#loader").hide();
                $("#assignModalNew").modal("hide");
                GET_APPLICATIONS.getData();
            }
        })
    })
    $("#remove-submit").click(function () {
        $("#loader").show();
        let sendData = {
            cc_id : []
        };
        $("#data-to-show").children("tr").children("td:nth-child(2)").children("input").each(function () {
            if ($(this).is(":checked")) {
                console.log(this)
                sendData.cc_id.push(this.id)
            }
        })
        console.log(sendData)
        $.ajax({
            url: "/applications/remove-new-cc",
            type: "POST",
            data: sendData,
            success: function (result) {
                $("#loader").hide();
                $("#removeModalNew").modal("hide");
                GET_APPLICATIONS.getData();
            }
        })
    })

    $("#assign_all").click(function () {
        $("#assign").prop("disabled", false);
        $("#remove").prop("disabled", false);
        if ($(this).is(":checked")) {
            $("#data-to-show").children("tr").children("td:nth-child(2)").children("input").each(function () {
                $(this).prop('checked', true);
            })
        } else {
            $("#data-to-show").children("tr").children("td:nth-child(2)").children("input").each(function () {
                $(this).prop('checked', false);
            })
        }

    })
});

GET_APPLICATIONS.getData = function (filterObject) {
    $("#loader").show();
    REQ_DATA.limit = pageLimit;
    REQ_DATA.pageNo = pageNo;
    REQ_DATA.issuerName = issuerName;
    if (filterObject) {
        Object.assign(REQ_DATA, filterObject)
    }
    console.log(filterObject)

    $.ajax({
        url: "/applications/get-all-applications-ajax-new",
        type: "POST",
        data: REQ_DATA,
        success: function (result) {
            $("#loader").hide();
            $('#data-to-show').html(result);
            newTotalCount = $("#newTotalCount").val();
            $("#entries").html(`(${newTotalCount})`)
            $("#pages").html(` / ${Math.ceil(newTotalCount / pageLimit)}`)
        }
    })
}

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

$(".revised").click(function(e){
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
        let newValue = {
            [e.target.id]: e.target.value
        }
        if (e.target.id === "created_at" || e.target.id === "updated_at" || e.target.id === "date_of_birth") {
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
        console.log(e.target.id)
        if (e.target.id === "form_filled_array" || e.target.id === "banks_applied_array" || e.target.id === "banks_approved_array" || e.target.id === "low_cibil_score" || e.target.id === "cold_calling_bank_assigned_array" || e.target.id === "sms_status" || e.target.id === "occupation" || e.target.id === "state") {
            Object.assign(filterObject.select, newValue)
        } else {
            Object.assign(filterObject.filter, newValue)
        }

        GET_APPLICATIONS.getData(filterObject);
        
    })
})

// Initializing Date Pickers

flatpickr('#created_at', {
    mode: "range",
    dateFormat: "Y/m/d",
});

flatpickr('#updated_at', {
    mode: "range",
    dateFormat: "Y/m/d",
});

flatpickr('#date_of_birth', {
    mode: "range",
    dateFormat: "Y/m/d",
});

$("#filterReset").click(function () {
    window.location.reload();
})

function assignValue(element) {
    $("#assign").prop("disabled", false);
    $("#remove").prop("disabled", false);
}

$("#addIssuerSelect").change(function (e) {
    $("#loader").show();
    $("#addTelecallerSelect").prop("disabled", false)
    let issuerSelectValue = $("#addIssuerSelect").val();
    issuerSelectValue = issuerSelectValue.substr(0, issuerSelectValue.indexOf('_')); 
    console.log(issuerSelectValue)
    $.ajax({
        url: `/users/get-telecallersInAssignment-ajax?issuer=${issuerSelectValue}`,
        type: "GET",
        success: function (result) {
            $("#loader").hide();
            renderTelecaller(result);
            console.log(result)
        }
    })

    function renderTelecaller(data){
        let htmlString;
        htmlString += `<option selected disabled value="">Select Issuer</option>`;
        for(let i = 0; i < data.payload.length ; i++){
            htmlString += `<option value="${data.payload[i].ua_id}">${data.payload[i].ua_name}</option>`;
        }
        $("#addTelecallerSelect").html(htmlString);

    }
})
$("#removeIssuerSelect").change(function (e) {
    $("#removeTelecallerSelect").prop("disabled", false)
})

$("#addTelecallerSelect").change(function (e) {
    $("#assign-submit").prop("disabled", false)
})
$("#removeTelecallerSelect").change(function (e) {
    $("#remove-submit").prop("disabled", false)
})

