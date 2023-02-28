let showFields = [
    'citi_id',
    'citi_permit_to_telly',
    'citi_application_id',
    'citi_date',
    'citi_application_status',
    'citi_tracking_id',
    'ca_main_table',
    'updated_at',
    'created_at',
    'citi_utm_source',
    'citi_batch_no',
    'citi_reject_reason'
]
const selectFieldsArray = ['citi_application_status', 'citi_utm_source']
let selectFieldsObject = {
    'citi_application_status': [],
    'citi_utm_source': [],

}

function filterResetFunction() {
    const arr = ['citi_id',
        'citi_application_id', 'from_citi_date', 'to_citi_date', 'citi_application_status', 'citi_tracking_id', 'ca_main_table', 'citi_utm_source', 'citi_batch_no', 'citi_reject_reason', 'from_created_at', 'to_created_at', 'from_updated_at', 'to_updated_at', 'ca_main_table',
        'select-telecaller-filter-all',

    ]
    arr.map(field => {
        if ($(`#${field}`).length > 0) {
            document.getElementById(field).value = ''
        }
    })
    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
    getTableBody()
}
filterReset.addEventListener('click', filterResetFunction)

async function getSelectFields() {

    selectFieldsArray.forEach(elem => {
        $.ajax({
            url: `/factory/distinctValues?table=citi_applications_table&column=${elem}`,
            type: "GET",
            contentType: "application/json",
            dataType: 'json',
            success: function (result) {
                const { payload } = result
                selectFieldsObject[elem] = payload
            }
        })
    }
    )

}

let getTableBody = async () => {
    tableBodyData.innerHTML = ` <tr>
                                    <td colspan="10">
                                        <div
                                            class="d-flex justify-content-center align-items-center">
                                            <div
                                                class="sbl-circ-path"
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                                `
    // 
    $.ajax({
        url: "/citi/get-all-applications-ajax",
        method: "POST",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({
            filterObject,
            pageNo,
            sort,
        }),
        success: function (result) {
            const { count } = result.payload
            applicationsData = result.payload.applicationsData
            entries.innerHTML = `(${count} entries)`
            pages.innerHTML = `/ ${Math.ceil(
                count / filterObject.entriesPerPage
            )}`
            pageNoElement.setAttribute(
                "max",
                Math.ceil(count / filterObject.entriesPerPage)
            )

            addTableBody(allFieldsArray, applicationsData)
        }

    })
}
$(document).ready(async function () {
    $('.hide-sidebar-toggle-button').click()
    iconBoundingRect = openFieldsDropdownIcon.getBoundingClientRect()
    tableWrapperBoundingRect = tableWrapper.getBoundingClientRect()
    entriesPerPageElement.value = 10
    filterObject.entriesPerPage =
        entriesPerPageElement.value
    styleDropdown()
    getAllFields('/factory/fields', 'citi_applications_table').then(async () => {
        fillUpDropdown(allFieldsArray)
        await getTeleCallers()
        addColumnsToTableHeader(allFieldsArray)
        Promise.all(getSelectFields('citi_applications_table')).then(async () => {
            addFilters(allFieldsArray)
            await getTableBody()
            $('#loader').hide()
            $("select[multiple='multiple']").select2({
                placeholder: "Select options"
            })
        })
    })



})