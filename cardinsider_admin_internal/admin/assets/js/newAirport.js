const saveBtn = document.getElementById('save-airport')

let inputObject = {
    'AirportName': "",
    'AirportID': "",
    'AirportLocation': "",
    'AirportCity': "",
    'lounges': []
}
const validate = () => {

    if (!inputObject['AirportName']
        || !inputObject['AirportID']
        || !inputObject['AirportLocation']
        || !inputObject['AirportCity']
        // || !(inputObject['lounges'].length)
    ) {
        saveBtn.disabled = true
    }
    else
        saveBtn.disabled = false

}
leftForm.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        inputObject[e.target.name] = e.target.value
        validate()
    }
})
saveBtn.addEventListener('click', () => {
    // saveBtnEventListener('Airport', '/post-newairport')
    let airportImg = document.getElementById('airport_image').files[0]

    let airportImgType = (airportImg === undefined || airportImg === "") ? "" : airportImg.type.split('/')[airportImg.type.split('/').length - 1]

    let airportImgChangedName = (airportImgType === "") ? undefined : renameFile(airportImg, "AirportImage" + "." + airportImgType)

    let formDataToPost = new FormData()
    formDataToPost.append('upload', airportImgChangedName)
    formDataToPost.append('relatedType', 'airports')
    formDataToPost.append('airport', JSON.stringify(inputObject))
    $('#saveModal').modal('show')
    $.ajax({
        url: "/post-newairport",
        type: "POST",
        cache: false,
        contentType: false,
        processData: false,
        data: formDataToPost,
        success: function (result) {
            itemId = result.payload.id
            $('#saveModalTitle').text('Airport Saved to DB')
            $('#saveLoader').addClass('success')
            $('#publishText').text('Do you want to Publish it now?')
            $('#laterBtn').prop('disabled', false)
            $('#publishBtn').prop('disabled', false)
        }
    })
})


$('#laterBtn').click(function () {
    location.replace(`edit-airport?id=${itemId}`)
})
$('#publishBtn').click(() => publishBtnOnNewPageEventListener('Airport', itemId, 'airports'))
multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['lounges'] = getSelectedOptions('lounges')
        validate()
    }

})
$(document).ready(function () {
    document.querySelector('#airport_image-preview').src = fallbackImgSrc
    document.querySelector('#airport_image-preview').dataset.defaultSrc = fallbackImgSrc

    enableUniMultiSelect(undefined, false, 'lounges', true)
})
