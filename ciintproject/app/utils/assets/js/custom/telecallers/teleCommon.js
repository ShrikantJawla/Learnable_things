let sort = "";
let pageNo;
let entries = document.querySelector("#entries");
let tableHeader = document.querySelector("#table-header");
let filterReset = document.getElementById("filterReset");
let filterObject = { notNull: [] };
let prevPage = document.querySelector("#prevPage");
let nextPage = document.querySelector("#nextPage");
let tableFilter = document.querySelector("#table-filter-row");
let entriesPerPageElement = document.querySelector("#entriesPerPage");
let pageNoElement = document.querySelector("#page-no");
pageNo = pageNoElement.value;
let pages = document.querySelector("#pages");
let tableBodyData = document.querySelector("#data-to-show");
const openFieldsDropdownIcon = document.getElementById("dynamic-form-icon");
const dynamicFieldDropdown = document.querySelector(".dynamic-fields-dropdown");
const tableWrapper = document.querySelector("#applications-table-wrapper");
let issuerName= window.location.href.split("/")[window.location.href.split("/").length - 2];
let dropOff = false;

$("#dropOffDiff").click(async function(){
  dropOff = !dropOff;
  if(dropOff === true){
    $("#dropOffDiff").addClass("btn-success").removeClass("btn-danger")
      await getTableBody(true)
  }else{
    $("#dropOffDiff").addClass("btn-danger").removeClass("btn-success")
      await getTableBody(false)
  }
  
})

const selectedFieldsWrapper = document.querySelector(
  "#selected-fields-wrapper"
);
const notSelectedFieldsWrapper = document.querySelector(
  "#not-selected-fields-wrapper"
);
const draggableFieldContainers = document.querySelectorAll(
  ".draggable-field-container"
);
const pageType = window.location.pathname.split("/")[1];

let teleCallers = [];

var today = new Date();
var todayDate = today.getFullYear().toString().padStart(4, 0) + "-" + (today.getMonth() + 1).toString().padStart(2, 0) + "-" + today.getDate().toString().padStart(2, 0);

let iconBoundingRect,
  tableWrapperBoundingRect,
  dynamicFieldDropdownBoundingRect,
  allFieldsArray,
  applicationsData,
  afterElement,
  draggable,
  finalContainerLastField;


Date.prototype.toDateInputValue = function () {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};

function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.childNodes;
}
function createSingleElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

const deleteFunction = (url, id) => {
  $.ajax({
    url: `${url}/${id}`,
    type: "DELETE",
    contentType: "application/json",
    success: () => {
      location.reload();
    },
  });
};

