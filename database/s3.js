const S3 = require('aws-sdk/clients/s3');
require ('dotenv').config();
const fs = require('fs');

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

//Upload file to S3
const uploadFile = async (file) => {
    const filestream = fs.createReadStream(file.path);

    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: file.filename,
        Body: filestream
    };
    const result = await s3.upload(params).promise();
    return result;
}

//Get image from S3
const getFileStream = async (key) => {
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key
    };
    const result = await s3.getObject(params).promise();
    return result;
}

module.exports = {
    uploadFile,
    getFileStream
}