// let initialHTML
// tableBodyData.addEventListener('click', (e) => {
//     if (e.target.classList.contains('editIcon')) {
//         const parentRow
//             = e.target.closest('.dynamicTableRow')
//         parentRow.classList.toggle('editing')
//         changeTableRowUi(parentRow)
//     }
// })
// const changeTableRowUi = function (row) {
//     if (row.classList.contains('editing')) {
//         changeTableRowUiToUpdating(row)
//     }
//     else {
//         changeTableRowUiToNotUpdating(row)
//     }
// }
// const changeTableRowUiToUpdating = function (row) {
//     initialHTML = row.innerHTML
//     const idField = Object.keys(applicationsData[0])[0]
//     const rowId = row.id.replace('table-row-', '')
//     const rowData = applicationsData.find(row => row[idField] == rowId)
//     let htmlString = ``
//     htmlString += `<td data-edit-id="${rowData[idField]}" class="editIcon icon-group">
//     <a data-edit-id="${rowData[idField]}" class="editIcon resetAllIcon tableRowIcon"><i class="material-icons has-sub-menu editIcon editing" >close</i>
//     </a>
//     <a data-edit-id="${rowData[idField]}" class="updateIcon tableRowIcon"><i class="material-icons has-sub-menu" >restart_alt</i>
//     </a>
//     <a data-edit-id="${rowData[idField]}" class="updateIcon tableRowIcon"><i class="material-icons has-sub-menu" >publish</i>
//     </a>
//             </td>`
//     allFieldsArray.filter(field => field.show > 0).map(field => {
//         if (field.column_name === idField) {
//             htmlString += `
//             <td><input class="form-control" style="min-width:90px"  disabled value='${rowData[field.column_name]}'></input></td>`
//         }

//         else if (selectFieldsArray.includes(field.column_name)) {
//             htmlString += `
// 						<td>
// 						<select class="form-select"  style="min-width:max-content" id=${field.column_name} name=${field.column_name}>
// 							<option value="">Select ${field.table_name}</option>
// 					`
//             for (i = 0; i < selectFieldsObject[field.column_name].length; i++) {
//                 htmlString += `<option value="${selectFieldsObject[field.column_name][i]}" ${rowData[field.column_name] === selectFieldsObject[field.column_name][i] ? 'selected' : ''}>${selectFieldsObject[field.column_name][i]}</option>`
//             }
//             htmlString += `
// 					</select>
//             		</td>
// 					`
//         }
//         else if (field.data_type === 'boolean') {
//             htmlString = htmlString + `<td  ><label class="switch">
//                                             <input type="checkbox" ${(!rowData[field.column_name]) ? '' : 'checked'}>
//                                             <span class="slider round"></span>
//                                         </label></td>`
//         }
//         else if (field.data_type === 'date') {
//             const date = new Date(rowData[field.column_name])
//             htmlString = htmlString + `<td style="text-align:center"><input class="form-control"  style=" padding-left:2px;padding-right:2px; width:120px;"  type="date" value='${date.getFullYear().toString().padStart(4, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}'></input></td>`
//         }
//         else if (field.column_name === 'created_at' || field.column_name === 'updated_at') {
//             let date = rowData[field.column_name].toString()
//             date = date.split('T').join(' ').slice(0, 16)
//             // htmlString = htmlString + `<td style="text-align:center">${date.getFullYear().toString().padStart(4, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}<br> ${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}</td>`
//             htmlString = htmlString + `<td style="text-align:center;"><input class="form-control"  style=" padding-left:2px;padding-right:2px;" value='${date}' disabled></input></td>`
//         }
//         else {
//             htmlString += `<td style="text-align:center"><textarea class="form-control"  style=" padding-left:2px;padding-right:2px;resize: none; min-height:80px;min-width:max-content; overflow-y:hidden;"  >${rowData[field.column_name] || ''}</textarea></td>`
//         }
//     })
//     row.innerHTML = htmlString


