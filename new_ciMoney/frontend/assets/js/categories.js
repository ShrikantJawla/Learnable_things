let SELECT_OPTIONS = {};
let duplicateId = "";
// const arr = ['id', 'OfferName', 'BrandPrivate', 'FromWhere', 'CardIssuer', 'published_at_type', 'OfferCategory', 'OfferType', 'UpdatedBy']
// arr.map(val => {
// document.getElementById(`${val}-second`).addEventListener('change', e => {
//         const elem = document.getElementById(`${val}`)
//         const event = new Event('change', { bubbles: true })
//         elem.value = e.target.value
//         elem.dispatchEvent(event)
//     })
// })
$("#OfferName").keypress(function (e) {
  if (e.keyCode === 13 && !e.shiftKey) {
    e.preventDefault();
    const event = new Event("change", { bubbles: true });
    e.target.dispatchEvent(event);
  }
});
filterReset.addEventListener("click", () => {
  console.log("Filter reset triggered!");
  document.getElementById("id").value = "";
  // document.getElementById("id-second").value = ""
  document.getElementById("name").value = "";
  // document.getElementById("OfferName-second").value = ""
  document.getElementById("desc").value = "";
  // document.getElementById("BrandPrivate-second").value = ""
  document.getElementById("img").value = "";
  // document.getElementById("UpdatedBy-second").value = ""

  document.getElementById("status").value = "any";
  // document.getElementById("published_at_type-second").value = "any"
  document.getElementById("sequence").value = "";
  // document.getElementById("FromWhere-second").value = "any"

  document.getElementById("updated_by").value = "";

  document.getElementById("from_updated_at").value = "";
  document.getElementById("to_updated_at").value = "";
  document.getElementById("from_Created_at").value = "";
  document.getElementById("to_Created_at").value = "";

  entriesPerPageElement.value = "10";
  filterObject = {};
  filterObject.entriesPerPage = entriesPerPageElement.value;

  getTableBody();
});

let clickedId;

// document.getElementById('finalDeleteButton').addEventListener('click', () => {
//     deleteFunction('/delete/offer', clickedId)
// })

let getTableBody = async () => {
  tableBodyData.innerHTML = ` <tr>
                                    <td colspan="12">
                                        <div
                                            class="d-flex justify-content-center align-items-center"
                                        >
                                            <div
                                                class="sbl-circ-path"
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                                `;
  const res = await fetch("/categories/getCategoriesData", {
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
  const response = await res.json();
  const { rows, rowCount } = response.allData;
  console.log(rows);
  entries.innerHTML = `(${rowCount} entries)`;
  pages.innerHTML = `/ ${Math.ceil(rowCount / filterObject.entriesPerPage)}`;
  pageNoElement.setAttribute(
    "max",
    Math.ceil(rowCount / filterObject.entriesPerPage)
  );

  let tableBodyHTML = "";
  for (i = 0; i < rows.length; i++) {
    tableBodyHTML =
      tableBodyHTML +
      `
        <tr style=" font-size:13px;" class="tableRow" onclick="rowClick(event,${
          rows[i]["offer_id"]
        },'edit-offer')">
        <td >${rows[i]["cat_id"]}</td>
                <td style="max-width:120px !important;text-align:left">${
                  rows[i]["cat_name"]
                }</td>
                <td style="max-width:500px !important;  "><pre style="font-size:13px !important ">${
                  rows[i]["cat_desc"]
                }</pre></td>
                <td style="text-align:center; width:100px;">${
                  rows[i]["cat_img"]
                }</td>
                <td style="text-align:center" >${
                  rows[i]["cat_status"] ? "YES" : "NO"
                }</td>
                <td style="text-align:center">${rows[i]["cat_sequence"]}</td>
                <td style="text-align:center">${rows[i]["cat_created_by"]}</td>
               
                <td style="text-align:center;">${rows[i]["cat_created_at"]}</td>
                
                <td style="text-align:center;">${rows[i]["cat_updated_at"]}</td>
                <td>
                    <div style="display:flex;flex-direction:horizontal;gap:5px;">
                        
                        <a href="/categories/editCategory?id=${
                          rows[i]["cat_id"]
                        }" target="_blank"
                        ><i class="material-icons has-sub-menu action-btns">edit</i>
                        </a>
                        
                        <button class='deleteBtnTable ' data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="deleteAnyRow('/offers/deleteRow',${
                          rows[i]["offer_id"]
                        })" 
                        ><i class="material-icons has-sub-menu action-btns ">delete</i>
                        </button>

                    </div>
                </td>
                
            </tr>
            `;
  }
  tableBodyData.innerHTML = tableBodyHTML;
};

$(document).ready(function () {
  $("#hide-sidebar-toggle-button").click();
  entriesPerPageElement.value = 10;
  // $("#to_updated_at").flatpickr()
  // $("#from_updated_at").flatpickr()

  // $("#to_start_date").flatpickr()
  // $("#from_start_date").flatpickr()
  // $("#to_start_date").val(new Date().toDateInputValue())

  // $("#to_End_Date").flatpickr()
  // $("#from_End_Date").flatpickr()

  entriesPerPageElement.value = "10";
  filterObject.entriesPerPage = entriesPerPageElement.value;

  // filterObject.to_expiry_date = document.querySelector(
  //     "#to_expiry_date"
  // ).value

  getTableBody();
  // SELECT_OPTIONS.cardIssuersInSelect('CardIssuer-second')
});
