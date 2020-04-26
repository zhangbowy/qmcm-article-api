import Base from './base.js';
import {think} from "thinkjs";
import GalleryModel from "../model/gallery";
const path = require('path');
var COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const util = require('util');
const AdmZip = require('adm-zip');
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
     * 上传代码
     * @params image file
     * @params type 上传类型
     * @return IMAGE PATH
     */
    async uploadCodeAction() {

        const file = this.file('file');
        let typeArr = [1,2];
        const type = Number(this.post('type'));
        if (!typeArr.includes(type)) {
            return  this.fail(-1, 'type不正确', []);
        }
        let currentPath;
        let resultPath;
        if (!file || !file.type) {
            return  this.fail(-1, '文件不能为空', []);
        }
        if (!this.post('type') || think.isEmpty(this.post('type'))) {
            return  this.fail(-1, '上传类型不能为空', []);
        }
        // tslint:disable-next-line:triple-equals
        if (file && (file.type === 'application/zip' || file.type ==='application/x-zip-compressed')) {
            let filepath;
            if( type == 1) {
                filepath = path.join('/root/release/ghao/');
            } else  {
                filepath = path.join('/root/release/admin/');
            }
             deleteFolder(filepath);
            var zip = new AdmZip(file.path);
            console.log(filepath,'filepath');
            let path1 = path.dirname(filepath);
            await think.mkdir(path1);
            let day = think.datetime(new Date().getTime(), 'YYYY-MM-DD-HH:mm:ss');

            await zip.extractAllTo(filepath, true);
            let ver = path.dirname(filepath+day+'/');
            console.log(ver)
            /**
             * 上传时间
             */
            await think.mkdir(ver);
            return this.success([], "操作成功!");
        } else {
            this.fail(-1, '请上传正确的zip格式文件', []);
        }
    }
    /**
     * 上传oss
     * @params dst file
     */
    async uploadOssAction() {

    }
}
function deleteFolder(path: any) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file:any, index: any) {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
