const MULTISELECT_OBJECT = function ({ options, dropdownOptions, selectedOptions, selectBox, dropdownToggleIcon, selectBoxDropdown, searchInput, selectBoxSelected, url, title, label, isUni, disabledDelete }) {
    this.label = label
    this.title = title
    this.options = options
    this.dropdownOptions = dropdownOptions
    this.selectedOptions = selectedOptions
    this.selectBox = selectBox
    this.dropdownToggleIcon =
        dropdownToggleIcon
    this.selectBoxDropdown = selectBoxDropdown
    this.searchInput = searchInput
    this.selectBoxSelected = selectBoxSelected
    this.url = url
    this.isUni = isUni
    this.disabledDelete = disabledDelete || false
}
MULTISELECT_OBJECT.prototype = {
    constructor: MULTISELECT_OBJECT,
    openDropdown: function () {
        this.dropdownToggleIcon.textContent = "expand_less"
        if (
            this.selectBoxDropdown.classList.contains(
                "dropdownHidden"
            )
        )
            this.selectBoxDropdown.classList.remove(
                "dropdownHidden"
            )
    },
    closeDropdown: function () {
        this.dropdownToggleIcon.textContent = "expand_more"
        if (
            !this.selectBoxDropdown.classList.contains(
                "dropdownHidden"
            )
        )
            this.selectBoxDropdown.classList.add("dropdownHidden")
    },
    fillUpDropdown: function (options) {
        let showId = false
        // if (Object.keys(options[0])[1] === 'FullName') showId = true
        let html = ``;
        [...options].sort((a, b) => Object.entries(a)[1][1].trim().localeCompare(Object.entries(b)[1][1].trim()), 'en-US', { numeric: true, sensitivity: 'base' }).map((option) => {
            // <span class=${option.published_at ? 'publishedOption' : 'unpublishedOption'}>${option.published_at ? 'P' : 'U'}</span>
            // <span>${Object.entries(option)[1][1]}</span>
            // html += showId ? `
            // <option class='dropdownOption ' >${Object.entries(option)[1][1]}(${Object.entries(option)[0][1]})</option>` : `
            // <option class='dropdownOption ' >${Object.entries(option)[1][1]}</option>`
            html += `<option class='dropdownOption ' >${Object.entries(option)[1][1]}</option>`
        })
        this.selectBoxDropdown.innerHTML = html
    },
    fillUpSelected: function (options) {
        let html = ``;
        
        [...options].sort((a, b) => Object.entries(a)[1][1].trim().localeCompare(Object.entries(b)[1][1].trim()), 'en-US', { numeric: true, sensitivity: 'base' }).map((option) => {
            // <span class=${option.published_at ? 'publishedOption' : 'unpublishedOption'}>${option.published_at ? 'P' : 'U'}</span>
            html += `<div class='selectedOption' >
                            <a data-id='${option.id}' class='selectedOptionLink'>${Object.entries(option)[1][1]}</a>
                            <button class="material-icons material-symbols-outlined minusBtn " ${this.disabledDelete ? "disabled" : ""}>remove</button>
                    </div>`
        })
        this.selectBoxSelected.innerHTML = html
    },
    dropDownToggleEvent: function (e) {
        e.preventDefault()
        if (
            this.selectBoxDropdown.classList.contains(
                "dropdownHidden"
            )
        ) {
            this.openDropdown()
        } else {
            this.closeDropdown()
        }
    },
    inputChangeEvent: function (e) {
        const newOptions = [...this.dropdownOptions].filter(
            (option) => Object.entries(option)[1][1].toLowerCase().includes(e.target.value.toLowerCase())
        )
        this.fillUpDropdown(newOptions)
        this.openDropdown()
    },
    documentEvent: function (e) {
        if (
            !e.target.classList.contains("input-expand-icon") &&
            !e.target.classList.contains("dropdownOption") &&
            !e.target.classList.contains("multiSelectInput") &&
            !this.selectBoxDropdown.classList.contains(
                "dropdownHidden"
            )
        ) {
            this.closeDropdown()
            this.searchInput.value = ""
        }
    },
    selectedBoxMinusButtonEvent: function (e) {
        this.dropdownOptions.add(
            this.options.find(option => Object.entries(option)[1][1] === e.target.parentNode.childNodes[1].textContent)

        )
        this.selectedOptions.delete(
            [...this.selectedOptions].find(option => Object.entries(option)[1][1] === e.target.parentNode.childNodes[1].textContent)

        )
        this.fillUpSelected(this.selectedOptions)
        this.fillUpDropdown(this.dropdownOptions)
        this.updateTitle()
    },
    dropdownOptionClickEvent: function (e) {
        if (e.target.tagName === "OPTION") {
            if (this.isUni) {
                if (this.selectedOptions && [...this.selectedOptions].length) {
                    this.dropdownOptions.add([...this.selectedOptions][0])
                }
                this.selectedOptions = new Set([this.options.find(option => Object.entries(option)[1][1] === e.target.textContent)])
                this.dropdownOptions.delete(this.options.find(option => Object.entries(option)[1][1] === e.target.textContent))
                this.fillUpSelected(this.selectedOptions)
                e.target.remove()
                this.updateTitle()
                this.closeDropdown()
            }
            else {
                this.selectedOptions.add(this.options.find(option => Object.entries(option)[1][1] === e.target.textContent))
                this.dropdownOptions.delete(this.options.find(option => Object.entries(option)[1][1] === e.target.textContent))
                this.fillUpSelected(this.selectedOptions)
                e.target.remove()
                this.updateTitle()
            }

        }
    },
    getItemsDropdownAjax: async function (prevSelectedOptions = undefined) {

        const self = this
        const response = await fetch(self.url)
        const result = await response.json()
        self.options = result.payload
        self.dropdownOptions = new Set(self.options)
        if (prevSelectedOptions) {
            prevSelectedOptions.forEach(item => self.selectedOptions.add(item))
            prevSelectedOptions.forEach(item => {

                self.dropdownOptions = new Set([...self.dropdownOptions].filter((el) => JSON.stringify(el) != JSON.stringify(item)))
            })
        }
        self.fillUpSelected([...self.selectedOptions])
        self.fillUpDropdown([...self.dropdownOptions])
        self.updateTitle()
        // $.ajax({
        //     url: self.url,
        //     method: "GET",
        //     success: function (result) {
        //         self.options = result.payload
        //         self.dropdownOptions = new Set(self.options)
        //         if (prevSelectedOptions) {
        //             prevSelectedOptions.forEach(item => self.selectedOptions.add(item))
        //             prevSelectedOptions.forEach(item => {

        //                 self.dropdownOptions = new Set([...self.dropdownOptions].filter((el) => JSON.stringify(el) != JSON.stringify(item)))
        //             })
        //         }
        //         self.fillUpSelected([...self.selectedOptions])
        //         self.fillUpDropdown([...self.dropdownOptions])
        //         self.updateTitle()
        //     }
        // })
    },
    updateTitle: function () {
        if (this.isUni) {
            if (this.label.textContent.endsWith('s'))
                this.label.textContent = `${this.title.slice(0, -1)}`
            else
                this.label.textContent = `${this.title}`
        }
        else {
            this.label.textContent = `${this.title} (${[...this.selectedOptions].length})`
        }
    },
    selectedOptionRedirect: function (e, item) {
        if (e.target.tagName === 'A') {
            if (item === 'refferedBy' || item === 'ciUsers') {
                window.open(`/edit-ciUser?id=${e.target.dataset.id}`, '_blank')
            }
            else
                window.open(`/edit-${item.slice(0, -1)}?id=${e.target.dataset.id}`, '_blank')
        }
    }

}
let brands, creditCards, cardIssuers, lounges, offers, airports, refferedBy, loungeNetworks, cardApplications, ciUsers

