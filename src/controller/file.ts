import Base from './base.js';
import {think} from "thinkjs";
const path = require('path');
const fs = require('fs');
const util = require('util');
const AdmZip = require('adm-zip');

interface UploadRes {
    Location: string;
    statusCode: number;
    headers?: any;
    ETag: string;
}

const rename = think.promisify(fs.rename, fs);
export default class extends Base {
    /**
     * 上传图片
     * @params image file
     * @params type 上传类型 design
     * @return IMAGE PATH
     */
    async uploadImgAction() {
        try {
            const shop_id = this.ctx.state.admin_info.shop_id;
            const file = this.file('image');
            const type = this.post('type');
            const fileName = think.uuid('v4');
            const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
            let filePath;
            const typeList = ['paymentCert'];
            /**
             * 获取文件后缀
             */
            const extname = path.extname(file.path);
            console.log(extname);
            if (file && file.type  && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
                if (!typeList.includes(type)) {
                    return  this.fail(-1, '上传类型不存在!');
                }
                let secondPath;
                if (type == 'paymentCert') {
                    secondPath =  `finance/${type}`;
                }
                filePath = `/others/${shop_id}/${secondPath}/${fileName}${extname}`;
                /**
                 * 上传到腾讯OSS
                 */
                const oss = await think.service('oss');
                const res: any = await oss.upload(file.path, filePath);
                return this.success('http://' + res.Location, '上传成功!');
            } else {
                this.fail(-1, '请上传png或jpg格式的图片', []);
            }
        } catch (e) {
            this.dealErr(e);
        }
    }
    private files: FileList;
    /**
     * 上传图片
     * @params image file
     * @params type 上传类型
     * @return IMAGE PATH
     */
    async uploadImgAction1() {

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
     * @params {file} 代码
     * @params {type} 上传类型 1、手机端 2、pc后台  3、设计师后台
     */
    async uploadCodeAction() {

        const file = this.file('file');
        const typeArr = [1, 2, 3];
        const type = Number(this.post('type'));
        if (!typeArr.includes(type)) {
            return  this.fail(-1, 'type不正确', []);
        }
        // tslint:disable-next-line:prefer-const
        let currentPath;
        // tslint:disable-next-line:prefer-const
        let resultPath;
        if (!file || !file.type) {
            return  this.fail(-1, '文件不能为空', []);
        }
        if (!this.post('type') || think.isEmpty(this.post('type'))) {
            return  this.fail(-1, '上传类型不能为空', []);
        }
        // tslint:disable-next-line:triple-equals
        if (file && (file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
            let filepath;
            if ( type == 1) {
                filepath = path.join('/root/release/ghao');
            } else if (type == 2)  {
                filepath = path.join('/root/release/admin');
            } else {
                filepath = path.join('/root/release/design');
            }
            this.deleteFolder(filepath);
            const zip = new AdmZip(file.path);
            console.log(filepath, 'filepath');
            const path1 = path.dirname(filepath);
            await think.mkdir(path1);
            const day = await think.datetime(new Date().getTime(), 'YYYY-MM-DD-HH:mm:ss');
            await think.timeout(2000);
            await zip.extractAllTo(filepath, true);
            const verPath =  path.join(filepath, day + "/");
            console.log(verPath, 'verPath');
            /**
             * 上传时间
             */
            await think.mkdir(verPath);
            return this.success([], "操作成功!");
        } else {
            this.fail(-1, '请上传正确的zip格式文件', []);
        }
    }

    /**
     * 上传证书
     */
    async uploadCertAction() {
        const file = this.file('cert');
        const fileName = think.uuid('v4');
        if (!file || !file.type) {
            return  this.fail(-1, '文件不能为空', []);
        }

        const gs = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length);
        const typeList = ['pem', 'p12'];
        if (!typeList.includes(gs)) {
            return  this.fail(-1, '文件格式仅支持.pem,.p12', []);
        }
        const shop_id = this.ctx.state.admin_info.shop_id;
        const filepath = path.join(think.ROOT_PATH, 'runtime/cert/' + shop_id + '.' + gs);
        think.mkdir(path.dirname(filepath));
        await rename(file.path, filepath);
        return this.success({url: 'runtime/cert/' + shop_id + '.' + gs});
    }
}
function deleteFolder($path: any) {
    let files = [];
    if (fs.existsSync($path)) {
        files = fs.readdirSync($path);
        // tslint:disable-next-line:only-arrow-functions
        files.forEach(function(file: any, index: any) {
            const curPath = $path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