// TABLE FILTERS
const tableHeaderEventListener = async (e, getTableBody) => {
  // console.log(e.target.tagName)
  if (
    e.target.dataset.filter &&
    (e.target.tagName === "ICON" || e.target.tagName === "SPAN")
  ) {
    if (e.target.dataset.filter !== e.currentTarget.dataset.filter) {
      [...e.currentTarget.children]
        .filter((elem, i) => (pageType === "applications" ? i > 0 : i > 2))
        .map((elem, i, arr) => {
          const icon = elem.getElementsByTagName("ICON")[0];
          // console.log(icon) 
          if (icon.classList.contains("upside-down")) {
            icon.classList.remove("upside-down");
          }
          if (!icon.classList.contains("invisible")) {
            icon.classList.add("invisible");
          }
        });
      sort = `-${e.target.dataset.filter}`;
      e.currentTarget.dataset.filterValue = -1;
      e.currentTarget.dataset.filter = e.target.dataset.filter;
      e.target.parentNode.children[1].classList.remove("invisible");
      e.target.parentNode.children[1].classList.add("upside-down");
    } else {
      if (e.currentTarget.dataset.filterValue * 1 === 1) {
        e.currentTarget.dataset.filterValue = 0;
        e.target.parentNode.children[1].classList.add("invisible");
        sort = ``;
      } else if (e.currentTarget.dataset.filterValue * 1 === 0) {
        sort = `-${e.target.dataset.filter}`;
        e.currentTarget.dataset.filterValue = -1;
        e.target.parentNode.children[1].classList.remove("invisible");
        e.target.parentNode.children[1].classList.add("upside-down");
        // ////console.log("In 0")
      } else {
        sort = `${e.target.dataset.filter}`;
        e.currentTarget.dataset.filterValue = 1;
        e.target.parentNode.children[1].classList.remove("upside-down");
      }
    }
    await getTableBody();
  }
  else if (e.target.tagName === "BUTTON") {
    $(e.target).toggleClass("active");
    let filterValue = e.target.dataset.filter;

    // Removing Null When Adding Not Null
    if (e.target.dataset.filter.includes("-")) {
      let index = filterObject.notNull.indexOf(filterValue.slice(1));
      if (index > -1) {
        filterObject.notNull.splice(index, 1);
      }

      $(`.${filterValue.slice(1)}`).removeClass("active")
    }
    else if (e.target.dataset.filter.includes("-") === false) {
      let index = filterObject.notNull.indexOf(`-${filterValue}`);
      if (index > -1) {
        filterObject.notNull.splice(index, 1);
      }
      $(`.-${filterValue}`).removeClass("active")
    }
    // Adding Value in Filter Object
    if (filterObject.notNull.includes(e.target.dataset.filter) === false) {
      filterObject.notNull.push(e.target.dataset.filter);
    }
    // Removing Value from Filter Object
    else if (filterObject.notNull.includes(e.target.dataset.filter)) {
      let index = filterObject.notNull.indexOf(filterValue);
      if (index > -1) {
        filterObject.notNull.splice(index, 1);
      }
    }

    // console.log(filterObject.notNull)
    await getTableBody();
  }
};

