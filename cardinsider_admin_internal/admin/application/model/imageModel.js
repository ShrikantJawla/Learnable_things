const { pool } = require("../../../configration/database")

let imageModelObj = {}
imageModelObj.uploadImagesData = async function (dataToDB, relatedType, edit = false, userId) {
    /// uploading image data to upload file table here......
    let uploadFiles = dataToDB.uploadImages
    if (uploadFiles && uploadFiles.length > 0) {
        for (let i = 0; i < uploadFiles.length; i++) {
            uploadFiles[i].relatedType = relatedType
            if (uploadFiles[i].originalname) {
                let getTheName = uploadFiles[i].originalname.split('.')[0]
                uploadFiles[i].relatedField = getTheName
            }
            // console.log('EDIT>>>>>>>>>', edit)
            // console.log(uploadFiles[i])
            uploadFiles[i].relatedId = dataToDB.itemId
            if (edit) {
                imageModelObj.editEachImageData(uploadFiles[i], userId)
            }
            else {
                imageModelObj.addEachImageData(uploadFiles[i], userId)
            }
        }
    }

    return { id: dataToDB.itemId }

}

imageModelObj.addEachImageData = async function (imageData, userId) {
    // console.log(imageData)
    let uploadInsertData = {
        name: imageData.originalname,
        hash: imageData.key.split('.')[0],
        mime: imageData.mimetype,
        size: imageData.size,
        url: imageData.location,
        provider: 'do',
        ext: "." + imageData.key.split('.')[imageData.key.split('.').length - 1],
    }
    let dataFromUploadFileTable = false

    let uploafFileTableQuery = `INSERT INTO upload_file("name", "hash", "ext", "mime",  "size", "url",  "provider", "created_by", "updated_by")
    values('${uploadInsertData.name}', '${uploadInsertData.hash}', '${uploadInsertData.ext}', '${uploadInsertData.mime}', ${uploadInsertData.size}, '${uploadInsertData.url}', '${uploadInsertData.provider}', ${userId} ,${userId}) RETURNING *;`
    try {
        let dbQuery = await pool.query(uploafFileTableQuery)
        dataFromUploadFileTable = dbQuery.rows[0]

    } catch (err) {
        //console.log(err, "err")
    }

    if (dataFromUploadFileTable) {
        let insertMorphData = {
            uploadFileId: dataFromUploadFileTable.id,
            relatedId: imageData.relatedId,
            relatedType: imageData.relatedType,
            relatedField: imageData.relatedField,
            order: 1
        }
        let dataFromUploadMorphTable = false
        let uploadFileMorphRelationTableQuery = `INSERT INTO upload_file_morph("upload_file_id", "related_id", "related_type", "field", "order") 
        values(${insertMorphData.uploadFileId}, ${insertMorphData.relatedId}, '${insertMorphData.relatedType}', '${insertMorphData.relatedField}', ${insertMorphData.order}) RETURNING *;`
        // console.log(uploadFileMorphRelationTableQuery)
        try {
            let dbQuery = await pool.query(uploadFileMorphRelationTableQuery)
            dataFromUploadMorphTable = dbQuery.rows[0]
        } catch (err) {
            console.error(err)
        }
    }
}


imageModelObj.editEachImageData = async function (imageData, userId) {
    // console.log(imageData)
    let { relatedId, relatedType, relatedField } = imageData
    let prevImgMorphQuery = `SELECT "upload_file_id" from upload_file_morph where related_id='${relatedId}' and field='${relatedField}'`
    let uploadFileId
    let uploadInsertData = {
        name: 'updated' + imageData.originalname,
        hash: imageData.key.split('.')[0],
        mime: imageData.mimetype,
        size: imageData.size,
        url: imageData.location,
        provider: 'do',
        ext: "." + imageData.key.split('.')[imageData.key.split('.').length - 1],
    }

    try {
        // console.log(prevImgMorphQuery)

        let prevImgMorphQueryExecute = await pool.query(prevImgMorphQuery)

        if (prevImgMorphQueryExecute.rows.length) {
            uploadFileId = prevImgMorphQueryExecute.rows[0]['upload_file_id']
        }
        else {
            imageModelObj.addEachImageData(imageData, userId)
        }
        let updateImgQuery = `
        UPDATE upload_file
        SET
        name='${uploadInsertData.name}',
        hash='${uploadInsertData.hash}',
        ext='${uploadInsertData.ext}',
        mime='${uploadInsertData.mime}',
        size='${uploadInsertData.size}',
        url='${uploadInsertData.url}',
        updated_by=${userId}
        where 
        id=${uploadFileId}
        `

        // console.log(uploadFileId, "uploadFileId")
        if (uploadFileId !== undefined)
            await pool.query(updateImgQuery)
        else {
            imageModelObj.addEachImageData(imageData)
        }
    }
    catch (err) {
        console.error(err)
    }

}







module.exports = imageModelObj
