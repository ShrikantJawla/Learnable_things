const hrsBtn = document.getElementById('hrsBtn')
let loungeImage = document.getElementById('lounge_image')


let loungeDetail = {}
let inputObjectCopy = {}


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

    if ((JSON.stringify(inputObject) === JSON.stringify(inputObjectCopy) && !(loungeImage.files.length > 0))
        || !inputObject['LoungeName']
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
        updateBtn.disabled = true
        publishBtn.disabled = false
    }
    else {
        updateBtn.disabled = false
        publishBtn.disabled = true
    }
}
hrsBtn.addEventListener('click', (e) => {
    e.preventDefault()
    if ($('#LoungeTiming').val() === '24 hours')
        $('#LoungeTiming').val('')
    else
        $('#LoungeTiming').val('24 hours')
    inputObject['LoungeTiming'] = '24 hours'
    validate()
})
leftForm.addEventListener('input', (e) => {
    if ((e.target.tagName === 'INPUT' && e.target.type !== 'file') || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.type === 'checkbox') {
            console.log({ inputObject, inputObjectCopy })
            inputObject['Amenties'][e.target.id] = e.target.checked
        }
        else {
            inputObject[e.target.name] = e.target.value
        }
        validate()
    }
    if (e.target.tagName === 'INPUT' && e.target.type === 'file') {
        validate()
    }
})
document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction(itemId, '/delete/lounge', '/lounges-list')
})
updateBtn.addEventListener('click', () => {
    let loungeImg = document.getElementById('lounge_image').files[0]

    let loungeImgType = (loungeImg === undefined || loungeImg === "") ? "" : loungeImg.type.split('/')[loungeImg.type.split('/').length - 1]

    let loungeImgChangedName = (loungeImgType === "") ? undefined : renameFile(loungeImg, "LoungeImages" + "." + loungeImgType)

    let formDataToPost = new FormData()
    formDataToPost.append('upload', loungeImgChangedName)
    formDataToPost.append('relatedType', 'lounge_details')
    formDataToPost.append('lounge', JSON.stringify(inputObject))


    $('#loader').show()
    $.ajax({
        url: `/update-lounge?id=${itemId}`,
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

publishBtn.addEventListener('click', () => publishBtnOnEditPage(itemId, 'lounge_details'))

multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['airport'] = getSelectedOptions('airports')
        inputObject['creditCards'] = getSelectedOptions('creditCards')
        inputObject['loungeNetworks'] = getSelectedOptions('loungeNetworks')
        validate()
    }

})

$(document).ready(function () {
    $.ajax({
        url: `/edit-lounge?id=${itemId}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",
        success: function (result) {
            ({ loungeDetail } = result.payload)
            $('#lounge_image-preview').attr('src', loungeDetail['lounge_image'] || fallbackImgSrc)
            document.querySelector('#lounge_image-preview').dataset.defaultSrc = loungeDetail['lounge_image'] || fallbackImgSrc
            publishBtnText(loungeDetail.published_at)

            Object.keys(loungeDetail).map(key => {
                if ($(`#${key}`).length && key !== 'Amenties' && key !== 'lounge_image') {
                    $(`#${key}`).val(loungeDetail[key])
                    inputObject[`${key}`] = (loungeDetail[key]) || ''
                }

            })
            if (loungeDetail['Amenties']) {
                let Amenties = loungeDetail['Amenties']
                console.log(Amenties)
                inputObject['Amenties'] = Amenties
                Object.keys(Amenties).map(key => {
                    if ($(`#${key}`).length) {
                        $(`#${key}`).prop('checked', Amenties[key])
                    }
                })
            }
            enableUniMultiSelect({ loungeNetworks: loungeDetail['loungeNetworks'] }, false, 'loungeNetworks')
            enableUniMultiSelect({ creditCards: loungeDetail['creditCards'] }, false, 'creditCards')
            enableUniMultiSelect({ airports: loungeDetail['airport'] }, true, 'airports')
            inputObject['airport'] = loungeDetail['airport']
            inputObject['creditCards'] = loungeDetail['creditCards']
            inputObject['loungeNetworks'] = loungeDetail['loungeNetworks']
            inputObjectCopy = JSON.parse(JSON.stringify(inputObject))
            console.log({ inputObject, inputObjectCopy })
            validate()
        }
    })
})