prevPage.addEventListener("click", async () => {
  pageNoElement.value =
    pageNoElement.value * 1 > 1 ? pageNoElement.value * 1 - 1 : 1;
  pageNo = pageNoElement.value;
  await getTableBody();
});
nextPage.addEventListener("click", async () => {
  pageNoElement.value =
    pageNoElement.value * 1 < pageNoElement.getAttribute("max") * 1
      ? pageNoElement.value * 1 + 1
      : pageNoElement.getAttribute("max") * 1;
  pageNo = pageNoElement.value;
  await getTableBody();
});
tableFilter.addEventListener("change", async (e) => {
  if (
    (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") &&
    e.target.id !== "select-all"
  ) {
    if (e.target.type === "checkbox") {
      filterObject[e.target.name] = e.target.checked;
    } else {
      filterObject[e.target.name] = e.target.value;
    }
    pageNoElement.value = 1;
    pageNo = 1;

    await getTableBody();
  } else if (e.target.id === "select-all") {
    checkAllFunction(e.target.checked);
  }
});

entriesPerPageElement.onchange = async (e) => {
  filterObject.entriesPerPage = entriesPerPageElement.value;
  await getTableBody();
};
pageNoElement.onchange = async (e) => {
  if (e.target.value < 1) {
    pageNoElement.value = 1;
    pageNo = 1;
  } else if (e.target.value > pageNoElement.getAttribute("max")) {
    pageNoElement.value = pageNoElement.getAttribute("max");
    pageNo = pageNoElement.getAttribute("max");
  } else {
    pageNo = e.target.value;
  }
  await getTableBody();
};
// const rowClick = (e, id, url) => {
//     if (!e.target.classList.contains('action-btns')) {
//         window.open(`/${url}?id=${id}`, '_blank')
//     }
// }
tableHeader.addEventListener("click", (e) =>
  tableHeaderEventListener(e, getTableBody)
);

/*----------------RELATED TO DYNAMIC FIELDS----------------*/

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const hideDropdown = () => {
  openFieldsDropdownIcon.classList.remove("active");
  dynamicFieldDropdown.style.display = "none";
};

const showDropdown = () => {
  openFieldsDropdownIcon.classList.add("active");
  styleDropdown();
  dynamicFieldDropdown.style.display = "block";
};
draggableFieldContainers.forEach((container) => {
  container.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("draggable-field")) {
      e.target.classList.add("dragging");
    }
  });
  container.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("draggable-field")) {
      e.target.classList.remove("dragging");
    }
    let deletedField = allFieldsArray.find(
      (field) => field.column_name === draggable.dataset.field
    );
   
    allFieldsArray = allFieldsArray.filter(
      (field) => field.column_name !== draggable.dataset.field
    );
  
    let afterElementIndex;
  
    afterElementIndex =
      afterElement !== undefined
        ? allFieldsArray.findIndex(
          (field) => field.column_name === afterElement.dataset.field
        )
        : finalContainerLastField
          ? allFieldsArray.findIndex(
            (field) => field.column_name === finalContainerLastField
          ) + 1
          : 1;
   
    allFieldsArray.splice(afterElementIndex, 0, deletedField);
  
    addColumnsToTableHeader(allFieldsArray, userData);
    addTableBody(allFieldsArray, applicationsData, userData);
    addFilters(allFieldsArray);
  });
  const changeContainer = (container, draggable) => {
  
    let deletedField = allFieldsArray.find(
      (field) => field.column_name === draggable.dataset.field
    );
  
    if (container.id === "selected-fields-wrapper") {
      if (draggable.classList.contains("not-selected-field")) {
        deletedField.show = 1;
        draggable.classList.toggle("not-selected-field");
        draggable.classList.toggle("selected-field");
      }
    } else if (container.id === "not-selected-fields-wrapper") {
      if (draggable.classList.contains("selected-field")) {
     
        deletedField.show = -1;
        draggable.classList.toggle("not-selected-field");
        draggable.classList.toggle("selected-field");
      }
    }
  };
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    afterElement = getDragAfterElement(container, e.clientY);
    draggable = document.querySelector(".dragging");
    // let deletedField = allFieldsArray.find(field => field.column_name !== draggable.dataset.field)
    // allFieldsArray = allFieldsArray.filter(field => field.column_name !== draggable.dataset.field)
    // const afterElementIndex = allFieldsArray.findIndex(field => field.column_name === afterElement.dataset.field)
    // allFieldsArray.splice(afterElementIndex, 0, deletedField)

    if (afterElement == null) {
     
      if (container.children.length) {
        finalContainerLastField =
          container.lastChild.dataset.field !== draggable.dataset.field
            ? container.lastChild.dataset.field
            : finalContainerLastField;
        container.appendChild(draggable);
        changeContainer(container, draggable);
      } else {
        container.appendChild(draggable);
        changeContainer(container, draggable);
      }
    } else {
      container.insertBefore(draggable, afterElement);
      changeContainer(container, draggable);
    }
    // addColumnsToTableHeader(allFieldsArray)
    // addTableBody(allFieldsArray, applicationsData)
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable-field:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function addColumnsToTableHeader(allFieldsArray) {
  let htmlString = ``;
  htmlString += `
        <th  
            style="color: rgb(128, 128, 128) !important">
                <p style="cursor: default;position:relative;top:14px;">Edit </p>
        </th>`;
  htmlString +=
    pageType === "applications"
      ? ``
      : `
    <th id="assigned" style="color: rgb(128, 128, 128) !important;">
        <div >Assigned To</div>
    </th> `;
  allFieldsArray
    .filter((field) => field.show > 0)
    .map((field) => {
      if (field.table_name === "Date") {
        htmlString =
          htmlString +
          `
                <th data-filter-value="0" data-filter="${field.column_name}" 
                    style="color: rgb(128, 128, 128) !important; text-align:center;">
                    <div class="d-flex ">
                        <span style="cursor: pointer" data-filter="${field.column_name}">Application ${field.table_name}</span>
                        <icon data-filter="${field.column_name}"
                            class="material-icons material-symbols-outlined invisible"
                            style="cursor: pointer;">
                            straight
                        </icon>
                    </div>
                    
                    <button class="Null -${field.column_name}" data-filter="-${field.column_name}">Null</button>
                    <button class="notNull ${field.column_name}" data-filter="${field.column_name}">Not Null</button>
    
                </th>
            `;
      } else if (field.table_name === "Existing C") {
        htmlString =
          htmlString +
          `
                <th data-filter-value="0" data-filter="${field.column_name}" 
                    style="color: rgb(128, 128, 128) !important; text-align:center;">
                    <div class="d-flex ">
                        <span style="cursor: pointer" data-filter="${field.column_name}">ETB/NTB</span>
                        <icon data-filter="${field.column_name}"
                            class="material-icons material-symbols-outlined invisible"
                            style="cursor: pointer;">
                            straight
                        </icon>
                    </div>
                    <button class="Null -${field.column_name}" data-filter="-${field.column_name}">Null</button>
                    <button class="notNull ${field.column_name}" data-filter="${field.column_name}">Not Null</button>
                </th>
            `;
      } else {
        htmlString =
          htmlString +
          `
                <th data-filter-value="0" data-filter="${field.column_name}" 
                    style="color: rgb(128, 128, 128) !important; text-align:center;">
                    <div class="d-flex ">
                        <span style="cursor: pointer" data-filter="${field.column_name}">${field.table_name}</span>
                        <icon data-filter="${field.column_name}"
                            class="material-icons material-symbols-outlined invisible"
                            style="cursor: pointer;">
                            straight
                        </icon>
                    </div>
                    
                    <button class="Null -${field.column_name}" data-filter="-${field.column_name}">Null</button>
                    <button class="notNull ${field.column_name}" data-filter="${field.column_name}">Not Null</button>
    
                </th>
            `;
      }
    });
  tableHeader.innerHTML = htmlString;
}

