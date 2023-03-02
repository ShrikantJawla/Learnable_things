let sort = ""
let pageNo
let entries = document.querySelector("#entries")
let tableHeader = document.querySelector("#table-header")
let filterObject = {}
let prevPage = document.querySelector('#prevPage')
let nextPage = document.querySelector('#nextPage')
let entriesPerPageElement =
    document.querySelector("#entriesPerPage")
let pageNoElement = document.querySelector("#page-no")
pageNo = pageNoElement.value
let pages = document.querySelector("#pages")
let tableBodyData = document.querySelector("#data-to-show")


const tableHeaderEventListener = (e, getTableBody) => {
    if (
        e.target.tagName === "ICON" ||
        e.target.tagName === "SPAN"
    ) {
        pageNo = 1
        pageNoElement.value = 1
        if (
            e.target.dataset.filter !==
            e.currentTarget.dataset.filter
        ) {
            [...e.currentTarget.children].map((elem, i, arr) => {
                if (i !== arr.length - 1) {
                    // //console.log(elem.children[0])
                    if (
                        elem.children[0].children[1].classList.contains(
                            "upside-down"
                        )
                    ) {
                        elem.children[0].children[1].classList.remove(
                            "upside-down"
                        )
                    }
                    if (
                        !elem.children[0].children[1].classList.contains(
                            "invisible"
                        )
                    ) {
                        elem.children[0].children[1].classList.add("invisible")
                    }
                }
            })
            sort = `-${e.target.dataset.filter}`
            e.currentTarget.dataset.filterValue = -1
            e.currentTarget.dataset.filter =
                e.target.dataset.filter
            // //console.log(e.target.parent.children[1]);
            e.target.parentNode.children[1].classList.remove(
                "invisible"
            )
            e.target.parentNode.children[1].classList.add(
                "upside-down"
            )
        } else {
            if (e.currentTarget.dataset.filterValue * 1 === 1) {
                e.currentTarget.dataset.filterValue = 0
                e.target.parentNode.children[1].classList.add(
                    "invisible"
                )
                sort = ``
            } else if (
                e.currentTarget.dataset.filterValue * 1 ===
                0
            ) {
                sort = `-${e.target.dataset.filter}`
                e.currentTarget.dataset.filterValue = -1
                e.target.parentNode.children[1].classList.remove(
                    "invisible"
                )
                e.target.parentNode.children[1].classList.add(
                    "upside-down"
                )
                // //console.log("In 0")
            } else {
                sort = `${e.target.dataset.filter}`
                e.currentTarget.dataset.filterValue = 1
                e.target.parentNode.children[1].classList.remove(
                    "upside-down"
                )
            }
        }
        getTableBody()
    }
}

prevPage.addEventListener('click', () => {
    // //console.log("Hey from page down")
    pageNoElement.value = pageNoElement.value * 1 > 1 ? pageNoElement.value * 1 - 1 : 1
    pageNo = pageNoElement.value
    getTableBody()

})
nextPage.addEventListener('click', () => {
    pageNoElement.value = pageNoElement.value * 1 < pageNoElement.getAttribute('max') * 1 ? pageNoElement.value * 1 + 1 : pageNoElement.getAttribute('max') * 1
    pageNo = pageNoElement.value
    getTableBody()

})

entriesPerPageElement.onchange = (e) => {
    filterObject.entriesPerPage = entriesPerPageElement.value
    getTableBody()
}
pageNoElement.onchange = (e) => {
    console.log(pageNoElement.getAttribute('max'))
    if (e.target.value < 1) {
        pageNoElement.value = 1
        pageNo = 1
    }
    else if (e.target.value > pageNoElement.getAttribute('max')) {
        pageNoElement.value = pageNoElement.getAttribute('max')
        pageNo = pageNoElement.getAttribute('max')
    }
    else {
        pageNo = e.target.value
    }
    getTableBody()
}

tableHeader.addEventListener("click", (e) => tableHeaderEventListener(e, getTableBody))

let getTableBody = async () => {
    const tableBodyData = document.querySelector("#data-to-show")
    tableBodyData.innerHTML = `
    <tr >
        <td colspan="5">
            <div class="d-flex justify-content-center align-items-center">
                <div class="sbl-circ-path"></div>
                </div>
        </td>
    </tr>`
    const res = await fetch("/users/filteredUserAdmins", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            filterObject,
            pageNo,
            sort,
        }),
    })
    const { payload } = await res.json()
    const { userAdminList, count } = payload
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    console.log(userAdminList)
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )
    let tableBodyHTML = ""
    for (i = 0; i < userAdminList.length; i++) {
        let showTeleNumber  = "";
        if(userAdminList[i]["ua_tele_number"] != null){
            showTeleNumber = userAdminList[i]["ua_tele_number"].slice(3, userAdminList[i]["ua_tele_number"].length);
        }
       
        tableBodyHTML = tableBodyHTML + `
        <tr style=" font-size:13px;" class="tableRow" >
            <td style="text-align:center;">${userAdminList[i]["ua_id"]}</td>
            <td style="text-align:center;">${userAdminList[i]["ua_name"]}</td>
            <td style="text-align:center;">${userAdminList[i]["ua_email"]}</td>
            <td style="text-align:center;">${userAdminList[i]["uar_role_name"]}</td>
            <td style="text-align:center;">${showTeleNumber}</td>
            <td style="text-align:center;">${userAdminList[i]["active_user"]}</td>
            <td style="text-align:center;">
                <a '
                ><i class="material-icons has-sub-menu action-btns"         data-bs-toggle="modal"
                        data-bs-target="#ciUpdateAdminUserForm"
                        data-up-id=" ${userAdminList[i]["ua_id"]}"
                        data-up-name="${userAdminList[i]["ua_name"]}"
                        data-up-email="${userAdminList[i]["ua_email"]}"
                        data-up-telenumber="${showTeleNumber}"
                        data-up-role="${userAdminList[i]["ua_role"]}"
                        data-up-activeuser="${userAdminList[i]["active_user"]}"
                        >edit</i></a>
            </td>
        </tr>
        `
    }
    tableBodyData.innerHTML = tableBodyHTML
}


$(document).ready(function () {
    $('#hide-sidebar-toggle-button').click()
    entriesPerPageElement.value = "10"
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value
    getTableBody()
})