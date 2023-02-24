let sort = ""
let pageNo
let entries = document.querySelector("#entries")
let tableHeader = document.querySelector("#table-header")
let filterReset = document.getElementById("filterReset")
let filterObject = {}
let prevPage = document.querySelector('#prevPage')
let nextPage = document.querySelector('#nextPage')
let tableFilter = document.querySelector("#table-filter-row")//offers
let entriesPerPageElement =
    document.querySelector("#entriesPerPage")
let pageNoElement = document.querySelector("#page-no")
pageNo = pageNoElement.value
let pages = document.querySelector("#pages")
let tableBodyData = document.querySelector("#data-to-show")
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]
Date.prototype.toDateInputValue = function () {
    var local = new Date(this)
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset())
    return local.toJSON().slice(0, 10)
}

function createElementFromHTML(htmlString) {
    var div = document.createElement("div")
    div.innerHTML = htmlString.trim()

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.childNodes
}

const deleteFunction = (url, id) => {
    $.ajax({
        url: `${url}/${id}`,
        type: "DELETE",
        contentType: "application/json",
        success: () => {
            location.reload()
        }
    })
}
const duplicate = (id, item) => {
    //console.log(id)
    $.ajax({
        url: `/edit-${item}?id=${id}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",

        success: function (result) {
            console.log(result)
            $.ajax({
                url: `/post-new${item}?duplicate=true`,
                type: "POST",
                contentType: "application/json",
                dataType: 'json',
                data: JSON.stringify({
                    item: result.payload[`${item}Detail`]
                }),
                success: function (result) {
                    //console.log(result)
                    const duplicateItemId = result.payload.id
                    //console.log(duplicateItemId)
                    window.open(`/edit-${item}?id=${duplicateItemId}`, "_blank")
                    // location.reload()
                }
            })
        }
    })
}
const tableHeaderEventListener = (e, getTableBody) => {
    if (
        e.target.dataset.filter && (e.target.tagName === "ICON" ||
            e.target.tagName === "SPAN")
    ) {
        pageNo = 1
        pageNoElement.value = 1

        if (

            e.target.dataset.filter !==
            e.currentTarget.dataset.filter
        ) {
            let currentArr
            if (e.currentTarget.dataset.ignoreFirst == 1)
                currentArr = [...e.currentTarget.children].filter((e, i) => i > 0)
            else
                currentArr = [...e.currentTarget.children]
            currentArr.map((elem, i, arr) => {
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
tableFilter.addEventListener("change", (e) => {
    if (
        (e.target.tagName === "INPUT" ||
            e.target.tagName === "SELECT" ||
            e.target.tagName === "TEXTAREA") && e.target.id !== "allCheck"
    ) {
        if (e.target.type === 'checkbox')
            filterObject[e.target.name] = e.target.checked
        else {
            console.log(e.target.value)
            filterObject[e.target.name] = e.target.value
        }
        pageNoElement.value = 1
        pageNo = 1
        getTableBody()
    }
})
entriesPerPageElement.onchange = (e) => {
    filterObject.entriesPerPage = entriesPerPageElement.value
    getTableBody()
}
pageNoElement.onchange = (e) => {
    // console.log(pageNoElement.getAttribute('max'))
    if (e.target.value < 1) {
        pageNoElement.value = 1
        pageNo = 1
    }
    else if (+e.target.value > +pageNoElement.getAttribute('max')) {
        pageNoElement.value = pageNoElement.getAttribute('max')
        pageNo = pageNoElement.getAttribute('max')
    }
    else {
        pageNo = e.target.value
    }

    getTableBody()
}
const rowClick = (e, id, url) => {
    if (!e.target.classList.contains('action-btns')) {
        window.open(`/${url}?id=${id}`, '_blank')
    }
}
tableHeader.addEventListener("click", (e) => tableHeaderEventListener(e, getTableBody))
