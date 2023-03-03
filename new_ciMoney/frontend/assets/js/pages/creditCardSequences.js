const applySequenceDraggableContainer = document.querySelector('.draggable-field-container-apply-sequence')
const sequenceDraggableContainer = document.querySelector('.draggable-field-container-sequence')
const toast = new bootstrap.Toast(document.getElementById('errorToast'))
const toastMessage = document.getElementById('errorToastMessage')
const ciSelect = document.getElementById('ciSelect')
let applySequenceOrder = []
let sequenceOrder = []
const updateOrderApplySequence = function () {
    let html = ``
    let arr = [...applySequenceDraggableContainer.children]
    applySequenceOrder = []
    arr.forEach((node, i) => {
        let text = node.querySelector('span').innerText
        let id = node.querySelector('span').id.split('-')[1]
        applySequenceOrder.push({ id, CreditCardName: text })
        html += `<div class="draggableApplySequence" draggable="true">
        <span draggable="false" id='applySequence-${id}'>${text}</span>
        </div>`
    })
    console.log(applySequenceOrder)

    applySequenceDraggableContainer.innerHTML = html
}
const updateOrderSequence = function () {
    let html = ``
    let arr = [...sequenceDraggableContainer.children]
    sequenceOrder = []
    arr.forEach((node, i) => {
        let text = node.querySelector('span').innerText
        let id = node.querySelector('span').id.split('-')[1]
        sequenceOrder.push({ id, CreditCardName: text })
        html += `<div class="draggableSequence" draggable="true">
        <span draggable="false" id='sequence-${id}'>${text}</span>
        </div>`
    })

    sequenceDraggableContainer.innerHTML = html
}
const getCcApplySequenceData = function () {
    return $.ajax({
        url: `/apply-now-credit-card`,
        type: "GET",
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            applySequenceOrder = []
            const ciList = result.payload.creditCardsList
            let html = ``
            ciList.sort((a, b) => {
                if (a.Applynowsequence === null) {
                    return 1
                }

                if (b.Applynowsequence === null) {
                    return -1
                }

                if (a.Applynowsequence === b.Applynowsequence) {
                    return 0
                }

                return a.Applynowsequence < b.Applynowsequence ? -1 : 1
            }).forEach((el, i) => {
                applySequenceOrder.push({ id: el.id, CreditCardName: el.CreditCardName })
                html += `<div class="draggableApplySequence" draggable="true">
                <span draggable="false" id='applySequence-${el.id}'>${el.CreditCardName}</span>
                </div>`
            })
            applySequenceDraggableContainer.innerHTML = html
        }
    })
}
const getSequenceData = function (id) {
    console.log("Hey there", id)
    return $.ajax({
        url: `/credit-cards-sequence`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ cardIssuer: id }),
        success: function (result) {
            sequenceOrder = []
            const ciList = result.payload.creditCardsList
            let html = ``
            ciList.sort((a, b) => {
                if (a.cardsequence === null) {
                    return 1
                }

                if (b.cardsequence === null) {
                    return -1
                }

                if (a.cardsequence === b.cardsequence) {
                    return 0
                }

                return a.cardsequence < b.cardsequence ? -1 : 1
            }).forEach((el, i) => {
                sequenceOrder.push({ id: el.id, CreditCardName: el.CreditCardName })
                html += `<div class="draggableSequence" draggable="true">
                <span draggable="false" id='sequence-${el.id}'>${el.CreditCardName}</span>
                </div>`
            })
            sequenceDraggableContainer.innerHTML = html
        }
    })
}
function getDragAfterElementSequence(y) {
    const draggableElements = [...sequenceDraggableContainer.querySelectorAll('.draggableSequence:not(.draggingSequence)')]

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}
function getDragAfterElementApplySequence(y) {
    const draggableElements = [...applySequenceDraggableContainer.querySelectorAll('.draggableApplySequence:not(.draggingApplySequence)')]

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}
applySequenceDraggableContainer.addEventListener('dragstart', e => {
    if (e.target.classList.contains('draggableApplySequence')) {
        e.target.classList.add('draggingApplySequence')
    }
})
applySequenceDraggableContainer.addEventListener('dragend', e => {
    if (e.target.classList.contains('draggableApplySequence') && e.target.classList.contains('draggingApplySequence')) {
        e.target.classList.remove('draggingApplySequence')
        updateOrderApplySequence()
    }
})
applySequenceDraggableContainer.addEventListener('dragover', (e) => {
    e.preventDefault()
    const afterElement = getDragAfterElementApplySequence(e.clientY)
    const draggable = document.querySelector('.draggingApplySequence')
    if (afterElement === null) {
        applySequenceDraggableContainer.appendChild(draggable)
    } else {
        applySequenceDraggableContainer.insertBefore(draggable, afterElement)
    }
})
sequenceDraggableContainer.addEventListener('dragstart', e => {
    if (e.target.classList.contains('draggableSequence')) {
        e.target.classList.add('draggingSequence')
    }
})
sequenceDraggableContainer.addEventListener('dragend', e => {
    if (e.target.classList.contains('draggableSequence') && e.target.classList.contains('draggingSequence')) {
        e.target.classList.remove('draggingSequence')
        updateOrderSequence()
    }
})
sequenceDraggableContainer.addEventListener('dragover', (e) => {
    e.preventDefault()
    const afterElement = getDragAfterElementSequence(e.clientY)
    const draggable = document.querySelector('.draggingSequence')
    if (afterElement === null) {
        sequenceDraggableContainer.appendChild(draggable)
    } else {
        sequenceDraggableContainer.insertBefore(draggable, afterElement)
    }
})

