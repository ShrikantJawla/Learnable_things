let sort = "";
let pageNo;
let entries = document.querySelector("#entries");
let tableHeader = document.querySelector("#table-header");
let filterReset = document.getElementById("filterReset");
let filterObject = { notNull: [] };
let prevPage = document.querySelector("#prevPage");
let nextPage = document.querySelector("#nextPage");
let tableFilter = document.querySelector("#table-filter-row");
const exportCsvBtn = document.getElementById("exportcsv");
let entriesPerPageElement = document.querySelector("#entriesPerPage");
let pageNoElement = document.querySelector("#page-no");
pageNo = pageNoElement.value;
let pages = document.querySelector("#pages");
let tableBodyData = document.querySelector("#data-to-show");
const openFieldsDropdownIcon = document.getElementById("dynamic-form-icon");
const dynamicFieldDropdown = document.querySelector(".dynamic-fields-dropdown");
const tableWrapper = document.querySelector("#applications-table-wrapper");
let issuerName = window.location.href.split("/")[window.location.href.split("/").length - 2];

let statusDifference = false


$("#statusDifference").click(async function () {
  statusDifference = !statusDifference;
  if (statusDifference === true) {
    $("#statusDifference").addClass("btn-success").removeClass("btn-danger")
    await getTableBody();
  } else {
    $("#statusDifference").addClass("btn-danger").removeClass("btn-success")
    await getTableBody();
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
let checkedData = [];
const pageType = window.location.pathname.split("/")[1];
let teleCallers = [];
let teleCallersWithAccess = [];

let assignBtn = document.getElementById("assign-btn");
let removeBtn = document.getElementById("remove-btn");

//////////////////////////
let reassignBtn = document.getElementById("reassign-btn");
/////////////////////////

var today = new Date();
var todayDate =
  today.getFullYear().toString().padStart(4, 0) +
  "-" +
  (today.getMonth() + 1).toString().padStart(2, 0) +
  "-" +
  today.getDate().toString().padStart(2, 0);

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

$.ajax({
  url: `/users/get-telecallersInAssignment-ajax?issuer=${issuerName}`,
  type: "GET",
  contentType: "application/json",
  dataType: "json",
  success: function (result) {
    console.log(result)
    const { payload } = result;
    teleCallersWithAccess = payload;
  },
});

if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", async function (e) {
    $("#loader").show();
    await $.ajax({
      url: `/${e.target.dataset.table}/export-csv`,
      type: "post",
      data: {
        allData: JSON.stringify({
          allFieldsArray: allFieldsArray.filter((field) => field.show > 0),
          filterObject,
        }),
      },
      // processData: false,
    }).done(function (result) {
      $("#loader").hide();
      var current = new Date();
      saveData(
        result,
        `${e.target.dataset.table}_${current.getFullYear().toString().padStart(4, 0) +
        "-" +
        (current.getMonth() + 1).toString().padStart(2, 0) +
        "-" +
        current.getDate().toString().padStart(2, 0) +
        "T" +
        current.getHours().toString().padStart(2, 0) +
        "-" +
        current.getMinutes().toString().padStart(2, 0) +
        "-" +
        current.getSeconds().toString().padStart(2, 0)
        }.csv`
      );
    });
  });
}

