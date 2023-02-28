// const openFieldsDropdownIcon = document.getElementById('dynamic-form-icon')
// const dynamicFieldDropdown = document.querySelector('.dynamic-fields-dropdown')
// const tableWrapper = document.querySelector('#applications-table-wrapper')
// const selectedFieldsWrapper = document.querySelector('#selected-fields-wrapper')
// const notSelectedFieldsWrapper = document.querySelector('#not-selected-fields-wrapper')
const draggableFieldContainers = document.querySelectorAll('.draggable-field-container')
/**/const showFields = ['id', 'name', 'email', 'phone_number', 'is_salaried', 'tracking_id', 'ipa_status', 'created_at', 'updated_at', 'form_filled_array', 'banks_applied_array', 'banks_approved_array', 'low_cibil_score', 'device_type']
/* ['id', 'name', 'email', 'phone_number', 'city', 'state', 'salary', 'date_of_birth', 'is_salaried', 'pin_code', 'sms_status', 'form_filled', 'tracking_id', 'ipa_status', 'created_at', 'updated_at', 'form_filled_array', 'banks_applied_array', 'banks_approved_array', 'low_cibil_score', 'device_type'] */

// let iconBoundingRect, tableWrapperBoundingRect, dynamicFieldDropdownBoundingRect, allFieldsArray, applicationsData, afterElement, draggable, finalContainerLastField

// function capitalizeFirstLetter(string) {
//     return string.charAt(0).toUpperCase() + string.slice(1)
// }
// let getTableBody = async () => {
//     tableBodyData.innerHTML = ` <tr>
//                                     <td colspan="10">
//                                         <div
//                                             class="d-flex justify-content-center align-items-center">
//                                             <div
//                                                 class="sbl-circ-path"
//                                             ></div>
//                                         </div>
//                                     </td>
//                                 </tr>
//                                 `

//     /**/const res = await fetch("/applications/get-all-applications-ajax", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//             filterObject,
//             pageNo,
//             sort,
//         }),
//     })

//     const response = await res.json()
//     const { count } = response.payload
//     applicationsData = response.payload.applicationsData
//     entries.innerHTML = `(${count} entries)`
//     pages.innerHTML = `/ ${Math.ceil(
//         count / filterObject.entriesPerPage
//     )}`
//     pageNoElement.setAttribute(
//         "max",
//         Math.ceil(count / filterObject.entriesPerPage)
//     )
//     // let tableBodyHTML = ""
//     // for (i = 0; i < applicationsData.length; i++) {
//     //     tableBodyHTML = tableBodyHTML + `
//     //         <tr style=" font-size:13px;" class="tableRow" >
//     //            <td style="text-align:left">${applicationsData[i]["id"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["name"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["email"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["phone_number"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["sms_status"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["form_filled"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["is_salaried"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["city"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["state"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["date_of_birth"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["tracking_id"]}</td>
//     //             <td style="text-align:left">${applicationsData[i]["ipa_status"]}</td>
//     //         </tr>
//     //     `
//     // }
//     // tableBodyData.innerHTML = tableBodyHTML
//     addTableBody(allFieldsArray, applicationsData)
// }
// const hideDropdown = () => {
//     openFieldsDropdownIcon.classList.remove('active')
//     dynamicFieldDropdown.style.display = 'none'
// }
// const showDropdown = () => {
//     openFieldsDropdownIcon.classList.add('active')
//     styleDropdown()
//     dynamicFieldDropdown.style.display = 'block'
// }
// draggableFieldContainers.forEach(container => {
//     container.addEventListener('dragstart', (e) => {
//         if (e.target.classList.contains('draggable-field')) {
//             e.target.classList.add('dragging')
//         }
//     })
//     container.addEventListener('dragend', (e) => {
//         if (e.target.classList.contains('draggable-field')) {
//             e.target.classList.remove('dragging')
//         }
//         // console.log(allFieldsArray)
//         // console.log({ afterElement: afterElement.dataset })
//         // console.log({ allFieldsArray })
//         let deletedField = allFieldsArray.find(field => field.column_name === draggable.dataset.field)
//         // console.log({ deletedField })
//         allFieldsArray = allFieldsArray.filter(field => field.column_name !== draggable.dataset.field)
//         // console.log({ allFieldsArray })
//         let afterElementIndex
//         // console.log(afterElement)
//         afterElementIndex = afterElement !== undefined
//             ? allFieldsArray.findIndex(field => field.column_name === afterElement.dataset.field)
//             : (finalContainerLastField ? allFieldsArray.findIndex(field => field.column_name === finalContainerLastField) + 1 : 1)
//         // console.log(afterElementIndex)
//         allFieldsArray.splice(afterElementIndex, 0, deletedField)
//         // console.log({ allFieldsArray })
//         addColumnsToTableHeader(allFieldsArray)
//         addTableBody(allFieldsArray, applicationsData)
//         addFilters(allFieldsArray)


