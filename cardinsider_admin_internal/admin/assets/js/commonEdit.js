const updateBtn = document.getElementById('update')
const leftForm = document.getElementById('left-form')
const multiSelectWrapper = document.getElementById('multiSelectWrapper')
const publishBtn = document.getElementById('publish')
const publishModal = document.getElementById('publishModal')
const itemId = window.location.search.replace('?id=', '')
const fallbackImgSrc = './admin/assets/images/other/no_img.png'
const toast = new bootstrap.Toast(document.getElementById('errorToast'))
const toastMessage = document.getElementById('errorToastMessage')

const publishBtnText = function (published_at) {
    if (published_at) {
        publishBtn.innerText = "UNPUBLISH"
    }
    else {
        publishBtn.innerText = "PUBLISH"
    }
}


function renameFile(originalFile, newName) {
    return new File([originalFile], newName, {
        type: originalFile.type,
        lastModified: originalFile.lastModified,
    })
}

leftForm.addEventListener('click', (e) => {
    if (e.target.tagName === 'I' && e.target.classList.contains('deleteImage')) {
        const parent = e.target.parentNode
        parent.querySelector('input').value = ''
        // console.log(e.target.parentNode.children[3].files)
        // console.log(e.target.parentNode.children[3].value)
        // console.log(parent.querySelector('.previewImg').dataset)
        parent.querySelector('.previewImg').src = parent.querySelector('.previewImg').dataset.defaultSrc
        validate()
    }
})


const publishBtnOnEditPage = (id, table) => {
    $('#publishLoader').removeClass('success')
    if (publishBtn.innerText.toLowerCase() === 'publish') {
        $.ajax({
            url: `/publish/${table}/${id}`,
            type: "POST",
            contentType: "application/json",
            dataType: 'json',
            success: function (result) {
                publishBtnText(result.payload.published_at)
                setTimeout(() => {
                    $('#modalTitle').text('Published')
                    $('#publishLoader').addClass('success')
                }, 800)
                setTimeout(() => {
                    location.reload()
                }, 1800)
            }

        })
    }
    else {
        document.getElementById('modalTitle').innerText = 'Unpublishing ....'
        if (table === 'brands') {
            setTimeout(() => {
                $('#modalTitle').text('Need Admin Permissions to unpublish')
                $('#publishLoader').addClass('success')
            }, 800)
            return
        }
        $.ajax({
            url: `/publish/${table}/${id}?publish=unpublish`,
            type: "POST",
            contentType: "application/json",
            dataType: 'json',
            success: function (result) {
                publishBtnText(result.payload.published_at)
                publishModal.classList.add('active')
                setTimeout(() => {
                    $('#modalTitle').text('Unpublished')
                    $('#publishLoader').addClass('success')
                }, 800)
                setTimeout(() => {
                    location.reload()
                }, 1800)
            }
        })
    }

}
function showPreview(event) {
    event.preventDefault()
    if (event.target.files.length > 0) {
        var src = URL.createObjectURL(event.target.files[0])
        var preview = document.getElementById(`${event.target.id}-preview`)
        preview.src = src
        preview.style.display = "block"
    }
}
const deleteFunction = (id, url, redirectUrl) => {
    $.ajax({
        url: `${url}/${id}`,
        type: "DELETE",
        contentType: "application/json",
        success: () => {
            location.href = `${redirectUrl}`
        }
    })
}

function isValidHttpUrl(string) {
    let url

    try {
        url = new URL(string)
    } catch (err) {
        return false
    }

    return url.protocol === "http:" || url.protocol === "https:"
}