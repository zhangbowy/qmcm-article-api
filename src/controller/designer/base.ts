import {think} from 'thinkjs';
import restController from '../rest';
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
export default class extends restController {
    async __before() {
        this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
        this.header('Access-Control-Allow-Headers', ["x-requested-with", 'origin', 'content-type', 'design_sign']);
        this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
        this.header('Access-Control-Allow-Credentials', true);
        try {
          const whiteList = [ '/designer/user/login', '/designer/design/downLoad', '/designer/user/sendSms'];
          if (whiteList.indexOf(this.ctx.path) === -1) {
            // if (this.ctx.path.indexOf('designer/user/login') === -1 && this.ctx.path.indexOf('designer/design/downLoad') === -1) {
                const design_sign = this.header("design_sign");
                if (think.isEmpty(design_sign)) {
                    return this.fail(402, '未登录!', ['header not design_sign']);
                }
                const tokenFuc = think.service('token');
                const admin_data = await tokenFuc.parse1(design_sign);
                if (admin_data == null) {
                    return this.fail(402, '未登录!', ['token无效']);
                }
                // @ts-ignore
                const designer_info = await this.cache(`design-${admin_data.designer_id}`, undefined, 'redis');
                if (think.isEmpty(designer_info)) {
                    return this.fail(402, '未登录!', ['redis过期']);
                }

                // @ts-ignore
                const admin_redis_sign = await tokenFuc.parse1(await this.cache(`design-sign-${admin_data.designer_id}`, undefined, 'redis'));
                if (think.isEmpty(admin_redis_sign)) {
                  return this.fail(402, '未登录3!', []);
                }

                if (admin_data.iat < admin_redis_sign.iat) {
                   const location =  await this.getLocation(this.ip);
                   // return this.fail(401, `当前账号已于${admin_redis_sign.loginTime}在${location}登录!`, [admin_redis_sign]);
                  // return this.fail(402, `当前账号已于${admin_redis_sign.loginTime}在其他浏览器登录!`, [admin_redis_sign]);
                }

                this.ctx.state.designer_info = designer_info;
                // console.log(designer_info);
            } else {
                console.log(this.ctx.state.userInfo);
            }
        } catch (e) {
            return this.fail(1001, e);
        }
    }

    async exportFile($file: any, updOrder?: any) {

        const obj = [
            '.DST',
            '.EMB',
            '.PNG',
            '-1.PNG',
        ];
        // tslint:disable-next-line:max-line-length
        let objName: { order_emb_path: string; order_dst_path: string; order_png_path: string; order_txt_png_path: string; '.DST'?: undefined; '.EMB'?: undefined; '.PNG'?: undefined; '-1.PNG'?: undefined; } | { '.DST': string; '.EMB': string; '.PNG': string; '-1.PNG': string; order_emb_path?: undefined; order_dst_path?: undefined; order_png_path?: undefined; order_txt_png_path?: undefined; };
        if (updOrder) {
            objName = {
                '.DST': "order_dst_path",
                '.EMB': "order_emb_path",
                '.PNG': "order_png_path",
                '-1.PNG': "order_txt_png_path",
            };
        } else {
            objName = {
                '.DST': "dst_path",
                '.EMB': "emb_path",
                '.PNG': "prev_png_path",
                '-1.PNG': "txt_png_path",
            };
        }

        const design_info = this.ctx.state.designer_info;
        const shop_id: number = design_info.shop_id;
        const designer_id: number = design_info.designer_id;
        return new Promise(async (resolve, reject) => {
            const zip = new AdmZip($file);
            const aaa = zip.getEntries();
            const filepath = path.join(think.ROOT_PATH, 'www/static/updesign/');
            const path1 = path.dirname(filepath);
            think.mkdir(path1);
            zip.extractAllTo(filepath, true);
            if (fs.existsSync(filepath)) {
                const files = fs.readdirSync(filepath);
                if (files.length > 4) {
                    return resolve('请检查压缩包内是否包含多余文件!');
                }
                const fileList = [];
                const fileObj: any = {
                    txt_file_path: ""
                };
                const str = '';
                const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD-HH:mm:ss');
                let ossPath;
                if (updOrder) {
                    ossPath =  `/order/${shop_id}/${designer_id}/${day}/`;
                } else {
                    ossPath = `/design/${shop_id}/${designer_id}/${day}/`;
                }
                const fileLastList: any = [];
                for (const  v of obj) {
                    for (const item of files) {
                        if (item.indexOf(v) > -1) {
                            const fileName = think.uuid('v4');
                            const obj1 = {
                                Bucket: 'cos-cx-n1-1257124629', /* 桶 */
                                Region: 'ap-guangzhou',
                                Key: ossPath + fileName + v,
                                FilePath: filepath + item,
                            };
                            if (v === '.EMB') {
                                const embBuffer =  await fs.readFileSync(filepath + item);
                                const designController = this.controller('designer/design');
                                // @ts-ignore
                                const res = await designController.getDesignInfo(embBuffer);
                                if ( typeof res == 'string') {
                                    resolve(res);
                                }
                                await fs.writeFileSync(filepath + fileName + '.TXT', res.txt_str)
                                const obj2 = {
                                    Bucket: 'cos-cx-n1-1257124629', /* 桶 */
                                    Region: 'ap-guangzhou',
                                    Key: ossPath + fileName + '.TXT',
                                    FilePath: filepath + fileName + '.TXT',
                                };
                                fileList.push(obj2);
                                fileObj.txt_file_path = 'http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com' + ossPath + fileName + '.TXT';
                                fileObj.order_txt_file_path = 'http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com' + ossPath + fileName + '.TXT';
                            }
                            if (v === '.PNG' ) {
                                if (item.indexOf('-1.PNG') === -1) {
                                    fileList.push(obj1);

                                    fileLastList.push(v);
                                    fileObj[objName[v]] = 'http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com' + ossPath + fileName + v;
                                }
                            } else {
                                fileList.push(obj1);
                                fileLastList.push(v);
                                fileObj[objName[v]] = 'http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com' + ossPath + fileName + v;
                            }
                        }
                    }
                    // if (fileLastList.includes(v)) {
                    //     return resolve(`后缀为${v}的文件重复`)
                    // }
                    if (fileLastList.indexOf(v.toUpperCase()) == -1) {
                        resolve(`后缀${v}的文件不存在`);
                    }
                    // if (!files.indexOf(item)) {
                    //     // str+=item+','
                    //     resolve(`文件${item}不存在!`);
                    // } else {
                    //     let k;
                    //     if (item.indexOf('-')> -1) {
                    //         k = item.split('-')[0];
                    //     } else {
                    //         k = item.split('.')[0];
                    //     }
                    //     let obj = {
                    //         Bucket: 'cos-cx-n1-1257124629', /* 桶 */
                    //         Region: 'ap-guangzhou',
                    //         Key: ossPath + item,
                    //         FilePath: filepath+item,
                    //     };
                    //     fileList.push(obj);
                    //     fileObj[k] = 'http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com'+ossPath+item
                    // }
                }
                // const list = new Set(fileList);
                // resolve( Array.from(list))
                resolve({fileObj, fileList});
            } else {
                console.log('无文件');
            }
        });
    }

    __call() {
        return this.display('error/404.html');
    }
}
