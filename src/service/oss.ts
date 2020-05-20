import { think } from 'thinkjs';
const path = require('path');
const fs = require('fs');
var COS = require('cos-nodejs-sdk-v5');
var cos = new COS({
    SecretId: think.config('tencentCos').SecretId,
    SecretKey: think.config('tencentCos').SecretKey
});
module.exports = class extends think.Service {
    constructor() {
        super();

    }
     upload($file: string,$path: string, $buffer: boolean) {
        return new Promise((resolve,rejected) =>
        {
            cos.putObject({
                Bucket: 'cos-cx-n1-1257124629', /* 桶 */
                Region: 'ap-guangzhou',    /* 地区 */
                Key:  $path,
                // StorageClass: 'STANDARD',
                Body: $buffer?$file:fs.createReadStream($file),
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
    uploadFiles($files: any[]) {
        return new Promise((resolve,reject) => {
            // const filePath1 = "temp-file-to-upload" // 本地文件路径
            // const filePath2 = "temp-file-to-upload" // 本地文件路径
            // files: [{
            //     Bucket: 'examplebucket-1250000000',
            //     Region: 'COS_REGION',
            //     Key: 'exampleobject',
            //     FilePath: filePath1,
            // }, {
            //     Bucket: 'examplebucket-1250000000',
            //     Region: 'COS_REGION',
            //     Key: '2.jpg',
            //     FilePath: filePath2,
            // }],
     /* 地区 */
            cos.uploadFiles({
                files: $files,
                SliceSize: 1024,
                onProgress: function (info: any) {
                    var percent = parseInt(String(info.percent * 10000)) / 100;
                    var speed = parseInt(String(info.speed / 1024 / 1024 * 100)) / 100;
                    console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
                },
                onFileFinish: function (err: any, data: any, options: any) {
                    console.log(options.Key + '上传' + (err ? '失败' : '完成'));
                },
            }, function (err: any, data: any) {
                console.log(err || data);
                if (data) {
                  resolve(data);
                }
            });
        })
    }
}
