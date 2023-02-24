

let SELECT_OPTIONS = {}
let clickedId

filterReset.addEventListener("click", () => {
    document.getElementById("id").value = ""
    //    id,CreditCardName,applyNow,Highlights,updated_by,card-issuer-options,published_at
    document.getElementById("CreditCardName").value = ""
    document.getElementById("applyNow").value = "0"
    document.getElementById("Highlights").value = ""
    document.getElementById("updated_by").value = ""
    document.getElementById("card-issuer-options").value = "any"
    document.getElementById("published_at").value = "any"

    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value
    getTableBody()
})





SELECT_OPTIONS.cardIssuersInSelect = function (result) {
    let selectTag = document.getElementById("card-issuer-options")
    let appendData = `<option  value="any">Select Card Issuer</option>`
    for (let i = 0; i < result.payload.length; i++) {
        ////console.log(i);
        appendData =
            appendData +
            `<option value = "${result.payload[i].IssuerName}" > ${result.payload[i].IssuerName} </option> `
    }
    selectTag.innerHTML = appendData
}




SELECT_OPTIONS.getCardIssuersName = function () {
    $.ajax({
        url: "/cardissuersforrelation",
        type: "GET",
        contentType: "application/jsonrequest",

        success: function (result) {
            SELECT_OPTIONS.cardIssuersInSelect(result)
        },
    })
}









document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction('/delete/creditCard', clickedId)
})



let getTableBody = async () => {
    const tableBodyData = document.querySelector("#data-to-show")
    tableBodyData.innerHTML = `<tr>
                                            <td colspan="10">
                                                <div
                                                    class="d-flex justify-content-center align-items-center"
                                                >
                                                    <div
                                                        class="sbl-circ-path"
                                                    ></div>
                                                </div>
                                            </td>
                                        </tr>`
    const res = await fetch("/get-filtered-credit-cards", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
            filterObject,
            pageNo,
            sort,
        }),
    })
    const { payload } = await res.json();
    const { creditCardsList, count } = payload;
    entries.innerHTML = `(${count} entries)`;
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`;
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    );
   
    

    let tableBodyHTML = ""
    for (i = 0; i < creditCardsList.length; i++) {
        const date = creditCardsList[i]['updated_at'] ? new Date(creditCardsList[i]['updated_at']) : null
        /*<td style="width:150px">${date.getFullYear().toString().padStart(4, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}</td> */
        tableBodyHTML = tableBodyHTML + `
            <tr style=" font-size:13px;"  class="tableRow"  onclick="rowClick(event,${creditCardsList[i]['id']},'edit-creditCard')">
                <td >${creditCardsList[i]["id"]}</td>
                <td style="text-align:center">${creditCardsList[i]["CreditCardName"]}</td>
                <td style="min-width:200px; max-width:250px important;  text-align:left !important "><pre style="font-size:13px !important ">${creditCardsList[i]["Highlights"]}</pre></td>
                
                <td style="text-align:center !important ">${creditCardsList[i]["updated_by_admin_name"]}</td>
                <td style="text-align:center !important ">${creditCardsList[i]["IssuerName"]}</td>
                
                <td style="max-width:110px; text-align:center !important ">${creditCardsList[i]["applyNow"] ? "true" : "false"}</td>
                <td style="width:150px; text-align:center !important ">${creditCardsList[i]["published_at"] ? 'Published' : 'Draft'}</td>
                <td style="width:150px; text-align:center !important ">${creditCardsList[i]["creditreportshowcard"] ? 'true' : 'false'}</td>
                
                <td style="text-align:center !important ">${date.getFullYear().toString().padStart(4, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}<br> ${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}</td>
                <td>
                    <div style="display:flex;flex-direction:horizontal;gap:5px;">
                        <button class='publishBtnTable'  onclick="duplicate(${creditCardsList[i]["id"]},'creditCard')"
                        ><i class="material-icons has-sub-menu action-btns">content_copy</i>
                        </button>
                        <a href='/edit-creditCard?id=${creditCardsList[i]["id"]}' target='_blank'
                        ><i class="material-icons has-sub-menu action-btns">edit</i>
                        </a>
                        <button class='deleteBtnTable' data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="clickedId=${creditCardsList[i]["id"]}"
                        ><i class="material-icons has-sub-menu action-btns">delete</i></button>
                    </div>
                </td>
            </tr>
        `
    }
    tableBodyData.innerHTML = tableBodyHTML
}



$(document).ready(function () {
    $('#hide-sidebar-toggle-button').click()
    entriesPerPageElement.value = "10"
    filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
    SELECT_OPTIONS.getCardIssuersName()
    getTableBody()
})