let brandDetail = {}
let inputObjectCopy = {}
let brandLogoFile = document.getElementById('brandLogo')
let brandImage = document.getElementById('brandImg')
let brandBigImage = document.getElementById('brandLogoBig')

let inputObject = {
    'BrandName': "",
    'BrandWebsite': "",
    'BrandAlexa': "",
    'URLLauncher_check': false,
    'offers': []
}


const validate = () => {

    if (((JSON.stringify(inputObject) === JSON.stringify(inputObjectCopy)) && !(brandBigImage.files.length > 0 || brandImage.files.length > 0 || brandLogoFile.files.length > 0))
        || !inputObject['BrandName']
        // || !inputObject['BrandWebsite']
        // || !inputObject['BrandAlexa']
        // || !inputObject['brandCity']
        // || !(inputObject['offers'].length)
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
    if ((e.target.tagName === 'INPUT' && e.target.type !== 'file') || e.target.tagName === 'SELECT') {
        if (e.target.id === 'URLLauncher_check') {
            inputObject['URLLauncher_check'] = e.target.checked
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

updateBtn.addEventListener('click', () => {


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
        console.log(brandBigImageFileChangedName, "brandBigImageFileChangedName")

        // //console.log(brandLogoFile,changedName);
        let formDataToPost = new FormData()
        formDataToPost.append('upload', brandLogoFileChangedName)
        formDataToPost.append('upload', brandImageFileChangedName)
        formDataToPost.append('upload', brandBigImageFileChangedName)
        formDataToPost.append('relatedType', 'brands')
        formDataToPost.append('brand', JSON.stringify(inputObject))
        for (var pair of formDataToPost.entries()) {
            console.log(pair[0] + ', ' + pair[1])
        }
        $('#loader').show()
        $.ajax({
            url: `/update-brand?id=${itemId}`,
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
    }
})
publishBtn.addEventListener('click', () => {
    publishBtnOnEditPage(itemId, 'brands')

})
multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['offers'] = getSelectedOptions('offers')
        validate()
    }

})
document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction(itemId, '/delete/brand', '/brands-list')
})
$(document).ready(function () {

    $.ajax({
        url: `/edit-brand?id=${itemId}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",

        success: function (result) {
            ({ brandDetail } = result)
            console.log(brandDetail)
            publishBtnText(brandDetail.published_at)
            $('#brandLogo-preview').attr('src', brandDetail['brandlogo'] || fallbackImgSrc)
            $('#brandImg-preview').attr('src', brandDetail['brandimage'] || fallbackImgSrc)
            $('#brandLogoBig-preview').attr('src', brandDetail['bigbrandimage'] || fallbackImgSrc)
            document.querySelector('#brandLogo-preview').dataset.defaultSrc = brandDetail['brandlogo'] || fallbackImgSrc
            document.querySelector('#brandImg-preview').dataset.defaultSrc = brandDetail['brandimage'] || fallbackImgSrc
            document.querySelector('#brandLogoBig-preview').dataset.defaultSrc = brandDetail['bigbrandimage'] || fallbackImgSrc


            $('#BrandName').val(brandDetail['BrandName'])
            $('#BrandWebsite').val(brandDetail['BrandWebsite'])
            $('#BrandAlexa').val(brandDetail['BrandAlexa'])
            $('brandLogoImg').val(brandDetail['brandlogo'])
            $('#URLLauncher_check').prop('checked', (brandDetail['URLLauncher_check'] === true))
            inputObject['BrandName'] = $('#BrandName').val()
            inputObject['URLLauncher_check'] = brandDetail['URLLauncher_check'] === true

            inputObject['BrandWebsite'] = $('#BrandWebsite').val()
            inputObject['BrandAlexa'] = $('#BrandAlexa').val()
            // inputObject['itemId'] = $('#itemId').val()
            enableUniMultiSelect({ offers: brandDetail['offers'] }, false, 'offers', true)
            inputObject['offers'] = brandDetail.offers
            inputObjectCopy = JSON.parse(JSON.stringify(inputObject))
            validate()

        }
    })
})
