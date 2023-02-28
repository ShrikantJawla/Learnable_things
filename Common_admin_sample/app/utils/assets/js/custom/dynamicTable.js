// const DYNAMIC_TABLE = function ({ showFields, fetchUrl, addFilters }) {
//     this.openFieldsDropdownIcon = document.getElementById('dynamic-form-icon')
//     this.dynamicFieldDropdown = document.querySelector('.dynamic-fields-dropdown')
//     this.tableWrapper = document.querySelector('#applications-table-wrapper')
//     this.selectedFieldsWrapper = document.querySelector('#selected-fields-wrapper')
//     this.notSelectedFieldsWrapper = document.querySelector('#not-selected-fields-wrapper')
//     this.draggableFieldContainers = document.querySelectorAll('.draggable-field-container')
//     this.showFields = showFields
//     this.fetchUrl = fetchUrl
//     this.addFilters = addFilters
//     this.iconBoundingRect, this.tableWrapperBoundingRect, this.dynamicFieldDropdownBoundingRect, this.allFieldsArray, this.applicationsData, this.afterElement, this.draggable, this.finalContainerLastField
// }
// DYNAMIC_TABLE.prototype = {
//     constructor: DYNAMIC_TABLE,
//     capitalizeFirstLetter: function (string) {
//         return string.charAt(0).toUpperCase() + string.slice(1)
//     },
//     getTableBody: async function () {
//         tableBodyData.innerHTML = ` <tr>
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

//     /**/const res = await fetch(this.fetchUrl, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 filterObject,
//                 pageNo,
//                 sort,
//             }),
//         })

//         const response = await res.json()
//         const { count } = response.payload
//         this.applicationsData = response.payload.this.applicationsData
//         entries.innerHTML = `(${count} entries)`
//         pages.innerHTML = `/ ${Math.ceil(
//             count / filterObject.entriesPerPage
//         )}`
//         pageNoElement.setAttribute(
//             "max",
//             Math.ceil(count / filterObject.entriesPerPage)
//         )
//         this.addTableBody(this.allFieldsArray, this.applicationsData)
//     },
//     hideDropdown: function () {
//         this.openFieldsDropdownIcon.classList.remove('active')
//         this.dynamicFieldDropdown.style.display = 'none'
//     },
//     showDropdown: function () {
//         this.openFieldsDropdownIcon.classList.add('active')
//         this.styleDropdown()
//         this.dynamicFieldDropdown.style.display = 'block'
//     },
//     dragStartEventListener: function () {
//         if (e.target.classList.contains('draggable-field')) {
//             e.target.classList.add('dragging')
//         }
//     },
//     dragEndEventListener: function () {
//         if (e.target.classList.contains('draggable-field')) {
//             e.target.classList.remove('dragging')
//         }
//         let deletedField = this.allFieldsArray.find(field => field.column_name === this.draggable.dataset.field)
//         this.allFieldsArray = this.allFieldsArray.filter(field => field.column_name !== this.draggable.dataset.field)
//         let afterElementIndex
//         afterElementIndex = this.afterElement !== undefined
//             ? this.allFieldsArray.findIndex(field => field.column_name === this.afterElement.dataset.field)
//             : (this.finalContainerLastField ? this.allFieldsArray.findIndex(field => field.column_name === this.finalContainerLastField) + 1 : 1)
//         this.allFieldsArray.splice(afterElementIndex, 0, deletedField)
//         this.addColumnsToTableHeader(this.allFieldsArray)
//         this.addTableBody(this.allFieldsArray, this.applicationsData)
//         this.addFilters(this.allFieldsArray)
//     },
//     changeContainer: function (container, draggable) {
//         let deletedField = this.allFieldsArray.find(field => field.column_name === draggable.dataset.field)
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
//     },
//     containerDragOverEventListener: function (e, container) {
//         e.preventDefault()
//         this.afterElement = this.getDragAfterElement(container, e.clientY)
//         this.draggable = document.querySelector('.dragging')
//         if (this.afterElement == null) {
//             if (container.children.length) {
//                 this.finalContainerLastField = container.lastChild.dataset.field !== this.draggable.dataset.field ? container.lastChild.dataset.field : this.finalContainerLastField
//                 container.appendChild(this.draggable)
//                 this.changeContainer(container, this.draggable)
//             }
//             else {
//                 container.appendChild(this.draggable)

//             }
//         } else {
//             container.insertBefore(this.draggable, this.afterElement)
//             this.changeContainer(container, this.draggable)
//         }
//     },
//     getDragAfterElement: function (container, y) {
//         const draggableElements = [...container.querySelectorAll('.draggable-field:not(.dragging)')]

