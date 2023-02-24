const saveBtn = document.getElementById('save-application')
const leftForm = document.getElementById('left-form')
const fields = {
    "Bank of Baroda": {
        "application_number": {
            order: 1,
            colSpan: 6,
            dataType: "text"
        },
        "application_date": {
            order: 2,
            colSpan: 6,
            dataType: "date"
        },
        "utm_source": {
            order: 3,
            colSpan: 6,
            dataType: "text"
        },
        "application_status": {
            order: 4,
            colSpan: 6,
            dataType: "text",
        },
        "stage": {
            order: 5,
            colSpan: 6,
            dataType: "text"
        },
        "phone_number": {
            order: 6,
            colSpan: 6,
            dataType: "text"
        },
        "reject_reason": {
            order: 7,
            colSpan: 6,
            dataType: "text"
        }
    },
    "Axis Bank": {
        "application_number": {
            order: 1,
            colSpan: 6,
            dataType: "text"
        },
        "application_date": {
            order: 2,
            colSpan: 6,
            dataType: "date"
        },
        "phone_number": {
            order: 3,
            colSpan: 6,
            dataType: "text"
        },
        "ipa_status": {
            order: 4,
            colSpan: 6,
            dataType: "text"
        },
        "reason": {
            order: 5,
            colSpan: 6,
            dataType: "text"
        },
        "final_status": {
            order: 6,
            colSpan: 6,
            dataType: "text"
        }
    },
    "AU Bank": {
        "lead_id": {
            order: 1,
            colSpan: 6,
            dataType: "text"
        },
        "application_date": {
            order: 2,
            colSpan: 6,
            dataType: "date"
        },
        "current_status": {
            order: 3,
            colSpan: 6,
            dataType: "text"
        },
        "reject_reason": {
            order: 4,
            colSpan: 6,
            dataType: "text"
        },
        "utm_campaign": {
            order: 7,
            colSpan: 6,
            dataType: "text"
        },
        "utm_term": {
            order: 8,
            colSpan: 6,
            dataType: "text"
        },
    },
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
const fillUpLeftForm = (cardIssuer, id) => {
    $.ajax({
        type: "POST",
        url: "/creditcardbyissuer-ajax",
        data: { id },
        dataType: "json",
        success: (res) => {
            let creditCardsList = res.payload
            const ciFields = fields[cardIssuer]
            leftForm.innerHTML = ``
            let html = "<div class='row'>"
            Object.keys(ciFields).sort((a, b) => ciFields[a]['order'] - ciFields[b]['order']).forEach(key => {
                const title = key.split('_').map(k => capitalizeFirstLetter(k)).join(' ')
                switch (ciFields[key]['dataType']) {
                    case 'text':
                        html += `<div class="col-${ciFields[key]['colSpan']} mt-3">
                            <label for="${key}" class="form-label">${title}</label>
                            <input type="text" class="form-control" id="${key}" name="${key}" required>
                        </div>`
                        break
                    case 'date':
                        html += `<div class="col-${ciFields[key]['colSpan']} mt-3">
                            <label for="${key}" class="form-label">${title}</label>
                            <input type="date" class="form-control" id="${key}" 
                            placeholder="yyyy-mm-dd"
                            name="${key}" required>
                        </div>`
                        break
                    default:


                }
            })
            html += `
            <div class="col-6 mt-3">
                <label for="creditCard"  class="form-label">Credit Card</label>
                <select class="form-control form-select" id="creditCard" name="creditCard">
                    <option value="">Select a Credit Card</option>
           `
            creditCardsList.forEach(el => {
                html += `<option value="${el.id}">${el.CreditCardName}</option>`
            })
            html += `
                    </select>
                </div>
            </div>
            `
            leftForm.innerHTML = html
            $('#application_date').flatpickr()
        },
    })


}
multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'OPTION'].includes(e.target.tagName)) {
        const selectedCi = getSelectedOptions('cardIssuers')
        const cardIssuer = selectedCi[0]?.IssuerName.trim()
        if (fields.hasOwnProperty(cardIssuer)) {
            fillUpLeftForm(cardIssuer, selectedCi[0].id)
        }
        else {
            leftForm.innerHTML = ``
        }
    }

})
$(document).ready(function () {
    $('#application_date').flatpickr()
    // enableUniMultiSelect(undefined, true, 'creditCards', false)
    enableUniMultiSelect(undefined, true, 'cardIssuers', false)
    // enableUniMultiSelect(undefined, true, 'ciUsers', false)
    // enableUniMultiSelect(undefined, true, 'refferedBy', false)
})