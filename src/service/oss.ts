import { think } from 'thinkjs';
const path = require('path');
var COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
var cos = new COS({
    SecretId: 'AKIDoOilY6VL2g4wYxI3kCahxJSM0NinJAJB',
    SecretKey: 'wgAcpmSEkzyh5C2fEXZKo9D1b9VaPyTz'
});
module.exports = class extends think.Service {
    constructor() {
        super();

    }
     upload($file: string,$path: string) {
        return new Promise((resolve,rejected) =>
        {
            cos.putObject({
                Bucket: 'cos-cx-n1-1257124629', /* 桶 */
                Region: 'ap-guangzhou',    /* 地区 */
                Key:  $path,
                // StorageClass: 'STANDARD',
                Body: fs.createReadStream($file),
                onProgress: function(progressData:any) {
                    console.log(JSON.stringify(progressData));
                }
            }, function(err: object, data: object) {
                console.log(err || data);
                resolve(err || data);
            });
        })

    }
    deleteFile($fileList: any[]) {
        return new Promise((resolve,rejected) =>
        {
            cos.deleteMultipleObject({
                Bucket: 'cos-cx-n1-1257124629', /* 桶 */
                Region: 'ap-guangzhou',    /* 地区 */
                Objects: $fileList
            }, function(err: object, data: object) {
                console.log(err || data);
                resolve(data);
            });

        })

    }
}
