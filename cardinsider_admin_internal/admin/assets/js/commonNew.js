const leftForm = document.getElementById('left-form')
const multiSelectWrapper = document.getElementById('multiSelectWrapper')
const laterBtn = document.getElementById('laterBtn')
const publishBtn = document.getElementById('publishBtn')
let itemId
const toast = new bootstrap.Toast(document.getElementById('errorToast'))
const toastMessage = document.getElementById('errorToastMessage')
const fallbackImgSrc = './admin/assets/images/other/no_img.png'

leftForm.addEventListener('click', (e) => {
    if (e.target.tagName === 'I' && e.target.classList.contains('deleteImage')) {
        const parent = e.target.parentNode
        parent.querySelector('input').value = ''
        // console.log(e.target.parentNode.children[3].files)
        // console.log(e.target.parentNode.children[3].value)
        // console.log(parent.querySelector('.previewImg').dataset)
        parent.querySelector('.previewImg').src = parent.querySelector('.previewImg').dataset.defaultSrc
    }
})


function showPreview(event) {
    event.preventDefault()
    if (event.target.files.length > 0) {
        var src = URL.createObjectURL(event.target.files[0])
        var preview = document.getElementById(`${event.target.id}-preview`)
        preview.src = src
        preview.style.display = "block"
    }
}
function renameFile(originalFile, newName) {
    return new File([originalFile], newName, {
        type: originalFile.type,
        lastModified: originalFile.lastModified,
    })
}
const saveBtnEventListener = (item, url) => {
    //  data-bs-toggle="modal" data-bs-target="#saveModal"
    // var myModal = new bootstrap.Modal(document.getElementById('saveModal'))
    $('#saveModal').modal('show')

    $.ajax({
        url,
        type: "POST",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({
            item: inputObject
        }),
        success: function (result) {
            // myModal.show()
            itemId = result.payload.id
            setTimeout(() => {
                $('#saveModalTitle').text(`${item} Saved to DB`)
                $('#saveLoader').addClass('success')
                $('#publishText').text('Do you want to Publish it now?')
                $('#laterBtn').prop('disabled', false)
                $('#publishBtn').prop('disabled', false)
            }, 1000)
        },
        error: function (result) {
            //console.log(result.responseJSON.message)
            toastMessage.innerText = `${result.responseJSON.message}`
            toast.show()
        }
    })
}
const publishBtnOnNewPageEventListener = function (item, id, table) {
    if (publishBtn.innerText === 'Publish') {
        $('#saveModalTitle').text('Publishing')
        $('#saveLoader').removeClass('success')
        $('#publishText').text('')
        $('#laterBtn').text(`Edit Current ${item}`)
        $('#publishBtn').text(`Add New ${item}`)
        $('#laterBtn').prop('disabled', true)
        $('#publishBtn').prop('disabled', true)
        $.ajax({
            url: `/publish/${table}/${id}`,
            type: "POST",
            contentType: "application/json",
            dataType: 'json',
            success: function (result) {
                setTimeout(() => {
                    $('#saveModalTitle').text(`Woohoo! ${item} Published`)
                    $('#saveLoader').addClass('success')
                    $('#publishText').text(`Do you want to add more ${item.toLowerCase() + 's'}?`)
                    $('#laterBtn').prop('disabled', false)
                    $('#publishBtn').prop('disabled', false)
                }, 800)
            }
        })
    }
    else location.reload()
}

function isValidHttpUrl(string) {
    let url

    try {
        url = new URL(string)
    } catch (_) {
        return false
    }

    return url.protocol === "http:" || url.protocol === "https:"
}