//         return draggableElements.reduce((closest, child) => {
//             const box = child.getBoundingClientRect()
//             const offset = y - box.top - box.height / 2
//             if (offset < 0 && offset > closest.offset) {
//                 return { offset: offset, element: child }
//             } else {
//                 return closest
//             }
//         }, { offset: Number.NEGATIVE_INFINITY }).element
//     },
//     addColumnsToTableHeader: function () {
//         // console.log("Adding Columns")
//         // console.log(this.allFieldsArray)
//         let htmlString = ``
//         this.allFieldsArray.filter(field => field.show > 0).map(field => {
//             htmlString = htmlString + `
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
//         })
//         tableHeader.innerHTML = htmlString
//     },
//     addTableBody: function () {
//         let htmlString = ``
//         for (i = 0; i < this.applicationsData.length; i++) {
//             htmlString = htmlString + `<tr style=" font-size:13px;" class="tableRow" >`
//             this.allFieldsArray.filter(field => field.show > 0).map(field => {
//                 if (field.data_type === 'timestamp without time zone' || field.data_type === 'date') {
//                     if (this.applicationsData[i][field.column_name]) {
//                         const date = new Date(this.applicationsData[i][field.column_name])
//                         htmlString = htmlString + `<td style="text-align:center">${date.getFullYear().toString().padStart(4, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}<br> ${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}</td>`
//                     }
//                     else {
//                         htmlString = htmlString + `<td style="text-align:center">NIL</td>`
//                     }
//                 }
//                 else if (field.data_type === 'boolean') {
//                     htmlString = htmlString + `<td><label class="switch">
//                                             <input type="checkbox" disabled ${(!this.applicationsData[i][field.column_name]) ? '' : 'checked'}>
//                                             <span class="slider round"></span>
//                                         </label></td>`
//                 }
//                 else {
//                     htmlString = htmlString + `<td style="text-align:center">${this.applicationsData[i][field.column_name] || 'NIL'}</td>`
//                 }
//             })
//             htmlString = htmlString + `</tr>`
//         }
//         tableBodyData.innerHTML = htmlString
//     },
//     fillUpDropdown: function () {
//         this.allFieldsArray.map((field) => {
//             if (field.show > 0) {
//                 const element = createSingleElementFromHTML(`
//             <div class="draggable-field selected-field" this.draggable="true" data-field="${field.column_name}">
//             <span> ${field.table_name}</span>
//             <span class="material-icons material-symbols-outlined drag-icon"
//                 >drag_indicator</span
//             >
//             </div>`)
//                 this.selectedFieldsWrapper.appendChild(element)
//             }
//             else {
//                 const element = createSingleElementFromHTML(`
//             <div class="draggable-field not-selected-field" this.draggable="true" data-field="${field.column_name}" >
//             <span> ${field.table_name}</span>
//             <span class="material-icons material-symbols-outlined drag-icon"
//             >drag_indicator</span
//             >
//             </div>`)
//                 this.notSelectedFieldsWrapper.appendChild(element)
//             }
//         })
//     },
//     styleDropdown: function () {
//         this.iconBoundingRect = this.openFieldsDropdownIcon.getBoundingClientRect()
//         this.tableWrapperBoundingRect = this.tableWrapper.getBoundingClientRect()
//         this.dynamicFieldDropdown.style.top = `${this.iconBoundingRect.top + this.iconBoundingRect.height + window.scrollY}px`
//         this.dynamicFieldDropdown.style.left = `${this.iconBoundingRect.left - 300 + this.iconBoundingRect.width}px`
//     },
//     openFieldsDropdownIconClickEventListener: function (e) {
//         if (e.target.classList.contains('active')) {
//             this.hideDropdown()
//         }
//         else {
//             this.showDropdown()
//         }
//     },
//     windowResizeEventListener: function () {
//         this.hideDropdown()
//         this.styleDropdown()
//     },
//     getAllFields: function (url, table) {
//         $.ajax({
//             url: `${url}?table=${table}`,
//             method: "GET",
//             success: function (result) {
//                 this.allFieldsArray = result.payload

//                 this.allFieldsArray.map(field => {
//                     field.table_name = field.column_name.split('_').map(field => this.capitalizeFirstLetter(field)).join(' ')
//                     this.showFields.includes(field.column_name)
//                         ? field.show = 1
//                         : field.show = -1
//                 })
//                 this.fillUpDropdown(this.allFieldsArray)
//                 this.addColumnsToTableHeader(this.allFieldsArray)
//                 this.addFilters(this.allFieldsArray)
//             }
//         })
//     },
//     applicationsTableWrapperEventListener: function (e) {
//         this.hideDropdown()
//         this.openFieldsDropdownIcon.style.transform = `translateX(${e.target.scrollLeft}px)`
//         document.getElementById('entriesPerPageWrapper').style.transform = `translateX(${e.target.scrollLeft}px)`
//     }
// }


// const enableDynamicTable = async function ({ showFields, fetchUrl, addFilters }) {
//     const ELEM = new DYNAMIC_TABLE({ showFields, fetchUrl, addFilters })
//     const openFieldsDropdownIcon = document.getElementById('dynamic-form-icon')
//     const draggableFieldContainers = document.querySelectorAll('.draggable-field-container')

//     draggableFieldContainers.forEach(container => {
//         container.addEventListener('dragstart', (e) => ELEM.dragStartEventListener(e))
//         container.addEventListener('dragend', (e) => ELEM.dragEventEventListener(e))
//         container.addEventListener('dragover', (e) => ELEM.containerDragOverEventListener(e, container))
//     })
//     document.querySelector('.hide-sidebar-toggle-button').addEventListener('click', () => ELEM.hideDropdown())
//     openFieldsDropdownIcon.addEventListener('click', (e) => ELEM.openFieldsDropdownIconClickEventListener(e))
//     window.addEventListener('resize', ELEM.windowResizeEventListener)
//     document.getElementById('applications-table-wrapper').addEventListener('scroll', e => ELEM.applicationsTableWrapperEventListener)
// }