//     })
//     const changeContainer = (container, draggable) => {
//         // console.log(draggable.dataset)
//         let deletedField = allFieldsArray.find(field => field.column_name === draggable.dataset.field)
//         if (container.id === 'selected-fields-wrapper') {
//             if (draggable.classList.contains('not-selected-field')) {
//                 deletedField.show = 1
//                 draggable.classList.toggle('not-selected-field')
//                 draggable.classList.toggle('selected-field')
//             }
//         }
//         else if (container.id === 'not-selected-fields-wrapper') {
//             if (draggable.classList.contains('selected-field')) {
//                 // console.log(deletedField)
//                 deletedField.show = -1
//                 draggable.classList.toggle('not-selected-field')
//                 draggable.classList.toggle('selected-field')
//             }
//         }
//     }
//     container.addEventListener('dragover', e => {
//         e.preventDefault()
//         afterElement = getDragAfterElement(container, e.clientY)
//         draggable = document.querySelector('.dragging')
//         // let deletedField = allFieldsArray.find(field => field.column_name !== draggable.dataset.field)
//         // allFieldsArray = allFieldsArray.filter(field => field.column_name !== draggable.dataset.field)
//         // const afterElementIndex = allFieldsArray.findIndex(field => field.column_name === afterElement.dataset.field)
//         // allFieldsArray.splice(afterElementIndex, 0, deletedField)
//         if (afterElement == null) {
//             if (container.children.length) {
//                 finalContainerLastField = container.lastChild.dataset.field !== draggable.dataset.field ? container.lastChild.dataset.field : finalContainerLastField
//                 container.appendChild(draggable)
//                 changeContainer(container, draggable)
//             }
//             else {
//                 container.appendChild(draggable)

//             }
//         } else {
//             container.insertBefore(draggable, afterElement)
//             changeContainer(container, draggable)
//         }
//         // addColumnsToTableHeader(allFieldsArray)
//         // addTableBody(allFieldsArray, applicationsData)
//     })
// })
// function getDragAfterElement(container, y) {
//     const draggableElements = [...container.querySelectorAll('.draggable-field:not(.dragging)')]

//     return draggableElements.reduce((closest, child) => {
//         const box = child.getBoundingClientRect()
//         const offset = y - box.top - box.height / 2
//         if (offset < 0 && offset > closest.offset) {
//             return { offset: offset, element: child }
//         } else {
//             return closest
//         }
//     }, { offset: Number.NEGATIVE_INFINITY }).element
// }