function addTableBody(allFieldsArray, applicationsData, user) {
  checkedData = [];
  if (document.getElementById("select-all"))
    document.getElementById("select-all").checked = false;
  let editUrl;
  if (pageType === "applications") {
    editUrl = `/applications/edit-application-ui`;
  } else {
    editUrl = `/${pageType}/edit-tele-${pageType}-application-ui`;
  }
  if (applicationsData && applicationsData.length > 0) {
    let htmlString = ``;
    const idField = Object.keys(applicationsData[0])[0];
    for (i = 0; i < applicationsData.length; i++) {
      htmlString =
        htmlString +
        `<tr class='dynamicTableRow' style=" font-size:13px;" id="table-row-${applicationsData[i]["application_id"]}" >`;
      htmlString += `<td data-edit-id="${applicationsData[i]["application_id"]}" class="editIcon"><a href="${editUrl}?id=${applicationsData[i]["application_id"]}" class="editIconLink editIcon"><i class="material-icons has-sub-menu editIcon" >edit</i>
                        </a></td>`;
      if (user.ua_role === 3) {
        $("#assigned").remove();
        $("#telecallers-assigned").remove();
      }
      if (pageType !== "applications" && user.ua_role === 1) {
        if (i === applicationsData.length - 1) {
          htmlString += `<td style="text-align:center">${applicationsData[i].ua_name}</td>`;
        } else {
          if (
            applicationsData[i].application_id ===
            applicationsData[i + 1].application_id
          ) {
            htmlString += `<td style="text-align:center">${applicationsData[i].ua_name
              }, ${applicationsData[i + 1].ua_name}</td>`;
            i++;
          } else if (
            applicationsData[i].application_id !=
            applicationsData[i + 1].application_id
          ) {
            htmlString += `<td style="text-align:center">${applicationsData[i].ua_name}</td>`;
          }
        }
      }
      allFieldsArray
        .filter((field) => field.show > 0)
        .map((field) => {
          if (
            field.data_type === "timestamp without time zone" ||
            field.data_type === "timestamp with time zone"
          ) {
            const date = new Date(applicationsData[i][field.column_name]).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
            // const date = new Date(applicationsData[i][field.column_name])
            // let date = applicationsData[i][field.column_name].toString();
            // date = date.split("T").join(" ").slice(0, 16);
            // htmlString = htmlString + `<td style="text-align:center">${date.getFullYear().toString().padStart(4, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}<br> ${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}</td>`
            htmlString =
              htmlString + `<td   style="text-align:center">${date}</td>`;
          } else if (field.column_name === "ca_main_table") {
            htmlString =
              htmlString +
              `<td  style="text-align:center">${applicationsData[i][field.column_name]
                ? `<a href="/applications/edit-application-ui?id=${applicationsData[i][field.column_name]
                }">${applicationsData[i][field.column_name]}</a>`
                : "NIL"
              }</td>`;
          } else if (field.data_type === "date") {
            // const date = new Date(applicationsData[i][field.column_name]).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
            const date = new Date(applicationsData[i][field.column_name]);
            htmlString =
              htmlString +
              `<td   style="text-align:center">${date
                .getFullYear()
                .toString()
                .padStart(4, 0)}-${(date.getMonth() + 1)
                  .toString()
                  .padStart(2, 0)}-${date
                    .getDate()
                    .toString()
                    .padStart(2, 0)}</td>`;
          } else if (field.data_type === "boolean") {
            htmlString =
              htmlString +
              `<td  ><label class="switch">                                                 
                                            <input type="checkbox" ${!applicationsData[i][
                field.column_name
              ]
                ? ""
                : "checked"
              } id="${field.table_name
                .split(" ")
                .join("")}-${applicationsData[i]["application_id"]}" disabled>
                                            <span class="slider round"></span>
                                        </label></td>`;
          } else {
            htmlString =
              htmlString +
              `<td  style="text-align:center">${applicationsData[i][field.column_name] || "NIL"
              }</td>`;
          }
        });

      htmlString = htmlString + `</tr>`;
    }
    tableBodyData.innerHTML = htmlString;
  } else {
    tableBodyData.innerHTML = ``;
  }
  $("select[multiple='multiple']").select2({
    placeholder: "Select options",
  });
  addSelectEventListeners();
  $(".select-multi-filter").select2("close");
}

function getSelectFields(table) {
  return selectFieldsArray.map((elem) => {
    if (elem.includes("tad_call_status") || elem.includes("tad_automated_call_status") || elem.includes("tad_au_dropoff_page") || elem.includes("tad_axis_ipa_original_status_sheet") || elem.includes("tad_idfc_sub_status") || elem.includes("tad_yes_application_status") || elem.includes("tad_final_call_status")) {
      return $.ajax({
        url: `/factory/distinctValues?table=tele_applications_data&column=${elem}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        success: function (result) {
          Object.keys(result.payload).forEach(
            (k) => result.payload[k] == null && delete result.payload[k] || result.payload[k] == "" && delete result.payload[k]
          );
          const { payload } = result;
          selectFieldsObject[elem] = payload;
        },
      });
    } else {
      return $.ajax({
        url: `/factory/distinctValues?table=${table}&column=${elem}`,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        success: function (result) {
          Object.keys(result.payload).forEach(
            (k) => result.payload[k] == null && delete result.payload[k] || result.payload[k] == "" && delete result.payload[k]
          );
          const { payload } = result;
          selectFieldsObject[elem] = payload;
        },
      });
    }
  });
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
                                `;
  return $.ajax({
    url: tableUrl,
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      filterObject,
      pageNo,
      sort,
      dropOff: dropOff
    }),
    success: function (result) {
   
      const { count } = result.payload;
      user = result.payload.user;
      applicationsData = result.payload.applicationsData;

      entries.innerHTML = `(${count} entries)`;
      pages.innerHTML = `/ ${Math.ceil(count / filterObject.entriesPerPage)}`;
      pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
      );
      addTableBody(allFieldsArray, applicationsData, user);
    },
  }).then((res) => res.data);
};

function fillUpDropdown(allFieldsArray) {
  allFieldsArray.map((field) => {
    if (field.show > 0) {
      const element = createSingleElementFromHTML(`
            <div class="draggable-field selected-field" draggable="true" data-field="${field.column_name}">
            <span> ${field.table_name}</span>
            <span class="material-icons material-symbols-outlined drag-icon"
                >drag_indicator</span
            >
            </div>`);
      selectedFieldsWrapper.appendChild(element);
    } else {
      const element = createSingleElementFromHTML(`
            <div class="draggable-field not-selected-field" draggable="true" data-field="${field.column_name}" >
            <span> ${field.table_name}</span>
            <span class="material-icons material-symbols-outlined drag-icon"
            >drag_indicator</span
            >
            </div>`);
      //notSelectedFieldsWrapper.appendChild(element);
    }
  });
}

async function getTeleCallers() {
  // need to make change in url here
  return $.ajax({
    url: `/users/get-telecallers-ajax`,
    type: "GET",
    contentType: "application/json",
    dataType: "json",
    success: function (result) {
      const { payload } = result;
      teleCallers = payload;
    },
  });
}
getTeleCallers();
let styleDropdown = () => {
  iconBoundingRect = openFieldsDropdownIcon.getBoundingClientRect();
  tableWrapperBoundingRect = tableWrapper.getBoundingClientRect();
  dynamicFieldDropdown.style.top = `${iconBoundingRect.top + iconBoundingRect.height + window.scrollY
    }px`;
  dynamicFieldDropdown.style.left = `${iconBoundingRect.left - 300 + iconBoundingRect.width
    }px`;
};

document
  .querySelector(".hide-sidebar-toggle-button")
  .addEventListener("click", () => hideDropdown());

function addFilters(allFieldsArray) {
  let string = "";
  allFieldsArray.map((field) => (string += `${field.column_name},`));
  let htmlString = ``;
  htmlString += `<th></th>`;
  htmlString +=
    pageType === "applications"
      ? ``
      : `
    <th id ="telecallers-assigned">
        <select name="telecallers"  id="select-telecaller-filter-all" class='form-control select-multi-filter' multiple="multiple">
            `;
  teleCallers.map((el) => {
    htmlString += `<option value=${el.ua_id}>${el.ua_name}</option>`;
  });
  htmlString += `</select>
    </th>`;
  allFieldsArray
    .filter((field) => field.show > 0)
    .map(async (field) => {
      if (selectFieldsArray.includes(field.column_name)) {
        htmlString += `
        <th >
        <select class='form-control select-multi-filter' id="${field.column_name}" name=${field.column_name}  multiple="multiple">
      `;
        selectFieldsObject[field.column_name].sort().map((field) => {
          htmlString += `<option value="${field}">${field}</option>`;
        });
        htmlString += `
					</select>
            		</th>
					`;
      } else if (field.data_type === "boolean") {
        htmlString += `<th>
                <select class='form-control ${field.table_name
            .split(" ")
            .join("")}-filter' style="min-width:88px;"  id=${field.column_name
          } name=${field.column_name}>
                    <option value="">Select </option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                    
                </select>
            </th>`;
      } else if (
        field.data_type === "date" ||
        field.data_type === "timestamp without time zone" ||
        field.data_type === "timestamp with time zone"
      ) {
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
                                    <input type="date" max="${todayDate}" id="from_${field.column_name}" name="from_${field.column_name}" class="form-control"  style="
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
                                    <input type="date" max="${todayDate}" id="to_${field.column_name}" name="to_${field.column_name}" class="form-control" style="
                                            width: 90px;
                                            padding: 0;
                                            height: 20px;
                                            border-radius: 0px;
                                            font-size: 11px;
                                        " />
                                </div>`;
      } else if (field.data_type === "ARRAY") {
        htmlString += `<th>
                <select class='form-control' id=${field.column_name} name=${field.column_name} style="min-width:max-content;" >
                    <option value="">Select ${field.table_name}</option>
                    <option value="aubank">aubank</option>
                    <option value="axis">axis</option>
                    <option value="bob">bob</option>
                    <option value="citi">citi</option>
                    <option value="idfc">idfc</option>
                    <option value="yes">yes</option>
                </select>
            </th>`;
      } else if (field.table_name === "Id") {
        htmlString += `<th>
                                <input
                                        type="text"
                                        name="${field.column_name}"
                                        class="form-control"
                                        style="
                                            width:70px;
                                        "
                                        id="${field.column_name}"
                                    />
                            </th>`;
      } else {
        htmlString += `<th>
                                <input
                                        type="text"
                                        name="${field.column_name}"
                                        class="form-control"
                                        style="
                                            
                                        "
                                        id="${field.column_name}"
                                    />
                            </th>`;
      }
    });
  tableFilter.innerHTML = htmlString;
  addFilterSelectEventListeners();
}

