import Base from './base.js';
import {think} from "thinkjs";
import GalleryModel from "../model/gallery";
const path = require('path');
var COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const util = require('util');
var cos = new COS({
    SecretId: 'AKIDoOilY6VL2g4wYxI3kCahxJSM0NinJAJB',
    SecretKey: 'wgAcpmSEkzyh5C2fEXZKo9D1b9VaPyTz'
});

interface UploadRes {
    Location: string;
    statusCode: number;
    headers?: any;
    ETag: string
}

const rename = think.promisify(fs.rename, fs);
export default class extends Base {
    private files: FileList;
    /**
     * 上传图片
     * @params image file
     * @params type 上传类型
     * @return IMAGE PATH
     */
    async uploadImgAction() {

        const file = this.file('image');
        // tslint:disable-next-line:no-console prefer-const
        let currentPath;
        let resultPath;
        // tslint:disable-next-line:no-console
        console.log(file, 'file');
        if (!file || !file.type) {
           return  this.fail(-1, '图片不能为空', []);
        }
        if (!this.post('type') || think.isEmpty(this.post('type'))) {
            return  this.fail(-1, '上传类型不能为空', []);
        }
        // tslint:disable-next-line:triple-equals
        if (this.post('type') == 'shop_logo') {
            currentPath = 'www/static/shop_logo/';
            resultPath = 'static/shop_logo/';
        } else {
            return  this.fail(-1, '上传类型不存在', []);
        }
        if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            const fileName = think.uuid('v4');
            const gs = file.type.substring(6, file.type.length);
            const filepath = path.join(think.ROOT_PATH, currentPath + fileName + '.' + gs);
            await think.mkdir(path.dirname(filepath));
            const readStream = fs.createReadStream(file.path);
            const writeStream = fs.createWriteStream(filepath);
            readStream.pipe(writeStream);
            await readStream.on('end', function() {
                fs.unlinkSync((this.files as any).upload.path);
            });
            return this.success({url: resultPath + fileName + '.' + gs}, "上传成功!");
        } else {
            this.fail(-1, '请上传png或jpg格式的图片', []);
        }
    }
    /**
     * 上传oss
     * @params dst file
     */
    async uploadOssAction() {
        const file = this.file('image');
        if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            const fileName = think.uuid('v4');
            const gs = file.type.substring(6, file.type.length);
            // const filepath = path.join(think.ROOT_PATH, 'www/static/card/' + );
            // await think.mkdir(path.dirname(filepath));
            const readStream = fs.createReadStream(file.path);
            // @ts-ignore
            const shop_id = (await this.session('token')).shop_id;
            let day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
            let filePath =`/gallary/${shop_id}/${day}/${fileName}.${gs}`;
            let res: any = await upload(file.path,filePath);
            const model = this.model('gallery') as GalleryModel;
            let imageParams: any ={
                oss_path : res.Location,
                region: 'ap-guangzhou',
                img_name:`${fileName}.${gs}`,
                img_init_name:file.name,
                path:filePath,
                fullPath:"",
                shop_id
            };
            await model.addImage(imageParams);
            // fs.unlinkSync((this.files as any).upload.path);
            return this.success({url: 'gallary/' + fileName + '.' + gs,res});
            return this.success(imageParams);
        } else {
            this.fail(-1, '请上传png或jpg格式的图片', []);
        }
    }
}
function upload($file: string,$path: string) {
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
            resolve(data);
        });
    })

}
function deleteFile($fileList: any[]) {
    return new Promise((resolve,rejected) =>
    {
        cos.deleteMultipleObject({
            Bucket: 'cos-cx-n1-1257124629', /* 桶 */

            Region: 'ap-guangzhou',    /* 地区 */
            Objects: [
                {Key: 'exampleobject'},
                {Key: 'exampleobject2'},
            ]
        }, function(err: object, data: object) {
            console.log(err || data);
            resolve(data);
        });

    })

}
