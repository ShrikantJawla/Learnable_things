let airportDetail = {}
let inputObjectCopy = {}
let airportImageFile = document.getElementById('airport_image')


let inputObject = {
    'AirportName': "",
    'AirportID': "",
    'AirportLocation': "",
    'AirportCity': "",
    'lounges': []
}

const validate = () => {

    if ((JSON.stringify(inputObject) === JSON.stringify(inputObjectCopy) && !(airportImageFile.files.length > 0))
        || !inputObject['AirportName']
        || !inputObject['AirportID']
        || !inputObject['AirportLocation']
        || !inputObject['AirportCity']
        // || !(inputObject['lounges'].length)
    ) {
        updateBtn.disabled = true
        publishBtn.disabled = false
    }
    else {
        updateBtn.disabled = false
        publishBtn.disabled = true
    }

}
leftForm.addEventListener('input', (e) => {
    if ((e.target.tagName === 'INPUT' && e.target.type !== 'file') || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        inputObject[e.target.name] = e.target.value
        validate()
    }
    if (e.target.tagName === 'INPUT' && e.target.type === 'file') {
        validate()
    }
})

updateBtn.addEventListener('click', () => {
    let airportImg = document.getElementById('airport_image').files[0]

    let airportImgType = (airportImg === undefined || airportImg === "") ? "" : airportImg.type.split('/')[airportImg.type.split('/').length - 1]

    let airportImgChangedName = (airportImgType === "") ? undefined : renameFile(airportImg, "AirportImage" + "." + airportImgType)

    let formDataToPost = new FormData()
    formDataToPost.append('upload', airportImgChangedName)
    formDataToPost.append('relatedType', 'airports')
    formDataToPost.append('airport', JSON.stringify(inputObject))
    $('#loader').show()
    $.ajax({
        url: `/update-airport?id=${itemId}`,
        type: "PUT",
        cache: false,
        contentType: false,
        processData: false,
        data: formDataToPost,
        success: function () {
            $('#loader').hide()
            location.reload()
        }
    })
})
document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction(itemId, '/delete/airport', '/airports-list')
})

publishBtn.addEventListener('click', () => publishBtnOnEditPage(itemId, 'airports'))

multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['lounges'] = getSelectedOptions('lounges')
        validate()
    }

})
$(document).ready(function () {

    $.ajax({
        url: `/edit-airport?id=${itemId}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",

        success: function (result) {
            ({ airportDetail } = result.payload)
            publishBtnText(airportDetail.published_at)
            $('#airport_image-preview').attr('src', airportDetail['airport_image'] || fallbackImgSrc)
            document.querySelector('#airport_image-preview').dataset.defaultSrc = airportDetail['airport_image'] || fallbackImgSrc
            $('#AirportName').val(airportDetail['AirportName'])
            $('#AirportCity').val(airportDetail['AirportCity'])
            $('#AirportLocation').val(airportDetail['AirportLocation'])
            $('#AirportID').val(airportDetail['AirportID'])
            inputObject['AirportName'] = $('#AirportName').val()
            inputObject['AirportCity'] = $('#AirportCity').val()
            inputObject['AirportLocation'] = $('#AirportLocation').val()
            inputObject['AirportID'] = $('#AirportID').val()
            enableUniMultiSelect({ lounges: airportDetail.lounges }, false, 'lounges', true)
            inputObject['lounges'] = airportDetail.lounges
            inputObjectCopy = JSON.parse(JSON.stringify(inputObject))
            validate()

        }
    })
})
