
getTableBody = async function () {
    tableBodyData.innerHTML = ` <tr>
                                    <td colspan="12">
                                        <div
                                            class="d-flex justify-content-center align-items-center">
                                            <div
                                                class="sbl-circ-path"
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                                `;

    const res = await fetch("/applications/all-banks-in-applications-ajax", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            filterObject,
            pageNo,
            sort,
        }),
    });

    const response = await res.json()
    console.log(response)
    const { count, applicationsData } = response.payload
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )
    let tableBodyHTML = ""
    for (i = 0; i < applicationsData.length; i++) {
        tableBodyHTML = tableBodyHTML + `
            <tr style=" font-size:13px;" class="tableRow">
               <td style="text-align:center">${applicationsData[i]["id"]}</td>
                <td style="text-align:center">${applicationsData[i]["bank_name"]}</td>

                ${applicationsData[i]["is_apply_active"] == true ? `<td style="text-align:center"> <input class="form-check-input" id="apply-active-check-${applicationsData[i]["id"]}" type="checkbox" value="${applicationsData[i]["is_apply_active"]}" name="is-apply-active" onchange="updateSmsStatus(${applicationsData[i]['id']})" checked></td>` : `<td style="text-align:center"><input class="form-check-input" id="apply-active-check-${applicationsData[i]["id"]}" type="checkbox" value="${applicationsData[i]["is_apply_active"]}" name="is-apply-active" onchange="updateSmsStatus(${applicationsData[i]['id']})"></td>`}
                
                ${applicationsData[i]["is_sms_active"] == true ? `<td style="text-align:center"><input class="form-check-input" id="sms-active-check-${applicationsData[i]["id"]}" type="checkbox" value="${applicationsData[i]["is_sms_active"]}" name="is-sms-active" onchange="updateSmsStatus(${applicationsData[i]['id']})" checked></td>` : `<td style="text-align:center"><input class="form-check-input" id="sms-active-check-${applicationsData[i]["id"]}" type="checkbox" value="${applicationsData[i]["is_sms_active"]}" name="is-sms-active" onchange="updateSmsStatus(${applicationsData[i]['id']})"></td>`}
                
                <td style="text-align:center">${new Date(applicationsData[i]["created_at"]).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })}</td>
                <td style="text-align:center">${new Date(applicationsData[i]["updated_at"]).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })}</td>
            </tr>
        `;
    }
    tableBodyData.innerHTML = tableBodyHTML
}


let updateSmsStatus = async function (id,) {

    let applyActive = $("#apply-active-check-" + id).is(":checked");
    let smsActive = $("#sms-active-check-" + id).is(":checked");
    console.log(applyActive, smsActive);
    $("#loader1").show();
    await $.ajax({
        url: "/applications/update-apply-status",
        type: "POST",
        data: {
            id: id,
            applyActive: applyActive,
            smsActive: smsActive
        }
    }).done(function (response) {
        $("#loader1").hide();
        console.log(response);
    });

}





$(document).ready(function () {

    $("#loader1").hide();
    $('#loader1').bind('ajaxStart', function () {
        $(this).show();
    }).bind('ajaxStop', function () {
        $(this).hide();
    });
    entriesPerPageElement.value = 10;
    filterObject.entriesPerPage =
        entriesPerPageElement.value;
    getTableBody()

});