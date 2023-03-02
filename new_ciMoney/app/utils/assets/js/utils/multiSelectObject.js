const MULTISELECT_OBJECT = function ({ options, dropdownOptions, selectedOptions, selectBox, dropdownToggleIcon, selectBoxDropdown, searchInput, selectBoxSelected, url, title, label }) {
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
        let html = ``;
        [...options].sort((a, b) => Object.entries(a)[1][1].trim().localeCompare(Object.entries(b)[1][1].trim()), 'en-US', { numeric: true, sensitivity: 'base' }).map((option) => {
            html += `<option class='dropdownOption' >${Object.entries(option)[1][1]}</option>`
        })
        this.selectBoxDropdown.innerHTML = html
    },
    fillUpSelected: function (options) {
        let html = ``;
        [...options].sort((a, b) => Object.entries(a)[1][1].trim().localeCompare(Object.entries(b)[1][1].trim()), 'en-US', { numeric: true, sensitivity: 'base' }).map((option) => {
            html += `<div class='selectedOption'>
                            <span>${Object.entries(option)[1][1]}</span>
                            <button class="material-icons material-symbols-outlined minusBtn ">remove</button>
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
            this.selectedOptions.add(this.options.find(option => Object.entries(option)[1][1] === e.target.textContent))
            this.dropdownOptions.delete(this.options.find(option => Object.entries(option)[1][1] === e.target.textContent))
            this.fillUpSelected(this.selectedOptions)
            e.target.remove()
            this.updateTitle()
        }
    },
    getItemsDropdownAjax: function (prevSelectedOptions = undefined) {

        const self = this
        $.ajax({
            url: self.url,
            method: "GET",
            success: function (result) {
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
            }
        })
    },
    updateTitle: function () {
        this.label.textContent = `${this.title} (${[...this.selectedOptions].length})`
    }

}
let brands, creditCards, cardIssuers, lounges, offers
const enableMultiSelect = function (prevSelectedOptions = undefined) {
    // const multiselectOptions = ['brands', 'creditCards', 'cardIssuers']
    const multiselectOptions = ['creditCards']
    multiselectOptions.map((elem) => {

        let title, url
        if (elem === 'brands') {
            title = 'Brands'
            url = '/getbrandsnameforrelation'
        }
        else if (elem === 'creditCards') {
            title = 'Credit Cards'
            url = '/creditcardforrelation'
        }
        else {
            title = 'Card Issuers'
            url = '/cardissuersforrelation'
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
            label: document.getElementById(`${elem}Label`)
        })
        if (elem === 'brands') {
            brands = ELEM
        }
        else if (elem === 'creditCards') {
            creditCards = ELEM
        }
        else {
            cardIssuers = ELEM
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
        document.getElementById(`${elem}Dropdown`).addEventListener("click", (e) =>
            ELEM.dropdownOptionClickEvent(e)
        )
        if (prevSelectedOptions && prevSelectedOptions[elem])
            ELEM.getItemsDropdownAjax(prevSelectedOptions[elem])
        else
            ELEM.getItemsDropdownAjax()
        // if (prevSelectedOptions[elem] && prevSelectedOptions[elem]?.length > 0) {
        //     ELEM.getItemsDropdownAjax()
        //     prevSelectedOptions[elem].forEach(item => ELEM.selectedOptions.add(item))
        //     ELEM.fillUpSelected([...ELEM.selectedOptions])
        //     prevSelectedOptions[elem].forEach(item => {
        //         console.log([...ELEM.dropdownOptions].length)
        //         ELEM.dropdownOptions = new Set([...ELEM.options].filter((el) => JSON.stringify(el) != JSON.stringify(item)))
        //         console.log([...ELEM.dropdownOptions].length)

        //     })

        //     ELEM.fillUpDropdown(ELEM.dropdownOptions)
        //     ELEM.updateTitle()
        // }
    })
}

const enableMultiSelectLounge = function (prevSelectedOptions = undefined) {
    const multiselectOptions = ['loungeNetworks', 'creditCards']
    multiselectOptions.map((elem) => {

        let title, url
        if (elem === 'loungeNetworks') {
            title = 'Lounge Networks'
            url = '/loungenetworksforrelation'
        }
        else if (elem === 'creditCards') {
            title = 'Credit Cards'
            url = '/creditcardforrelation'
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
            label: document.getElementById(`${elem}Label`)
        })
        if (elem === 'loungeNetworks') {
            loungeNetworks = ELEM
        }
        else if (elem === 'creditCards') {
            creditCards = ELEM
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
        document.getElementById(`${elem}Dropdown`).addEventListener("click", (e) =>
            ELEM.dropdownOptionClickEvent(e)
        )
        if (prevSelectedOptions && prevSelectedOptions[elem])
            ELEM.getItemsDropdownAjax(prevSelectedOptions[elem])
        else
            ELEM.getItemsDropdownAjax()
    })
}

const enableMultiSelectCardIssuers = function (prevSelectedOptions = undefined) {
    const multiselectOptions = ['offers', 'creditCards']
    multiselectOptions.map((elem) => {

        let title, url
        if (elem === 'offers') {
            title = 'Offers'
            url = '/offersforrelation'
        }
        else if (elem === 'creditCards') {
            title = 'Credit Cards'
            url = '/creditcardforrelation'
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
            label: document.getElementById(`${elem}Label`)
        })
        if (elem === 'offers') {
            offers = ELEM
        }
        else if (elem === 'creditCards') {
            creditCards = ELEM
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
        document.getElementById(`${elem}Dropdown`).addEventListener("click", (e) =>
            ELEM.dropdownOptionClickEvent(e)
        )
        if (prevSelectedOptions && prevSelectedOptions[elem])
            ELEM.getItemsDropdownAjax(prevSelectedOptions[elem])
        else
            ELEM.getItemsDropdownAjax()
    })
}

const enableMultiSelectCreditCards = function (prevSelectedOptions = undefined) {
    const multiselectOptions = ['offers', 'lounges']
    multiselectOptions.map((elem) => {

        let title, url
        if (elem === 'offers') {
            title = 'Offers'
            url = '/offersforrelation'
        }
        else if (elem === 'lounges') {
            title = 'Lounges'
            url = '/loungesforrelation'
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
            label: document.getElementById(`${elem}Label`)
        })
        if (elem === 'offers') {
            offers = ELEM
        }
        else if (elem === 'lounges') {
            lounges = ELEM
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
        document.getElementById(`${elem}Dropdown`).addEventListener("click", (e) =>
            ELEM.dropdownOptionClickEvent(e)
        )
        if (prevSelectedOptions && prevSelectedOptions[elem])
            ELEM.getItemsDropdownAjax(prevSelectedOptions[elem])
        else
            ELEM.getItemsDropdownAjax()
    })
}

const enableMultiSelectAirport = function (prevSelectedOptions = undefined) {
    const multiselectOptions = ['lounges']
    multiselectOptions.map((elem) => {

        let title = 'Lounges', url = '/loungesforrelation'
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
            label: document.getElementById(`${elem}Label`)
        })
        lounges = ELEM

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
        document.getElementById(`${elem}Dropdown`).addEventListener("click", (e) =>
            ELEM.dropdownOptionClickEvent(e)
        )
        if (prevSelectedOptions && prevSelectedOptions[elem])
            ELEM.getItemsDropdownAjax(prevSelectedOptions[elem])
        else
            ELEM.getItemsDropdownAjax()
    })
}
const enableMultiSelectBrand = function (prevSelectedOptions = undefined) {
    const multiselectOptions = ['offers']
    multiselectOptions.map((elem) => {

        let title = 'Offers', url = '/offersforrelation'
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
            label: document.getElementById(`${elem}Label`)
        })
        offers = ELEM

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
        document.getElementById(`${elem}Dropdown`).addEventListener("click", (e) =>
            ELEM.dropdownOptionClickEvent(e)
        )
        if (prevSelectedOptions && prevSelectedOptions[elem])
            ELEM.getItemsDropdownAjax(prevSelectedOptions[elem])
        else
            ELEM.getItemsDropdownAjax()
    })
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
}