// function addColumnsToTableHeader(allFieldsArray) {
//     // console.log("Adding Columns")
//     // console.log(allFieldsArray)
//     let htmlString = ``
//     allFieldsArray.filter(field => field.show > 0).map(field => {
//         htmlString = htmlString + `
//             <th data-filter-value="0" data-filter="${field.column_name}" 
//                 style="color: rgb(128, 128, 128) !important">
//                 <div class="d-flex ">
//                     <span style="cursor: pointer" data-filter="${field.column_name}">${field.table_name}</span>
//                     <icon data-filter="${field.column_name}"
//                         class="material-icons material-symbols-outlined invisible"
//                         style="cursor: pointer;">
//                         straight
//                     </icon>
//                 </div>
//             </th>
//         `
//     })
//     tableHeader.innerHTML = htmlString
// }
// function addTableBody(allFieldsArray, applicationsData) {
//     let htmlString = ``
//     for (i = 0; i < applicationsData.length; i++) {
//         htmlString = htmlString + `<tr style=" font-size:13px;" class="tableRow" >`
//         allFieldsArray.filter(field => field.show > 0).map(field => {
//             if (field.data_type === 'timestamp without time zone' || field.data_type === 'date') {
//                 if (applicationsData[i][field.column_name]) {
//                     const date = new Date(applicationsData[i][field.column_name])
//                     htmlString = htmlString + `<td style="text-align:center">${date.getFullYear().toString().padStart(4, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}<br> ${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}</td>`
//                 }
//                 else {
//                     htmlString = htmlString + `<td style="text-align:center">NIL</td>`
//                 }
//             }
//             else if (field.data_type === 'boolean') {
//                 htmlString = htmlString + `<td><label class="switch">                                                 
//                                             <input type="checkbox" disabled ${(!applicationsData[i][field.column_name]) ? '' : 'checked'}>
//                                             <span class="slider round"></span>
//                                         </label></td>`
//             }
//             else {
//                 htmlString = htmlString + `<td style="text-align:center">${applicationsData[i][field.column_name] || 'NIL'}</td>`
//             }
//         })
//         htmlString = htmlString + `</tr>`
//     }
//     tableBodyData.innerHTML = htmlString
// }
function addFilters(allFieldsArray) {
    let string = ""
    allFieldsArray.map(field => string += `${field.column_name},`)
    console.log(string)
    console.log(allFieldsArray)
    let htmlString = ``
    allFieldsArray.filter(field => field.show > 0).map(field => {
        if (field.data_type === 'boolean') {
            htmlString += `<th> <label class="switch">                                                 
                                    <input type="checkbox" id=${field.column_name} name=${field.column_name}>
                                    <span class="slider round"></span>
                                </label>
                                </th>`
        }
        else if (field.column_name === 'date_of_birth') {
            htmlString += `<th></th>`
        }
        else if (field.column_name === 'salary') {
            htmlString += `<th></th>`
        }
        /* else if (field.column_name === 'salary') {
            htmlString += `<th>
                                <div class="d-flex" style="margin-bottom: 2px">
                                    <span style="
                                            font-size: 12px;
                                            width: 40px;
                                            color: rgb(
                                                128,
                                                128,
                                                128
                                            ) !important;
                                        ">From</span>
                                    <input type="number" id="from_${field.column_name}" name="from_${field.column_name}" class="form-control"  style="
                                            width: 90px;
                                            padding: 0;
                                            height: 20px;
                                            border-radius: 0px;
                                            font-size: 11px;
                                        " />
                                </div>

                                <div class="d-flex">
                                    <span style="
                                            font-size: 12px;
                                            width: 40px;
                                            color: rgb(
                                                128,
                                                128,
                                                128
                                            ) !important;
                                        ">To
                                </span>
                                    <input type="number" id="to_${field.column_name}" name="to_${field.column_name}" class="form-control" style="
                                            width: 90px;
                                            padding: 0;
                                            height: 20px;
                                            border-radius: 0px;
                                            font-size: 11px;
                                        " />
                                </div>`
        } */
        else if (field.column_name === 'ipa_status') {
            htmlString +=
                `<th>
                <select  id=${field.column_name} name=${field.column_name}>
                    <option value="">Select ${field.table_name}</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                    <option value="IPA">IPA</option>
                    <option value="UW Completed">UW Completed</option>
                    <option value="Underwriter">Underwriter</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
            </th>`
        }
        else if (field.column_name === 'sms_status') {
            htmlString +=
                `<th>
                <select  id=${field.column_name} name=${field.column_name}>
                    <option value="">Select ${field.table_name}</option>
                    <option value="Blocked Number">Blocked Number</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed">Failed</option>
                    <option value="NDNC Number">NDNC Number</option>
                    <option value="Rejected by Kannel or Provider">Rejected by Kannel or Provider</option>
                </select>
            </th>`
        }
        else if (field.column_name === 'device_type') {
            htmlString +=
                `<th>
                <select  id=${field.column_name} name=${field.column_name}>
                    <option value="">Select ${field.table_name}</option>
                    <option value="Android">Android</option>
                    <option value="IOS">IOS</option>
                    <option value="Linux">Linux</option>
                    <option value="MacOS">MacOS</option>
                    <option value="Windows">Windows</option>
                </select>
            </th>`
        }

        else if (field.data_type === 'date' || field.data_type === 'timestamp without time zone') {
            htmlString += `<th>
                                <div class="d-flex" style="margin-bottom: 2px">
                                    <span style="
                                            font-size: 12px;
                                            width: 40px;
                                            color: rgb(
                                                128,
                                                128,
                                                128
                                            ) !important;
                                        ">From</span>
                                    <input type="date" id="from_${field.column_name}" name="from_${field.column_name}" class="form-control"  style="
                                            width: 90px;
                                            padding: 0;
                                            height: 20px;
                                            border-radius: 0px;
                                            font-size: 11px;
                                        " />
                                </div>

                                <div class="d-flex">
                                    <span style="
                                            font-size: 12px;
                                            width: 40px;
                                            color: rgb(
                                                128,
                                                128,
                                                128
                                            ) !important;
                                        ">To
                                </span>
                                    <input type="date" id="to_${field.column_name}" name="to_${field.column_name}" class="form-control" style="
                                            width: 90px;
                                            padding: 0;
                                            height: 20px;
                                            border-radius: 0px;
                                            font-size: 11px;
                                        " />
                                </div>`
        }

        else if (field.data_type === 'ARRAY') {
            htmlString +=
                `<th>
                <select  id=${field.column_name} name=${field.column_name}>
                    <option value="">Select ${field.table_name}</option>
                    <option value="aubank">aubank</option>
                    <option value="axis">axis</option>
                    <option value="bob">bob</option>
                    <option value="citi">citi</option>
                    <option value="idfc">idfc</option>
                </select>
            </th>`
        }

        else {
            htmlString += `<th>
                                <input
                                        type="text"
                                        name="${field.column_name}"
                                        class="form-control"
                                        style="
                                            padding: 0;
                                            height: 20px;
                                            border-radius: 0px;
                                            font-size: 12px;
                                        "
                                        id="${field.column_name}"
                                    />
                            </th>`
        }
    })
    tableFilter.innerHTML = htmlString
}
// function fillUpDropdown(allFieldsArray) {
//     allFieldsArray.map((field) => {
//         if (field.show > 0) {
//             const element = createSingleElementFromHTML(`
//             <div class="draggable-field selected-field" draggable="true" data-field="${field.column_name}">
//             <span> ${field.table_name}</span>
//             <span class="material-icons material-symbols-outlined drag-icon"
//                 >drag_indicator</span
//             >
//             </div>`)
//             selectedFieldsWrapper.appendChild(element)
//         }
//         else {
//             const element = createSingleElementFromHTML(`
//             <div class="draggable-field not-selected-field" draggable="true" data-field="${field.column_name}" >
//             <span> ${field.table_name}</span>
//             <span class="material-icons material-symbols-outlined drag-icon"
//             >drag_indicator</span
//             >
//             </div>`)
//             notSelectedFieldsWrapper.appendChild(element)
//         }
//     })
// }