const enableUniMultiSelect = async function (prevSelectedOptions = undefined, isUni = false, elem, disabledDelete = false) {
    let title, url
    if (disabledDelete) {
        $(`#${elem}Input`).prop('disabled', true)
        $(`#${elem}DropdownIcon`).prop('disabled', true)
    }
    if (elem === 'loungeNetworks') {
        title = 'Lounge Networks'
        url = '/loungenetworksforrelation'
    }
    else if (elem === 'creditCards') {
        title = 'Credit Cards'
        url = '/creditcardforrelation'
    }
    else if (elem === 'brands') {
        title = 'Brands'
        url = '/brandsnameforrelation'
    }
    else if (elem === 'cardIssuers') {
        title = 'Card Issuers'
        url = '/cardissuersforrelation'
    }
    else if (elem === 'offers') {
        title = 'Offers'
        url = '/offersforrelation'
    }
    else if (elem === 'lounges') {
        title = 'Lounges'
        url = '/loungesforrelation'
    }
    else if (elem === 'airports') {
        title = 'Airports'
        url = '/airportsforrelation'
    }
    else if (elem === 'cardApplications') {
        title = 'Card Applications'
        url = '/cardapplicationsnameforrelation'
    }

    else if (elem === 'refferedBy') {
        title = 'Reffered By'
        url = '/referralnamesforrelation'
    }
    else if (elem === 'ciUsers') {
        title = 'Card Insider User'
        url = '/referralnamesforrelation'
    }
    const ELEM = new MULTISELECT_OBJECT({
        options: [],
        dropdownOptions: new Set([]),
        selectedOptions: new Set([]),
        selectBox: document.getElementById(`${elem}SelectBox`),
        dropdownToggleIcon: document.getElementById(`${elem}DropdownIcon`),
        selectBoxDropdown: document.getElementById(`${elem}Dropdown`),
        searchInput: document.getElementById(`${elem}Input`),
        selectBoxSelected: document.getElementById(`${elem}SelectBoxSelected`),
        url: `${url}`,
        title: `${title}`,
        label: document.getElementById(`${elem}Label`),
        isUni,
        disabledDelete
    })
    if (elem === 'loungeNetworks') {
        loungeNetworks = ELEM
    }
    else if (elem === 'creditCards') {
        creditCards = ELEM
    }
    else if (elem === 'brands') {
        brands = ELEM
    }
    else if (elem === 'cardIssuers') {
        cardIssuers = ELEM
    }
    else if (elem === 'offers') {
        offers = ELEM
    }
    else if (elem === 'lounges') {
        lounges = ELEM
    }
    else if (elem === 'airports') {
        airports = ELEM
    }

    document.getElementById(`${elem}DropdownIcon`).addEventListener("click", (e) =>
        ELEM.dropDownToggleEvent(e)
    )

    document.getElementById(`${elem}Input`).addEventListener("focus", (e) =>
        ELEM.inputChangeEvent(e)
    )
    document.getElementById(`${elem}Input`).addEventListener("input", (e) =>
        ELEM.inputChangeEvent(e)
    )
    document.addEventListener("click", (e) =>
        ELEM.documentEvent(e)
    )
    document.getElementById(`${elem}SelectBoxSelected`).addEventListener("click", (e) => {
        e.preventDefault()
        if (e.target.tagName === `BUTTON`) { ELEM.selectedBoxMinusButtonEvent(e) }
    }
    )
    document.getElementById(`${elem}Dropdown`).addEventListener("click", (e) => {
        ELEM.dropdownOptionClickEvent(e)
    }
    )
    document.getElementById(`${elem}SelectBoxSelected`).addEventListener('click', (e) => {
        ELEM.selectedOptionRedirect(e, elem)
    })
    if (prevSelectedOptions && prevSelectedOptions[elem])
        ELEM.getItemsDropdownAjax(prevSelectedOptions[elem])
    else
        ELEM.getItemsDropdownAjax()
}
const getSelectedOptions = function (elem) {
    if (elem === 'brands') {
        return [...brands.selectedOptions]
    }
    else if (elem === 'creditCards') {
        return [...creditCards.selectedOptions]
    }
    else if (elem === 'cardIssuers') {
        return [...cardIssuers.selectedOptions]
    }
    else if (elem === 'lounges') {
        return [...lounges.selectedOptions]
    }
    else if (elem === 'offers') {
        return [...offers.selectedOptions]
    }
    else if (elem === 'loungeNetworks') {
        return [...loungeNetworks.selectedOptions]
    }
    else if (elem === 'airports') {
        return [...airports.selectedOptions]
    }
    else if (elem === 'refferedBy') {
        return [...refferedBy.selectedOptions]
    }
    else if (elem === 'ciUsers') {
        return [...ciUsers.selectedOptions]
    }
    else if (elem === 'cardApplications') {
        return [...cardApplications.selectedOptions]
    }
}