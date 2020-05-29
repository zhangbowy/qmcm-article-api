import { think } from 'thinkjs';
const path = require('path');
const fs = require('fs');
const COS = require('cos-nodejs-sdk-v5');
const cos = new COS({
    SecretId: think.config('tencentCos').SecretId,
    SecretKey: think.config('tencentCos').SecretKey
});
module.exports = class extends think.Service {
    constructor() {
        super();
    }
     upload($file: string, $path: string, $buffer: boolean) {
        return new Promise((resolve, rejected) => {
            cos.putObject({
                Bucket: think.config('tencentCos').bucket, /* 桶 */
                Region:  think.config('tencentCos').region,    /* 地区 */
                Key:  $path, /* 路径 */
                // StorageClass: 'STANDARD',
                Body: $buffer ? $file : fs.createReadStream($file),
                onProgress(progressData: any) {
                    console.log(JSON.stringify(progressData));
                }
                // tslint:disable-next-line:only-arrow-functions
            }, function(err: object, data: object) {
                console.log(err || data);
                resolve(err || data);
            });
        });

    }
    deleteFile($fileList: any[]) {
        return new Promise((resolve, rejected) => {
            cos.deleteMultipleObject({
                Bucket: think.config('tencentCos').bucket, /* 桶 */
                Region:  think.config('tencentCos').region,    /* 地区 */
                Objects: $fileList
                // tslint:disable-next-line:only-arrow-functions
            }, function(err: object, data: object) {
                console.log(err || data);
                resolve(data);
            });

        });

    }
    uploadFiles($files: any[]) {
        return new Promise((resolve, reject) => {
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
                onProgress(info: any) {
                    const percent = parseInt(String(info.percent * 10000), 10) / 100;
                    const speed = parseInt(String(info.speed / 1024 / 1024 * 100), 10) / 100;
                    console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
                },
                onFileFinish(err: any, data: any, options: any) {
                    console.log(options.Key + '上传' + (err ? '失败' : '完成'));
                },
                // tslint:disable-next-line:only-arrow-functions
            }, function(err: any, data: any) {
                console.log(err || data);
                if (data) {
                  resolve(data);
                }
            });
        });
    }
};
