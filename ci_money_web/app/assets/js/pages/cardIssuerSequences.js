const applySequenceDraggableContainer = document.querySelector('.draggable-field-container-apply-sequence')
const sequenceDraggableContainer = document.querySelector('.draggable-field-container-sequence')
const toast = new bootstrap.Toast(document.getElementById('errorToast'))
const toastMessage = document.getElementById('errorToastMessage')
let applySequenceOrder = []
let sequenceOrder = []
const updateOrderApplySequence = function () {
    let html = ``
    let arr = [...applySequenceDraggableContainer.children]
    applySequenceOrder = []
    arr.forEach((node, i) => {
        let text = node.querySelector('a').innerText
        let id = node.querySelector('a').href.split('?id=')[1]
        applySequenceOrder.push({ id, IssuerName: text })
        html += `<div class="draggableApplySequence" draggable="true">
                <span draggable="false" id="${id}">${text}</span>
                </div>`
    })
    applySequenceDraggableContainer.innerHTML = html
}
const updateOrderSequence = function () {
    let html = ``
    let arr = [...sequenceDraggableContainer.children]
    sequenceOrder = []
    arr.forEach((node, i) => {
        let text = node.querySelector('span').innerText
        let id = node.querySelector('span').id
        sequenceOrder.push({ id, IssuerName: text })
        html += `<div class="draggableSequence" draggable="true">
                <span draggable="false" id="${id}">${text}</span>
                </div>`
    })
    sequenceDraggableContainer.innerHTML = html
}
const getCiApplySequenceData = function () {
    return $.ajax({
        url: `/apply-now-card-issuers`,
        type: "GET",
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            applySequenceOrder = []
            const ciList = result.payload.cardIssuersList
            let html = ``
            ciList.sort((a, b) => {
                if (a.ApplySequence === null) {
                    return 1
                }

                if (b.ApplySequence === null) {
                    return -1
                }

                if (a.ApplySequence === b.ApplySequence) {
                    return 0
                }

                return a.ApplySequence < b.ApplySequence ? -1 : 1
            }).forEach((el, i) => {
                applySequenceOrder.push({ id: el.id, IssuerName: el.IssuerName })
                html += `<div class="draggableApplySequence" draggable="true">
                <span draggable="false" id="${el.id}">${el.IssuerName}</span>
                </div>`
            })
            applySequenceDraggableContainer.innerHTML = html
        }
    })
}
const getCiSequenceData = async function () {
    return $.ajax({
        url: `/card-issuers-sequence`,
        type: "GET",
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            sequenceOrder = []
            const ciList = result.payload.cardIssuersList
            let html = ``
            ciList.sort((a, b) => {
                if (a.sequence === null) {
                    return 1
                }

                if (b.sequence === null) {
                    return -1
                }

                if (a.sequence === b.sequence) {
                    return 0
                }

                return a.sequence < b.sequence ? -1 : 1
            }).forEach((el, i) => {
                sequenceOrder.push({ id: el.id, IssuerName: el.IssuerName })
                html += `<div class="draggableSequence" draggable="true">
                <span draggable="false" id="${el.id}">${el.IssuerName}</span>
                </div>`
            })
            sequenceDraggableContainer.innerHTML = html
            // console.log(applySequenceOrder, sequenceOrder)

        }
    })
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

document.getElementById('sequenceReset').addEventListener('click', async () => {
    await getCiApplySequenceData()
    await getCiSequenceData()

    console.log(sequenceOrder, applySequenceOrder)
})

document.getElementById('save-sequence').addEventListener('click', async () => {
    $('#loader').show()
    $.ajax({
        url: `update-card-issuer-sequence`,
        type: "PUT",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({
            sequence: sequenceOrder,
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
$('document').ready(async () => {
    await getCiApplySequenceData()
    await getCiSequenceData()
})