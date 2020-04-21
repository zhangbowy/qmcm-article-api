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
        let res = await this.model('fonts').select();
        for (let item of res) {
            item.font_content = JSON.parse(item.font_content)
        }
        return this.success(res, "请求成功!");

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
            if (!file || !file.type) {
                return this.fail(-1, '导入文件不能为空', []);
            }
            const filepath = path.join(think.ROOT_PATH,'www/static/demo');
            if (file && (file.type === 'application/zip' || file.type ==='application/x-zip-compressed')) {
                let res1: any = await exportFile(file.path);
                if (typeof res1 == 'string') {
                    deleteFolder(filepath);
                    return this.fail(-1, res1)
                }
                const oss = await think.service('oss');
                /**
                 * 上传到腾讯OSS
                 */
                let res: any = await oss.uploadFiles(res1.fileList);
                let params = {
                    font_name,
                    font_content:JSON.stringify(res1.fileObj)
                };
                let data = await this.model('fonts').add(params);
                deleteFolder(filepath);
                return this.success([], "导入成功!");
            } else {
                return this.fail(-1, '导入文件格式必须为zip')

            }
        } catch (err) {
            // handle any errors
        }
    }
    async deleteFontAction() {
        let font_id = this.post('font_id');
        let font = await this.model('fonts').where({font_id:font_id}).find();

        if ((Object.keys(font)).length == 0) {
            return   this.fail(-1, '字体不存在!',[]);
        }
        let arr: any = [];
        let fontContent = JSON.parse(font.font_content);
        for (let k in fontContent) {
            let obj = {
                Key:fontContent[k]
            };
            arr.push(obj)
        }
        console.log(arr);
        let data =  await this.model('fonts').where({font_id}).delete();
        // @ts-ignore
        if(data) {
            const  oss  = think.service('oss');
            let del = await oss.deleteFile(arr);
            if(del.statusCode && del.statusCode == 200)
            {
                return this.success({del,data}, '删除成功!');
            }
            return   this.fail(-1, '删除失败!',del);
        }
    }
    indexAction() {
        // return this.display();
        // return this.redirect('http://www.wkdao.com', '走错路发现世界,走对路发现自己');
        const filepath = path.join(think.ROOT_PATH, 'view/index_index.html');
        return this.success([], "请求成功!");
        return  this.download(filepath);
    }
}

 function exportFile($file: any,$filePath?: any) {

    let obj = [
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
    return new Promise((resolve,reject) => {
        var zip = new AdmZip($file);
        let aaa = zip.getEntries();
        const filepath = path.join(think.ROOT_PATH,'www/static/demo/');
        let path1 = path.dirname(filepath);
        think.mkdir(path1);
        zip.extractAllTo(filepath, true);
        if(fs.existsSync(filepath)) {
            const files = fs.readdirSync(filepath);
            let fileList = [];
            let fileObj = {};
            let str = '';
            let day = think.datetime(new Date().getTime(), 'YYYY-MM-DD-HH:mm:ss');
            let ossPath = `/font/${day}/`;
          // @ts-ignore
            for (let item of obj) {
              if (!files.includes(item)) {
                  // str+=item+','
                  resolve(`文件${item}不存在!`);
              } else {
                  let k;
                  if (item.indexOf('-')> -1) {
                      k = item.split('-')[0];
                  } else {
                      k = item.split('.')[0];
                  }
                  let obj = {
                      Bucket: 'cos-cx-n1-1257124629', /* 桶 */
                      Region: 'ap-guangzhou',
                      Key: ossPath + item,
                      FilePath: filepath+item,
                  };
                  fileList.push(obj);
                  fileObj[k] = 'http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com'+ossPath+item
              }
          }
            resolve({fileObj,fileList});
        }else
        {
            console.log('无文件')
        }
    })

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