let getAllFields = (url, table) => {
  return $.ajax({
    url: `${url}?table=${table}`,

    method: "GET",
    success: function (result) {
      let data = result.payload;
      // TODO : Need to fix this way of adding data into table header
      if (window.location.href.includes("idfc")) {
        let teleData = [
          {
            column_name: "name",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "phone_number",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_updated_at",
            data_type: "timestamp with time zone",
            show: 1
          },
          {
            column_name: "tad_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_call_decline_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_activation_call_counter",
            data_type: "interger",
            show: 1
          },
          {
            column_name: "tad_automated_call_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_automated_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_final_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_idfc_sub_status",
            data_type: "character varying",
            show: 1
          },
        ];
        for (let i = 0; i < teleData.length; i++) {
          data.push(teleData[i]);
        }
      }
      else if (window.location.href.includes("au")) {
        let teleData = [
          {
            column_name: "tad_au_dropoff_page",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_call_decline_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_activation_call_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_updated_at",
            data_type: "timestamp with time zone",
            show: 1
          },
          {
            column_name : "auj_created_at",
            data_type: "timestamp with time zone",
            show: 1
          },
          {
            column_name: "tad_sms_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_automated_call_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_automated_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_final_call_status",
            data_type: "character varying",
            show: 1
          },


        ];
        for (let i = 0; i < teleData.length; i++) {
          data.push(teleData[i]);
        }
      } else if (window.location.href.includes("yes")) {
        let teleData = [
          {
            column_name: "name",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "occupation",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_updated_at",
            data_type: "timestamp with time zone",
            show: 1
          },
          {
            column_name: "tad_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_call_decline_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_activation_call_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_automated_call_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_automated_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_final_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_yes_application_status",
            data_type: "character varying",
            show: 1
          },
        ];
        for (let i = 0; i < teleData.length; i++) {
          data.push(teleData[i]);
        }
      }
      else if (window.location.href.includes("axis")) {
        let teleData = [
          {
            column_name: "tad_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_call_decline_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_activation_call_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_updated_at",
            data_type: "timestamp with time zone",
            show: 1
          },
          {
            column_name: "tad_sms_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_automated_call_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_automated_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_final_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_axis_ipa_original_status_sheet",
            data_type: "character varying",
            show: 1
          }
        ];

        for (let i = 0; i < teleData.length; i++) {
          data.push(teleData[i]);
        }
      }
      else {
        let teleData = [
          {
            column_name: "tad_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_call_decline_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_activation_call_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_updated_at",
            data_type: "timestamp with time zone",
            show: 1
          },
          {
            column_name: "tad_sms_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_automated_call_counter",
            data_type: "integer",
            show: 1
          },
          {
            column_name: "tad_automated_call_status",
            data_type: "character varying",
            show: 1
          },
          {
            column_name: "tad_final_call_status",
            data_type: "character varying",
            show: 1
          },
        ];

        for (let i = 0; i < teleData.length; i++) {
          data.push(teleData[i]);
        }
      }
      allFieldsArray = data;
      allFieldsArray.sort(
        (a, b) =>
          showFields.indexOf(a.column_name) - showFields.indexOf(b.column_name)
      );
      allFieldsArray.map((field) => {
      
        field.table_name = field.column_name
          .split("_")
          .map((field) => capitalizeFirstLetter(field))
          .join(" ");

        field.table_name = field.table_name
          .replace(/Axis|Bob|Au|Idfc|Citi|Yb/, function (matched) {
            return "";
          })
          .trim();
        // CA Main Table - Main Table ID
        field.table_name = field.table_name.replace(
          "Ca Main Table",
          "Main Table Id"
        );
        field.table_name = field.table_name.replace("Tad  Dropoff Page", "Assigned Drop Off Page");
        field.table_name = field.table_name.replace("Tad Updated At", "Last Updated At");
        field.table_name = field.table_name.replace("Drop Off Page", "Drop Off Page");
        field.table_name = field.table_name.replace("Tad Call Decline Counter", "Call Counter");
        field.table_name = field.table_name.replace("Tad Sms Counter", "Sms Counter");
        field.table_name = field.table_name.replace("Tad Call Status", "Call Status");
        field.table_name = field.table_name.replace("Tad Activation Call Counter", "Activation Call Counter");
        field.table_name = field.table_name.replace("j Created At", "Assigned at");
        field.table_name = field.table_name.replace("Tad tomated Call Counter", "Automated Call Counter");
        field.table_name = field.table_name.replace("Tad tomated Call Status", "Automated Call Status");
        field.table_name = field.table_name.replace("Tad Final Call Status", "Final Call Status");
        field.table_name = field.table_name.replace("Bool", "").trim();
        showFields.includes(field.column_name)
          ? (field.show = 1)
          : (field.show = -1);
      });

      // addFilters(allFieldsArray)
    },
  }).then((res) => res.data);
};
openFieldsDropdownIcon.addEventListener("click", (e) => {
  if (e.target.classList.contains("active")) {
    hideDropdown();
  } else {
    showDropdown();
  }
});

