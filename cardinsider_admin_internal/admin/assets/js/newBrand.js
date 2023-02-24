const saveBtn = document.getElementById('save-brand')
const URLLauncher_check = document.getElementById('URLLauncher_check')

let brandId
let inputObject = {
    'BrandName': "",
    'BrandWebsite': "",
    'BrandAlexa': "",
    'URLLauncher_check': false,
    'offers': []
}
const validate = () => {

    if (!inputObject['BrandName']
        // || !inputObject['BrandWebsite']
        // || !inputObject['BrandAlexa']
        // || !inputObject['URLLauncher_check']
        // || !(inputObject['offers'].length)
    ) {
        saveBtn.disabled = true
    }
    else
        saveBtn.disabled = false

}

leftForm.addEventListener('input', (e) => {
    if ((e.target.tagName === 'INPUT' && e.target.type !== 'file') || e.target.tagName === 'SELECT') {
        if (e.target.id === 'URLLauncher_check') {
            inputObject['URLLauncher_check'] = e.target.checked
        }
        else {
            inputObject[e.target.name] = e.target.value
        }
        validate()
    }
})



saveBtn.addEventListener('click', () => {


    // for (var key of formDataToPost.entries()) {
    //     //console.log(key[0] + ': ' + key[1])
    // }
    let mesg = ``
    if (!(!inputObject['BrandWebsite'] || isValidHttpUrl(inputObject['BrandWebsite']))) {
        mesg += `Please enter a valid url for BRAND WEBSITE.\n`
    }
    if (mesg.length) {
        toastMessage.innerText = `${mesg}`
        toast.show()
    }
    else {
        let brandLogoFile = document.getElementById('brandLogo').files[0]
        let brandImage = document.getElementById('brandImg').files[0]
        let brandBigImage = document.getElementById('brandLogoBig').files[0]

        let brandLogoFileType = (brandLogoFile === undefined || brandLogoFile === "") ? "" : brandLogoFile.type.split('/')[brandLogoFile.type.split('/').length - 1]
        let brandImageFileType = (brandImage === undefined || brandImage === "") ? "" : brandImage.type.split('/')[brandImage.type.split('/').length - 1]
        let brandBigImageFileType = (brandBigImage === undefined || brandBigImage === "") ? "" : brandBigImage.type.split('/')[brandBigImage.type.split('/').length - 1]


        //console.log(brandLogoFileType, brandImageFileType, brandBigImageFileType)

        let brandLogoFileChangedName = (brandLogoFileType === "") ? undefined : renameFile(brandLogoFile, "BrandLogo" + "." + brandLogoFileType)
        let brandImageFileChangedName = (brandImageFileType === "") ? undefined : renameFile(brandImage, "BrandImage" + "." + brandImageFileType)
        let brandBigImageFileChangedName = (brandBigImageFileType === "") ? undefined : renameFile(brandBigImage, "BrandbigLogo" + "." + brandBigImageFileType)
        //console.log(brandLogoFileChangedName, "brandLogoFileChangedName")
        //console.log(brandImageFileChangedName, "brandImageFileChangedName")
        //console.log(brandBigImageFileChangedName, "brandBigImageFileChangedName")

        // //console.log(brandLogoFile,changedName);
        let formDataToPost = new FormData()
        formDataToPost.append('upload', brandLogoFileChangedName)
        formDataToPost.append('upload', brandImageFileChangedName)
        formDataToPost.append('upload', brandBigImageFileChangedName)
        formDataToPost.append('relatedType', 'brands')
        formDataToPost.append('brand', JSON.stringify(inputObject))
        $('#saveModal').modal('show')
        $.ajax({
            url: "/post-newbrand",
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            data: formDataToPost,
            success: function (result) {
                //console.log('BRAND SAVED', result)
                brandId = result.payload.id
                $('#saveModalTitle').text('Brand Saved to DB')
                $('#saveLoader').addClass('success')
                $('#publishText').text('Do you want to Publish it now?')
                $('#laterBtn').prop('disabled', false)
                $('#publishBtn').prop('disabled', false)
            }
        })
    }
})



$('#laterBtn').click(function () {
    location.replace(`edit-brand?id=${brandId}`)
})
$('#publishBtn').click(() => publishBtnOnNewPageEventListener('Brand', brandId, 'brands'))
multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['offers'] = getSelectedOptions('offers')
        validate()
    }

})
$(document).ready(function () {
    document.querySelector('#brandLogo-preview').src = fallbackImgSrc
    document.querySelector('#brandImg-preview').src = fallbackImgSrc
    document.querySelector('#brandLogoBig-preview').src = fallbackImgSrc


    document.querySelector('#brandLogo-preview').dataset.defaultSrc = fallbackImgSrc
    document.querySelector('#brandImg-preview').dataset.defaultSrc = fallbackImgSrc
    document.querySelector('#brandLogoBig-preview').dataset.defaultSrc = fallbackImgSrc
    enableUniMultiSelect(undefined, false, 'offers', true)
})