// let styleDropdown = () => {
//     iconBoundingRect = openFieldsDropdownIcon.getBoundingClientRect()
//     tableWrapperBoundingRect = tableWrapper.getBoundingClientRect()
//     dynamicFieldDropdown.style.top = `${iconBoundingRect.top + iconBoundingRect.height + window.scrollY}px`
//     dynamicFieldDropdown.style.left = `${iconBoundingRect.left - 300 + iconBoundingRect.width}px`
// }

// document.querySelector('.hide-sidebar-toggle-button').addEventListener('click', () => hideDropdown())

// openFieldsDropdownIcon.addEventListener('click', (e) => {
//     if (e.target.classList.contains('active')) {
//         hideDropdown()
//     }
//     else {
//         showDropdown()
//     }
// })

// window.addEventListener('resize', () => {
//     hideDropdown()
//     styleDropdown()
// })
// let getAllFields = (url, table) => {
//     $.ajax({
//         url: `${url}?table=${table}`,
//         method: "GET",
//         success: function (result) {
//             allFieldsArray = result.payload

//             allFieldsArray.map(field => {
//                 field.table_name = field.column_name.split('_').map(field => capitalizeFirstLetter(field)).join(' ')
//                 showFields.includes(field.column_name)
//                     ? field.show = 1
//                     : field.show = -1
//             })
//             fillUpDropdown(allFieldsArray)
//             addColumnsToTableHeader(allFieldsArray)
//             addFilters(allFieldsArray)
//         }
//     })
// }
// document.getElementById('applications-table-wrapper').addEventListener('scroll', e => {
//     hideDropdown()
//     openFieldsDropdownIcon.style.transform = `translateX(${e.target.scrollLeft}px)`
//     document.getElementById('entriesPerPageWrapper').style.transform = `translateX(${e.target.scrollLeft}px)`
// })
$('document').ready(() => {
    // $('.hide-sidebar-toggle-button').click()
    // iconBoundingRect = openFieldsDropdownIcon.getBoundingClientRect()
    // tableWrapperBoundingRect = tableWrapper.getBoundingClientRect()
    // styleDropdown()
    // getAllFields('/factory/fields', 'card_applications_main_table')

})