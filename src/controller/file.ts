import Base from './base.js';
import {think} from "thinkjs";
const fs = require('fs');
const path = require('path');
const rename = think.promisify(fs.rename, fs);
const util = require('util');
export default class extends Base {
    private files: FileList;
    /**
     * 上传图片
     * @params image file
     */
    async uploadImgAction() {
        const file = this.file('image');
        console.log(file,'file');
        if (!file || !file.type) {
           return  this.fail(-1, '图片不能为空', []);
        }
        if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            const fileName = think.uuid('v4');
            const gs = file.type.substring(6, file.type.length);
            const filepath = path.join(think.ROOT_PATH, 'www/static/card/' + fileName + '.' + gs);
            await think.mkdir(path.dirname(filepath));
            const readStream = fs.createReadStream(file.path);
            const writeStream = fs.createWriteStream(filepath);
            readStream.pipe(writeStream);
            await readStream.on('end', function() {
                fs.unlinkSync((this.files as any).upload.path);
            });
            return this.success({url: 'static/card/' + fileName + '.' + gs});
        } else {
            this.fail(-1, '请上传png或jpg格式的图片', []);
        }
    }
    /**
     * 上传DST EMB
     * @params dst file
     * @params order_no 订单号
     */
    async uploadOrderFile() {
        const file = this.file('image');
        if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            const fileName = think.uuid('v4');
            const gs = file.type.substring(6, file.type.length);
            const filepath = path.join(think.ROOT_PATH, 'www/static/card/' + fileName + '.' + gs);
            await think.mkdir(path.dirname(filepath));
            const readStream = fs.createReadStream(file.path);
            const writeStream = fs.createWriteStream(filepath);
            readStream.pipe(writeStream);
            await readStream.on('end', function() {
                fs.unlinkSync((this.files as any).upload.path);
            });
            return this.success({url: 'static/card/' + fileName + '.' + gs});
        } else {
            this.fail(-1, '请上传png或jpg格式的图片', []);
        }
    }
}