// }
// const changeTableRowUiToNotUpdating = function (row) {
//     row.innerHTML = initialHTML
// }
const updateBtn = document.getElementById('update')
let updateEnable = false
let allFieldsArray, mainTableId, details
let inputObject = {}
let leftForm = document.getElementById('left-form')
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
const readyFunction = async (table) => {
    await getAllFields('/factory/fields', `${table}`)
    Object.keys(fieldData).forEach(key => {
        fieldData[key]['dataType'] = allFieldsArray.find(val => val.column_name === key).data_type
        fieldData[key]['tableName'] = allFieldsArray.find(val => val.column_name === key).table_name
    })
    let htmlString = `<div class="row" style="row-gap:20px">`
    Object.keys(fieldData).sort((a, b) => fieldData[a]['order'] - fieldData[b]['order']).forEach(key => {
        
        const { colSpan, isEditable, dataType, tableName } = fieldData[key]
        //console.log(key, fieldData[key])
        if (selectFieldsArray.includes(key)) {
            htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <select class='form-control' id=${key} name=${key}  ${isEditable ? '' : `disabled`}>
							<option value="">Select ${tableName}</option>
					`
            for (i = 0; i < selectFieldsObject[key].length; i++) {
                htmlString += `<option value="${selectFieldsObject[key][i]}">${selectFieldsObject[key][i]}</option>`
            }
            htmlString += `
            </select>
					 </div>
					`
        }
        else if (key === 'ca_main_table') {
            htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label"><a id="mainTableLink" href="/applications/edit-application-ui?id=${mainTableId}">${tableName}</a></label>
                                <input type="number" class="form-control" id="${key}" name="${key}" ${isEditable ? '' : `disabled`} required>
                            </div>`
        }
        else if (dataType === 'integer' || dataType === 'bigint') {
            htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <input type="number" class="form-control" id="${key}" name="${key}" ${isEditable ? '' : `disabled`} required>
                            </div>`
        }
        else if (dataType === 'date') {
            htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <input class="form-control" type="date" placeholder="yyyy-mm-dd" id="${key}" name="${key}" ${isEditable ? '' : `disabled`} >
                            </div>`
            $(`#${key}`).flatpickr()
        }
        else if (dataType === 'timestamp with time zone' || dataType === 'timestamp without time zone') {

            htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <input class="form-control" type="date" placeholder="yyyy-mm-dd" id="${key}" name="${key}" ${isEditable ? '' : `disabled`} >
                            </div>`
            $(`#${key}`).flatpickr()
        }
        else if (dataType === 'boolean') {
            htmlString += `
                <div class="col-${colSpan}" style="display:flex;flex-direction:column;">
                    <label for="${key}" class="form-label">${tableName}</label>
                    <label class="switch">
                        <input type="checkbox" id="${key}" name="${key}" ${isEditable ? '' : `disabled`}>
                        <span class="slider round"></span>
                    </label>
                </div>
            `
        }
        else {
            htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <input type="text" class="form-control" id="${key}" name="${key}" ${isEditable ? '' : `disabled`} required>
                            </div>`
        }
    })
    htmlString += `</div>`
    leftForm.innerHTML = htmlString
}
let getAllFields = async (url, table) => {
    return $.ajax({
        url: `/admin${url}?table=${table}`,
        method: "GET",
        success: function (result) {
            allFieldsArray = result.payload
            // console.log(allFieldsArray)
            allFieldsArray.map(field => {
                field.table_name = field.column_name.split('_').map(field => capitalizeFirstLetter(field)).join(' ')

                field.table_name = field.table_name.replace(/Axis|Bob|Au|Idfc|Citi/, function (matched) {
                    return ""
                }).trim()
                // CA Main Table - Main Table ID
                field.table_name = field.table_name.replace('Ca Main Table', 'Main Table')
                field.table_name = field.table_name.replace('Bool', '').trim()
            })
        }
    }).then(res => res.data)
}
let getFormData = async (url, id, home) => {
    return $.ajax({
        url: `/admin/${home}/get-${url}-by-id?id=${id}`,
        method: "GET",
        success: function (result) {
            details = result.payload
            mainTableId = details['ca_main_table']
            $('#mainTableLink').attr('href', mainTableId ? `/applications/edit-application-ui?id=${mainTableId}` : `#`)
            Object.keys(fieldData).forEach(key => {
                if (fieldData[key].dataType === 'boolean') {
                    $(`#${key}`).prop('checked', details[key] || false)
                    details[key] = details[key] || false
                }
                else if (fieldData[key].dataType === 'timestamp with time zone' || fieldData[key].dataType === 'timestamp without time zone' || fieldData[key].dataType === 'date') {
                    if (details[key]) {
                        const startdate = new Date(details[key]).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
                        const startDateArray = (startdate.split(/,|\//))

                        $(`#${key}`).val(`${startDateArray[2]}-${startDateArray[1]}-${startDateArray[0]}`)
                    }
                    else {
                        $(`#${key}`).val(``)
                    }
                }
                else {
                    $(`#${key}`).val(details[key] || '')
                }
            })
        }
    }).then(res => res.data)
}

const validate = () => {
    Object.keys(inputObject).forEach((key) => {
        if (!details[key]) {
            if (inputObject[key] !== '') {
                updateBtn.disabled = false
                updateEnable = true
            }
            else
                delete inputObject[key]
        }
        else {
            if (inputObject[key] !== details[key]) {
                updateBtn.disabled = false
                updateEnable = true
            }
            else
                delete inputObject[key]
        }
    })
    if (!updateEnable) {
        updateBtn.disabled = true
    }
    else {
        updateEnable = false
    }
}

// Left form
leftForm.addEventListener('input', e => {
    if (e.target.type === 'checkbox') {
        inputObject[e.target.name] = e.target.checked
    }
    else {
        inputObject[e.target.name] = e.target.value
    }
    validate()
})
updateBtn.addEventListener('click', (e) => {
    const page = window.location.pathname.split('/')[1]
    let tableName
    switch (page) {
        case 'applications':
            tableName = "card_applications_main_table"
            break
        case 'axis':
            tableName = "axis_bank_applications_table"
            break
        case 'au':
            tableName = "au_bank_applications_table"
            break
        case 'idfc':
            tableName = "idfc_bank_applications_table"
            break
        case 'bob':
            tableName = "bob_applications_table"
            break
        case 'citi':
            tableName = "citi_applications_table"
            break
        default:
            tableName = ""
    }
    $('#loader').show()
    $.ajax({
        url: `/admin/factory/update-table?id=${id}`,
        dataType: 'json',
        type: 'put',
        contentType: 'application/json',
        data: JSON.stringify({ inputObject, tableName }),
        processData: false,
        success: function (data, textStatus, jQxhr) {
            $('#loader').hide()
            location.reload()
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown)
        }
    })
})