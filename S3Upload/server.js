const express = require('express');
const multer = require('multer')
const aws = require('aws-sdk');

const awsConfig = {
    accessKeyId: 'DPAZNDB34IWILN7YW76Z',
    secretAccessKey: '2u7HLwPBovPE4NCHlpDC2iHqoanClbwUxoerUzjy1f8',
    region: 'sgp1',
}

const S3 = new aws.S3(awsConfig);


const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const upload = multer({
    limits: 1024 * 1024 * 5,
    fileFilter: (req, file, next) => {
        if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
            next(null, file)
        } else {
            next('file not supported!')
        }
    }
})

const uploadToS3 = (fileData) => {
    return new Promise((res, rej) => {
        const params = {
            Bucket: 'ciwebback',
            acl: 'public-read',
            Key: `${Date.now().toString()}.jpg`,
            Body: fileData
        }

        S3.upload(params, (err, data) => {
            if (err) {
                rej(err)
            }
            console.log(data);
            return res(data)
        })
    })
}





app.get('/', (req, res) => res.sendFile(__dirname + '/form.html'));
app.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file)
    if (req.file) {
        uploadToS3(req.file.buffer).then(res => {
            return res.send({
                msg: 'uploaded',
                img_url: res.Location
            })
        }).catch(err => {
            console.log(err)
        })
    }
})


app.listen(port = 8080 || 8000, () => { console.log(`listening on http://localhost:${port}`) });