window.addEventListener("resize", () => {
  hideDropdown();
  styleDropdown();
});

document
  .getElementById("applications-table-wrapper")
  .addEventListener("scroll", (e) => {
    $(".row-telecallers").select2("close");
    $(".select-multi-filter").select2("close");
    hideDropdown();
    openFieldsDropdownIcon.style.transform = `translateX(${e.target.scrollLeft}px)`;
    document.getElementById(
      "entriesPerPageWrapper"
    ).style.transform = `translateX(${e.target.scrollLeft}px)`;
  });

const addSelectEventListeners = () => {
  let selected = [];
  $(".row-telecallers").on("select2:selecting", function (e) {
    
    selected = $(`#${e.target.id}`).val();
  });
  $(".row-telecallers").on("select2:select", function (e) {
    let newlySelected = $(`#${e.target.id}`).val();
    const applicationId =
      e.target.id.replace("select-telecaller-filter-", "") * 1;
    const userId = newlySelected.find((el) => !selected.includes(el));
    const toAssignBool = true;
    const table = pageType;
    $.ajax({
      url: "/factory/add-remove-single-telecaller-permission",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ applicationId, userId, toAssignBool, table }),
    });
  });
  let unselected = [];
  $(".row-telecallers").on("select2:unselecting", function (e) {
    unselected = $(`#${e.target.id}`).val();
  });
  $(".row-telecallers").on("select2:unselect", function (e) {
    let newlyUnSelected = $(`#${e.target.id}`).val();
    const applicationId =
      e.target.id.replace("select-telecaller-filter-", "") * 1;
    const userId = unselected.find((el) => !newlyUnSelected.includes(el));
    const toAssignBool = false;
    const table = pageType;
    $.ajax({
      url: "/factory/add-remove-single-telecaller-permission",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ applicationId, userId, toAssignBool, table }),
    });
  });
};

const addFilterSelectEventListeners = () => {
  $(".select-multi-filter").on("select2:select", async function (e) {
    let val = $(`#${e.target.id}`).val();
    filterObject[e.target.name] = val;
    pageNoElement.value = 1;
    pageNo = 1;

    await getTableBody();
  });
  $(".select-multi-filter").on("select2:unselect", async function (e) {
    let val = $(`#${e.target.id}`).val();
    filterObject[e.target.name] = val;
    pageNoElement.value = 1;
    pageNo = 1;

    await getTableBody();
  });
};