const saveData = (function () {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName) {
    const blob = new Blob([data], { type: "octet/stream" }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();

function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
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
  if (
    e.target.dataset.filter &&
    (e.target.tagName === "ICON" || e.target.tagName === "SPAN")
  ) {
    if (e.target.dataset.filter !== e.currentTarget.dataset.filter) {
      [...e.currentTarget.children]
        .filter((elem, i) => (pageType === "applications" ? i > 0 : i > 2))
        .map((elem, i, arr) => {
          const icon = elem.getElementsByTagName("ICON")[0];
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
      } else {
        sort = `${e.target.dataset.filter}`;
        e.currentTarget.dataset.filterValue = 1;
        e.target.parentNode.children[1].classList.remove("upside-down");
      }
    }
    await getTableBody();
  } else if (e.target.tagName === "BUTTON") {
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
      ////console.log(filterObject[e.target.name])
    } else {
      filterObject[e.target.name] = e.target.value;
    }
    ////console.log(filterObject)
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
  } else if (+e.target.value > +pageNoElement.getAttribute("max")) {
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
const validateAssignAndRemoveBtn = () => {
  if (checkedData.length > 0) {
    assignBtn.disabled = false;
    removeBtn.disabled = false;
    reassignBtn.disabled = false;
  } else {
    assignBtn.disabled = true;
    removeBtn.disabled = true;
    reassignBtn.disabled = true;
  }
};

function checkAllFunction(checked) {
  const checkboxes = document.querySelectorAll(".row-checkbox");
  checkedData = [];
  for (let checkbox of checkboxes) {
    let id = checkbox.id.replace("select-", "") * 1;
    if (checked)
      checkedData.push({
        id,
        users: $(`#select-telecaller-filter-${id}`).val(),
      });
    checkbox.checked = checked;
  }
  console.log(checkedData);
  validateAssignAndRemoveBtn();
}

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
    // ////console.log(allFieldsArray)
    // ////console.log({ afterElement: afterElement.dataset })
    // ////console.log({ allFieldsArray })
    let deletedField = allFieldsArray.find(
      (field) => field.column_name === draggable.dataset.field
    );
    // ////console.log({ deletedField })
    allFieldsArray = allFieldsArray.filter(
      (field) => field.column_name !== draggable.dataset.field
    );
    // ////console.log({ allFieldsArray })
    let afterElementIndex;
    // ////console.log(afterElement)
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
    // ////console.log(afterElementIndex)
    allFieldsArray.splice(afterElementIndex, 0, deletedField);
    // ////console.log({ allFieldsArray })
    addColumnsToTableHeader(allFieldsArray);
    addTableBody(allFieldsArray, applicationsData);
    addFilters(allFieldsArray);
    $("select[multiple='multiple']").select2({
      placeholder: "Select options",
    });
    addSelectEventListeners();
    $(".select-multi-filter").select2("close");
  });
  const changeContainer = (container, draggable) => {
    // ////console.log(draggable.dataset)
    let deletedField = allFieldsArray.find(
      (field) => field.column_name === draggable.dataset.field
    );
    //console.log(deletedField)
    if (container.id === "selected-fields-wrapper") {
      if (draggable.classList.contains("not-selected-field")) {
        deletedField.show = 1;
        draggable.classList.toggle("not-selected-field");
        draggable.classList.toggle("selected-field");
      }
    } else if (container.id === "not-selected-fields-wrapper") {
      if (draggable.classList.contains("selected-field")) {
        // ////console.log(deletedField)
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
    ////console.log(afterElement)
    if (afterElement == null) {
      // //console.log(container, container.children)
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
// Adding Tables in Main Table Header
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
      : `<th  style="color: rgb(128, 128, 128) !important">Select</th>`;
  htmlString +=
    pageType === "applications"
      ? ``
      : `
    <th style="color: rgb(128, 128, 128) !important;">
        <div >Assign To</div>
        <button class="Null -telecallers" data-filter="-telecallers">Not Assinged</button>
        <button class="notNull telecallers" data-filter="telecallers">Assigned</button>
    </th> `;
  if (window.location.href.includes("all-pincodes")) {
    htmlString = ``;
  }
  // Adding Header to Table
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
      } else if (field.table_name === "Sub Status") {
        htmlString =
          htmlString +
          `
            <th data-filter-value="0" data-filter="${field.column_name}" 
                style="color: rgb(128, 128, 128) !important; text-align:center;">
                <div class="d-flex ">
                    <span style="cursor: pointer" data-filter="${field.column_name}">Sub Stage</span>
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
      } else if (
        field.table_name === "Status" &&
        window.location.href.includes("idfc")
      ) {
        htmlString =
          htmlString +
          `
              <th data-filter-value="0" data-filter="${field.column_name}" 
                  style="color: rgb(128, 128, 128) !important; text-align:center;">
                  <div class="d-flex ">
                      <span style="cursor: pointer" data-filter="${field.column_name}">Final Stage</span>
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

function addTableBody(allFieldsArray, applicationsData) {
  checkedData = [];
  if (document.getElementById("select-all"))
    document.getElementById("select-all").checked = false;
  let editUrl;
  if (pageType === "applications") {
    editUrl = `/applications/edit-application-ui`;
  } else {
    editUrl = `/${pageType}/edit-${pageType}-application-ui`;
  }
  if (applicationsData && applicationsData.length > 0) {
    let htmlString = ``;
    const idField = Object.keys(applicationsData[0])[0];

    for (i = 0; i < applicationsData.length; i++) {
      if (window.location.href.includes("all-pincodes") !== true) {
        htmlString =
          htmlString +
          `<tr class='dynamicTableRow' style=" font-size:13px;" id="table-row-${applicationsData[i][idField]}" >`;
        htmlString += `<td data-edit-id="${applicationsData[i][idField]}" class="editIcon"><a href="${editUrl}?id=${applicationsData[i][idField]}" class="editIconLink editIcon"><i class="material-icons has-sub-menu editIcon" >edit</i>
                        </a></td>`;
        if (pageType !== "applications") {
          htmlString += `<td ><input class="form-check-input row-checkbox" type="checkbox" value=""  id="select-${applicationsData[i][idField]}" style=" width: 18px; height: 18px;"></td>`;
          htmlString += `
                <th>
                    <select name="telecallers" class="row-telecallers" id="select-telecaller-filter-${applicationsData[i][idField]}" multiple="multiple" >
                        `;
          teleCallers.map((el) => {
            if (
              applicationsData[i].telecallers &&
              applicationsData[i].telecallers.includes(el.ua_id + "")
            )
              htmlString += `<option value=${el.ua_id} selected>${el.ua_name}</option>`;
            else {
              if (el.active_user === true) {
                htmlString += `<option value=${el.ua_id}>${el.ua_name} - Active</option>`;
              } else {
                htmlString += `<option value=${el.ua_id}>${el.ua_name}</option>`;
              }
            }
          });
          htmlString += `</select>
                </th>`;
        }
      }


      allFieldsArray
        .filter((field) => field.show > 0)
        .map((field) => {
          if (
            field.data_type === "timestamp without time zone" ||
            field.data_type === "timestamp with time zone"
          ) {
            // const date = new Date(applicationsData[i][field.column_name]).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
            // const date = new Date(applicationsData[i][field.column_name])

            date = applicationsData[i][field.column_name].toString();
            date = date.split("T").join(" ").slice(0, 16);

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
                .join("")}-${applicationsData[i][idField]}" disabled>
                                            <span class="slider round"></span>
                                        </label></td>`;
          } else {
            htmlString =
              htmlString +
              `<td  style="text-align:center">${
              // Need to Handle Null , Empty Sting Correctly
              applicationsData[i][field.column_name] || "NIL"
              }
              </td>`;
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
// Getting data for multiselect fields
function getSelectFields(table) {
  return selectFieldsArray.map((elem) => {
    return $.ajax({
      url: `/factory/distinctValues?table=${table}&column=${elem}`,
      type: "GET",
      contentType: "application/json",
      dataType: "json",
      success: function (result) {
        // Removing empty string and nulls from options
        Object.keys(result.payload).forEach(
          (k) => result.payload[k] == null && delete result.payload[k] || result.payload[k] == "" && delete result.payload[k]
        );

        const { payload } = result;
        selectFieldsObject[elem] = payload;
      },
    });
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
      statusDifference
    }),
    success: function (result) {
      const { count } = result.payload;
      applicationsData = result.payload.applicationsData;
      entries.innerHTML = `(${count} entries)`;
      pages.innerHTML = `/ ${Math.ceil(count / filterObject.entriesPerPage)}`;
      pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
      );

      addTableBody(allFieldsArray, applicationsData);
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
      notSelectedFieldsWrapper.appendChild(element);
    }
  });
}

async function getTeleCallers() {
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
      : `<th><input class="form-check-input" type="checkbox" value=""  id="select-all" style=" width: 24px; height: 24px;"></th>`;
  htmlString +=
    pageType === "applications"
      ? ``
      : `
    <th>
        <select name="telecallers"  id="select-telecaller-filter-all" class='form-control select-multi-filter' multiple="multiple"  >
        <option value="">Select Telecaller</option>
            `;
  for (i = 0; i < teleCallers.length; i++) {
    if (teleCallers[i].active_user === true) {
      htmlString += `<option value=${teleCallers[i].ua_id}>${teleCallers[i].ua_name}-Active</option>`;
    } else {
      htmlString += `<option value=${teleCallers[i].ua_id}>${teleCallers[i].ua_name}</option>`;
    }
  }
  htmlString += `</select>
    </th>`;
  if (window.location.href.includes("all-pincodes")) {
    htmlString = ``;
  }
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
                    <option value="yesbank">yes</option>
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
      let data;
      data = result.payload;
      if (window.location.href.includes("idfc")) {
        let teleData = [
          {
            column_name: "name",
            data_type: "character varying",
            show: 1,
          },
          {
            column_name: "phone_number",
            data_type: "integer",
            show: 1,
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
            show: 1,
          },
          {
            column_name: "occupation",
            data_type: "character varying",
            show: 1,
          },
          {
            column_name: "aadhar_pin",
            data_type: "character varying",
            show: 1,
          },
          {
            column_name: "monthly_income",
            data_type: "character varying",
            show: 1,
          },
          {
            column_name: "company_name",
            data_type: "character varying",
            show: 1,
          },
        ];
        for (let i = 0; i < teleData.length; i++) {
          data.push(teleData[i]);
        }
      } else if (window.location.href.includes("get-applications")) {
        let pinDate = [
          {
            column_name: "mp_idfc_available",
            data_type: "character varying",
            show: 1,
          },
          {
            column_name: "mp_axis_available",
            data_type: "character varying",
            show: 1,
          },
          {
            column_name: "mp_au_available",
            data_type: "character varying",
            show: 1,
          },
          {
            column_name: "mp_yes_available",
            data_type: "character varying",
            show: 1,
          },
          {
            column_name: "mp_bob_available",
            data_type: "character varying",
            show: 1,
          },
        ];
        for (let i = 0; i < pinDate.length; i++) {
          data.push(pinDate[i]);
        }
      }
      allFieldsArray = data;

      allFieldsArray.sort(
        (a, b) =>
          showFields.indexOf(a.column_name) - showFields.indexOf(b.column_name)
      );
      allFieldsArray.map((field) => {
        let pincodeFields = ["mp_idfc_available", "mp_axis_available", "mp_au_available", "mp_yes_available", "mp_bob_available"];
        if (pincodeFields.includes(field.column_name)) {
          field.table_name = field.column_name;
        } else {
          field.table_name = field.column_name
            .split("_")
            .map((field) => capitalizeFirstLetter(field))
            .join(" ");
        }
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
        field.table_name = field.table_name.replace(
          "mp_idfc_available",
          "IDFC Pincode"
        );
        field.table_name = field.table_name.replace(
          "mp_axis_available",
          "AXIS Pincode"
        );
        field.table_name = field.table_name.replace(
          "mp_au_available",
          "AU Pincode"
        );
        field.table_name = field.table_name.replace(
          "mp_yes_available",
          "YES Pincode"
        );
        field.table_name = field.table_name.replace(
          "mp_bob_available",
          "BOB Pincode"
        );
        field.table_name = field.table_name.replace("Bool", "").trim();
        showFields.includes(field.column_name)
          ? (field.show = 1)
          : (field.show = -1);
      });
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

tableBodyData.addEventListener("change", (e) => {
  if (e.target.classList.contains("row-checkbox")) {
    let targetId = e.target.id.replace("select-", "");
    // console.log($(`#select-telecaller-filter-${targetId}`).val())
    if (e.target.checked) {
      checkedData.push({
        id: targetId * 1,
        users: $(`#select-telecaller-filter-${targetId}`).val(),
      });
      if (checkedData.length == entriesPerPageElement.value) {
        document.getElementById("select-all").checked = true;
      }
    } else {
      checkedData = checkedData.filter((el) => el.id * 1 !== targetId * 1);
      document.getElementById("select-all").checked = false;
    }
    validateAssignAndRemoveBtn();
    // console.log(checkedData)
  }
});

const validateAssignSubmit = () => {
  if ($("#addPermissionSelect").val().length > 0) {
    document.getElementById("assign-submit").disabled = false;
  }
};

const validateRemoveSubmit = () => {
  if ($("#removePermissionSelect").val().length > 0) {
    document.getElementById("remove-submit").disabled = false;
  }
};


const validateReassignSubmit = () => {
  console.log($('#reassignPermissionSelectFrom').select2('data'))
  console.log($('#reassignPermissionSelectTo').select2('data'))
  if ($("#reassignPermissionSelectFrom").val().length > 0 && $("#reassignPermissionSelectTo").val().length > 0) {
    document.getElementById("reassign-submit").disabled = false;
  }
};

const closeAssignModal = () => {
  $("#addPermissionSelect").val(null).trigger("change");
  $("#assignModal").modal("hide");
};

const closeRemoveModal = () => {
  $("#removePermissionSelect").val(null).trigger("change");
  $("#removeModal").modal("hide");
};


const closeReassignModal = () => {
  $("#reassignPermissionSelectFrom").val(null).trigger("change");
  $("#reassignPermissionSelectTo").val(null).trigger("change");
  $("#reassignModal").modal("hide");
};


document
  .getElementById("assignLaterBtn")
  ?.addEventListener("click", closeAssignModal);
document
  .getElementById("assign-btn-close")
  ?.addEventListener("click", closeAssignModal);
document
  .getElementById("remove-btn-close")
  ?.addEventListener("click", closeRemoveModal);
document
  .getElementById("removeLaterBtn")
  ?.addEventListener("click", closeRemoveModal);


document
  .getElementById("reassignLaterBtn")
  ?.addEventListener("click", closeReassignModal);

document
  .getElementById("reassign-btn-close")
  ?.addEventListener("click", closeReassignModal);



document.getElementById("assign-submit")?.addEventListener("click", () => {
  // console.log($('#addPermissionSelect').select2('data'))
  // console.log($('#removePermissionSelect').select2('data'))
  $.ajax({
    url: "/factory/add-remove-telecallers-permissions",
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      applicationIdList: checkedData,
      addUsersList: $("#addPermissionSelect").val(),
      isAssign: true,
      table: pageType,
      // removeUsersList: $('#removePermissionSelect').val()
    }),
    success: function (result) {
      // Refreshing data after assigning telecallers
      getTableBody();
      closeAssignModal();
    },
  });
});

document.getElementById("remove-submit")?.addEventListener("click", () => {
  // console.log($('#addPermissionSelect').select2('data'))
  // console.log($('#removePermissionSelect').select2('data'))
  $.ajax({
    url: "/factory/add-remove-telecallers-permissions",
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      applicationIdList: checkedData,
      removeUsersList: $("#removePermissionSelect").val(),
      isAssign: false,
      table: pageType,
    }),
    success: function (result) {
      // Refreshing data after removing telecallers
      getTableBody();
      closeRemoveModal();
    },
  });
});


document.getElementById("reassign-submit")?.addEventListener("click", () => {
  // console.log($('#reassignPermissionSelectFrom').select2('data')[0].id, "from data-----");
  // console.log($('#reassignPermissionSelectTo').select2('data')[0].id, "to data ------- ");
  if ($('#reassignPermissionSelectFrom').select2('data').length == 1 && $('#reassignPermissionSelectTo').select2('data').length == 1 && $('#reassignPermissionSelectFrom').select2('data')[0].id != $('#reassignPermissionSelectTo').select2('data')[0].id) {
    // console.log("its valid ");
    $("#showError").html("");
    $.ajax({
      url: "/factory/reassign-telecaller-permission",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        applicationIdList: checkedData,
        reassignFrom: parseInt($("#reassignPermissionSelectFrom").val()[0]),
        reassignTo: parseInt($("#reassignPermissionSelectTo").val()[0]),
        table: pageType,
      }),
      beforeSend: function(bef){
        $("#loader").show();
      },
      success: function (result) {
        // Refreshing data after removing telecallers
        getTableBody();
        closeReassignModal();
        $("#loader").hide();
      },
      error: function(err){
        closeReassignModal();
        $("#loader").hide();
        alert("There was a problem while executing!");
      }
    });

  } else {
    console.log("its not valid");
    $("#showError").html("You can't select muiltiple users and both the users can't be same");


  }

});

const fillUpPermissionSelects = () => {
  let htmlString = "";
  teleCallersWithAccess.map((el) => {
    console.log(el);
    if (el.active_user === true) {
      htmlString += `<option value=${el.ua_id}>${el.ua_name} - Active</option>`;
    } else {
      htmlString += `<option value=${el.ua_id}>${el.ua_name}</option>`;
    }
  });
  $("#addPermissionSelect").html(htmlString);
  $("#removePermissionSelect").html(htmlString);
  $("#reassignPermissionSelectFrom").html(htmlString);
  $("#reassignPermissionSelectTo").html(htmlString);
};

assignBtn?.addEventListener("click", (e) => {
  fillUpPermissionSelects();
  $("#assignModal").modal("show");
});

removeBtn?.addEventListener("click", (e) => {
  fillUpPermissionSelects();
  $("#removeModal").modal("show");
});


reassignBtn?.addEventListener("click", (e) => {
  fillUpPermissionSelects();
  $("#reassignModal").modal("show");
});

$("#addPermissionSelect").on("select2:select", function (e) {
  console.log("added");
  validateAssignSubmit();
});

$("#removePermissionSelect").on("select2:select", function (e) {
  validateRemoveSubmit();
});


$("#reassignPermissionSelectFrom").on("select2:select", function (e) {
  validateReassignSubmit();
  // validateRemoveSubmit();
});



$("#reassignPermissionSelectTo").on("select2:select", function (e) {
  validateReassignSubmit();
  // validateRemoveSubmit();
});


const addSelectEventListeners = () => {
  let selected = [];
  $(".row-telecallers").on("select2:selecting", function (e) {
    // console.log("select2:select", e)
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

$(document).ajaxStart(function(){
  $("#loader").show();
}).ajaxStop(function(){
  $("#loader").hide();
});