document.getElementById('apply-sequence-reset').addEventListener('click', async () => {
    await getCcApplySequenceData()
})
document.getElementById('save-apply-sequence').addEventListener('click', async () => {
    $('#loader').show()
    $.ajax({
        url: `/update-credit-card-apply-sequence`,
        type: "PUT",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({
            applySequence: applySequenceOrder
        }),

        success: function (result) {
            $('#loader').hide()
            location.reload()
        },
        error(xhr, status, error) {
            // console.log(xhr.responseJSON.message)
            toastMessage.innerText = xhr.responseJSON.message
            toast.show()
            $('#loader').hide()
        }
    })
})
document.getElementById('save-card-sequence').addEventListener('click', async () => {
    $('#loader').show()
    $.ajax({
        url: `/update-credit-card-sequence`,
        type: "PUT",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({
            cardIssuer: ciSelect.value,
            sequence: sequenceOrder
        }),

        success: function (result) {
            $('#loader').hide()
        },
        error(xhr, status, error) {
            // console.log(xhr.responseJSON.message)
            toastMessage.innerText = xhr.responseJSON.message
            toast.show()
            $('#loader').hide()
        }
    })
})
const getCardIssuers = function () {
    console.log("hi again")
    return $.ajax({
        url: `/card-issuers-sequence`,
        type: "GET",
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            const ciList = result.payload.cardIssuersList
            let html = `<option value="">Select Card Issuer</option>`
            ciList.sort((a, b) => {
                if (a.IssuerName > b.IssuerName) {
                    return 1
                }
                if (a.IssuerName < b.IssuerName) {
                    return -1
                }
                return 0
            }).forEach(obj => {
                html += `<option value=${obj.id}>${obj.IssuerName}</option>`
            })
            ciSelect.innerHTML = html
        }

    })
}

ciSelect.addEventListener('input', e => {
    if (e.target.value) {
        sequenceDraggableContainer.parentNode.classList.remove('hidden')
        getSequenceData(e.target.value)
    }
    else
        sequenceDraggableContainer.parentNode.classList.add('hidden')
})
$('document').ready(async () => {
    await getCcApplySequenceData()
    await getCardIssuers()
})