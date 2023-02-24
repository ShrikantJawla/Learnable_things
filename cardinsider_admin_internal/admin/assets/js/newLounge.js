const saveBtn = document.getElementById('save-lounge')
const hrsBtn = document.getElementById('hrsBtn')


let inputObject = {
    'LoungeName': "",
    'Location': "",
    'LoungeNamePublic': "",
    'TerminalsSelect': "",
    "Directions": "",
    'creditCards': [],
    'loungeNetworks': [],
    'LoungeTiming': '',
    'airport': [],
    'Introduction': '',
    'MainSummary': '',
    'ImportantInformation': '',
    'Amenties': {
        'Food': false,
        'DisabledAccess': false,
        'TV': false,
        'SmokingArea': false,
        'NoSmoking': false,
        'AlcoholicDrinks': false,
        'NewspapersMagazines': false,
        'WiFi': false,
        'AirConditioning': false,
        'Television': false,

    }
}
const validate = () => {

    if (!inputObject['LoungeName']
        || !inputObject['Location']
        || !inputObject['LoungeNamePublic']
        || !inputObject['TerminalsSelect']
        || !inputObject['Directions']
        || !(inputObject['airport'] && inputObject['airport'].length)
        || !inputObject['LoungeTiming']
        // || !(inputObject['creditCards'].length)
        // || !(inputObject['loungeNetworks'].length)
        || !(inputObject['Amenties']['Food'] || inputObject['Amenties']['DisabledAccess'] || inputObject['Amenties']['TV'] || inputObject['Amenties']['SmokingArea'] || inputObject['Amenties']['NoSmoking'] || inputObject['Amenties']['AlcoholicDrinks'] || inputObject['Amenties']['NewspapersMagazines'] || inputObject['Amenties']['WiFi'] || inputObject['Amenties']['AirConditioning'] || inputObject['Amenties']['Television'])
    ) {
        saveBtn.disabled = true
    }
    else
        saveBtn.disabled = false
}
hrsBtn.addEventListener('click', (e) => {
    e.preventDefault()
    if ($('#LoungeTiming').val() === '24 hours') {
        inputObject['LoungeTiming'] = ''
        $('#LoungeTiming').val('')
    }
    else {
        $('#LoungeTiming').val('24 hours')
        inputObject['LoungeTiming'] = '24 hours'
    }
    validate()
})
leftForm.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.type === 'checkbox') {
            inputObject['Amenties'][e.target.id] = e.target.checked
        }
        else {
            inputObject[e.target.name] = e.target.value
        }
        validate()
    }
})
saveBtn.addEventListener('click', () => {
    let loungeImg = document.getElementById('lounge_image').files[0]

    let loungeImgType = (loungeImg === undefined || loungeImg === "") ? "" : loungeImg.type.split('/')[loungeImg.type.split('/').length - 1]

    let loungeImgChangedName = (loungeImgType === "") ? undefined : renameFile(loungeImg, "LoungeImages" + "." + loungeImgType)

    let formDataToPost = new FormData()
    formDataToPost.append('upload', loungeImgChangedName)
    formDataToPost.append('relatedType', 'lounge_details')
    formDataToPost.append('item', JSON.stringify(inputObject))
    $('#saveModal').modal('show')
    $.ajax({
        url: "/post-newlounge",
        type: "POST",
        cache: false,
        contentType: false,
        processData: false,
        data: formDataToPost,
        success: function (result) {
            itemId = result.payload.id
            $('#saveModalTitle').text('Lounge Saved to DB')
            $('#saveLoader').addClass('success')
            $('#publishText').text('Do you want to Publish it now?')
            $('#laterBtn').prop('disabled', false)
            $('#publishBtn').prop('disabled', false)
        }
    })
})


$('#laterBtn').click(function () {
    location.replace(`edit-lounge?id=${itemId}`)
})
$('#publishBtn').click(() => publishBtnOnNewPageEventListener('Lounge', itemId, 'lounge_details'))

multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['airport'] = getSelectedOptions('airports')
        inputObject['creditCards'] = getSelectedOptions('creditCards')
        inputObject['loungeNetworks'] = getSelectedOptions('loungeNetworks')
        validate()
    }

})

$(document).ready(function () {
    document.querySelector('#lounge_image-preview').src = fallbackImgSrc
    document.querySelector('#lounge_image-preview').dataset.defaultSrc = fallbackImgSrc

    enableUniMultiSelect(undefined, false, 'loungeNetworks')
    enableUniMultiSelect(undefined, false, 'creditCards')
    enableUniMultiSelect(undefined, true, 'airports')
})
