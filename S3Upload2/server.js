const express = require('express');
const multer = require('multer')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const awsConfig = {
    accessKeyId: 'DPAZNDB34IWILN7YW76Z',
    secretAccessKey: '2u7HLwPBovPE4NCHlpDC2iHqoanClbwUxoerUzjy1f8',
    region: 'sgp1',
}

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const s3 = new S3Client({
    credentials: {
        accessKeyId: 'DPAZNDB34IWILN7YW76Z',
        secretAccessKey: '2u7HLwPBovPE4NCHlpDC2iHqoanClbwUxoerUzjy1f8',
    },
    region: 'sgp1'
})




app.post('/upload', upload.single('avatar'), async (req, res) => {
    try {
        const params = {
            Bucket: 'ciwebback',
            Key: req.file.originalname,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }
        const command = new PutObjectCommand(params)
        await s3.send(command);
        res.send('success')
    } catch (error) {
        console.log(error);
        res.send(error)
    }
})



app.listen(port = 8080 || 8000, () => { console.log(`listening on http://localhost:${port}`) });