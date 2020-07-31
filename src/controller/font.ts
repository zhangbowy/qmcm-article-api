import Base from './base.js';
import {think} from "thinkjs";
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
export default class extends Base {
    /**
     * 上传oss
     * 字体列表
     */
    async fontListAction() {
        try {
            const res = await this.model('fonts').select();
            for (const item of res) {
                item.font_content = JSON.parse(item.font_content);
            }
            return this.success(res, "字体列表!");
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 导入字体
     * @params font 字体预览图压缩包
     * @params font_name 字体名称
     */
    async uploadFontAction() {
        try {
            const file = this.file('font');
            const font_name = this.post('font_name');
            const min_height = this.post('min_height');
            const max_height = this.post('max_height');
            const preview_image = this.post('preview_image');

            if (!file || !file.type) {
                return this.fail(-1, '导入文件不能为空', []);
            }
            const filepath = path.join(think.ROOT_PATH, 'www/static/demo');
            if (file && (file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
                const res1: any = await exportFile(file.path);
                if (typeof res1 == 'string') {
                    this.deleteFolder(filepath);
                    return this.fail(-1, res1);
                }
                const oss = await think.service('oss');
                /**
                 * 上传到腾讯OSS
                 */
                const res: any = await oss.uploadFiles(res1.fileList);
                const params = {
                    font_name,
                    max_height,
                    min_height,
                    preview_image,
                    font_content: JSON.stringify(res1.fileObj)
                };
                const data = await this.model('fonts').add(params);
                this.deleteFolder(filepath);
                return this.success([], "导入成功!");
            } else {
                return this.fail(-1, '导入文件格式必须为zip');
            }
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 编辑字体
     * @params { font_id }
     * @params { max_height } 最大高
     * @params { min_height } 最小高
     * @params { font_name } 最小高
     * @params { preview_image } 预览图
     */
    async editFontAction() {
        try {
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const font_id: number = this.post('font_id');
            const font_name: number = this.post('font_name');
            const min_height: number = this.post('min_height');
            const max_height: number = this.post('max_height');
            const preview_image: number = this.post('preview_image');
            const res = await this.model('fonts').where({font_id}).update({
                preview_image,
                max_height,
                min_height,
                font_name,
            });
            if (!res) {
                return this.fail(-1, '该字体不存在');
            }
            return this.success([], '编辑成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 删除字体
     * @params { font_id } 字体预览图压缩包
     */
    async deleteFontAction() {
        try {
            const font_id = this.post('font_id');
            const font = await this.model('fonts').where({font_id}).find();

            if ((Object.keys(font)).length == 0) {
                return  this.fail(-1, '字体不存在!', []);
            }
            const arr: any = [];
            const fontContent = JSON.parse(font.font_content);
            // tslint:disable-next-line:forin
            for (const k in fontContent) {
                const obj = {
                    Key: fontContent[k]
                };
                arr.push(obj);
            }
            console.log(arr);
            const data =  await this.model('fonts').where({font_id}).delete();
            // @ts-ignore
            if (data) {
                const  oss  = think.service('oss');
                const del = await oss.deleteFile(arr);
                if (del.statusCode && del.statusCode == 200) {
                    return this.success({del, data}, '删除成功!');
                }
                return this.fail(-1, '删除失败!', del);
            }
        } catch (e) {
           this.dealErr(e);
        }
    }
}

function exportFile($file: any, $filePath?: any) {

    const obj = [
        "0.PNG",
        "1.PNG",
        "2.PNG",
        "3.PNG",
        "4.PNG",
        "5.PNG",
        "6.PNG",
        "7.PNG",
        "8.PNG",
        "9.PNG",
        "a-1.PNG",
        "A.PNG",
        "b-1.PNG",
        "B.PNG",
        "c-1.PNG",
        "C.PNG",
        "d-1.PNG",
        "D.PNG",
        "e-1.PNG",
        "E.PNG",
        "f-1.PNG",
        "F.PNG",
        "g-1.PNG",
        "G.PNG",
        "h-1.PNG",
        "H.PNG",
        "i-1.PNG",
        "I.PNG",
        "j-1.PNG",
        "J.PNG",
        "k-1.PNG",
        "K.PNG",
        "l-1.PNG",
        "L.PNG",
        "m-1.PNG",
        "M.PNG",
        "n-1.PNG",
        "N.PNG",
        "o-1.PNG",
        "O.PNG",
        "p-1.PNG",
        "P.PNG",
        "q-1.PNG",
        "Q.PNG",
        "r-1.PNG",
        "R.PNG",
        "s-1.PNG",
        "S.PNG",
        "t-1.PNG",
        "T.PNG",
        "u-1.PNG",
        "U.PNG",
        "v-1.PNG",
        "V.PNG",
        "w-1.PNG",
        "W.PNG",
        "x-1.PNG",
        "X.PNG",
        "y-1.PNG",
        "Y.PNG",
        "z-1.PNG",
        "Z.PNG"
    ];
    return new Promise((resolve, reject) => {
        const zip = new AdmZip($file);
        const aaa = zip.getEntries();
        const filepath = path.join(think.ROOT_PATH, 'www/static/demo/');
        const path1 = path.dirname(filepath);
        think.mkdir(path1);
        zip.extractAllTo(filepath, true);
        if (fs.existsSync(filepath)) {
            const files = fs.readdirSync(filepath);
            const fileList = [];
            const fileObj = {};
            const str = '';
            const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD-HH:mm:ss');
            const ossPath = `/font/${day}/`;
          // @ts-ignore
            for (const item of obj) {
              if (!files.includes(item)) {
                  // str+=item+','
                  resolve(`文件${item}不存在!`);
              } else {
                  let k;
                  if (item.indexOf('-') > -1) {
                      k = item.split('-')[0];
                  } else {
                      k = item.split('.')[0];
                  }
                  const objItem = {
                      Bucket: 'cos-cx-n1-1257124629', /* 桶 */
                      Region: 'ap-guangzhou',
                      Key: ossPath + item,
                      FilePath: filepath + item,
                  };
                  fileList.push(objItem);
                  fileObj[k] = 'http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com' + ossPath + item;
              }
          }
            resolve({fileObj, fileList});
        } else {
            console.log('无文件');
        }
    });

}
