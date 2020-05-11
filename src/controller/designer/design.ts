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
    ETag: string
}

const rename = think.promisify(fs.rename, fs);
export default class extends Base {

    /**
     * 设计师列表
     */
    async designerListAction(): Promise<any> {
        const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
        const designer_team_id: boolean = this.ctx.state.designer_info.designer_team_id;
        if(!is_leader_info) {
            return  this.fail(-1, '权限不足!');
        }
        const shop_id: boolean = this.ctx.state.designer_info.shop_id;
        const designer_id: number = this.ctx.state.designer_info.designer_id;
        const res = await this.model('designer').field('designer_id,designer_team_id,designer_name,avatar_url,designer_phone,is_leader,default_password,status,created_at,updated_at').where({designer_id:['!=', designer_id], shop_id, designer_team_id, del: 0}).countSelect();
        return this.success(res, '请求成功!');
    }


    /**
     * 添加设计师
     * @param {designer_name} 设计师名称
     * @param {designer_phone} 设计师
     */
    async addDesignerAction() {
        try {
            const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
            const designer_team_id: boolean = this.ctx.state.designer_info.designer_team_id;
             if(!is_leader_info) {
                 return  this.fail(-1, '权限不足!');
             }
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_name = this.post('designer_name');
            const designer_phone = this.post('designer_phone');
            const user = await this.model('designer').where({designer_phone}).find();
            if (!think.isEmpty(user)) {
                return  this.fail(-1, '手机号已被使用!');
            }
            /**
             * 设计师后台 管理者添加 默认都是 0
             */
            const is_leader =  0;
            const designer_password = think.md5('888888');
            const default_password ='888888';
            const params = {
                designer_team_id,
                designer_name,
                designer_phone,
                designer_password,
                is_leader,
                default_password,
                shop_id
            };
            const res: any = await this.model('designer').add(params);
            if (!res) {
                return  this.fail(-1, '添加失败!');
            }
            return this.success([], '添加成功!');
        }catch (e) {
            return this.fail(-1, e.stack || e);
        }
    }


    /**
     * 编辑设计师
     * @param {designer_id} 设计师名称
     * @param {designer_phone} 设计师
     * @param {designer_phone} 设计师
     */
    async editDesignerAction(): Promise<any> {
        // try {
        //     const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
        //     if(!is_leader_info) {
        //         return  this.fail(-1, '权限不足!');
        //     }
        //     const shop_id: number = this.ctx.state.designer_info.shop_id;
        //     const designer_id = this.post('designer_id');
        //     const designer_name = this.post('designer_name');
        //     const designer_phone = this.post('designer_phone');
        //     /**
        //      * 设计师后台 管理者添加 默认都是 0
        //      */
        //     const params = {
        //         designer_name,
        //         designer_phone,
        //     };
        //     const res: any = await this.model('designer').where({shop_id, designer_id,status: 1, del: 0}).update();
        //     if (!res) {
        //         return  this.fail(-1, '添加失败!');
        //     }
        //     return this.success([], '添加成功!');
        // }catch (e) {
        //     return this.fail(-1, e.stack || e);
        // }
    }
    async setEnabledAction() {
        try {
            const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
            if(!is_leader_info) {
                return  this.fail(-1, '权限不足!');
            }
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_id = this.post('designer_id');
            const status1 = Number(this.post('status'));
            let status;
            if(status1)  {
                status = 1;
            } else {
                status = 0;
            }
            const designer: any = await this.model('designer').where({shop_id, designer_id, del: 0}).update({status});
            if (!designer) {
                return  this.fail(-1, '没有这个设计师!');
            }
            const res: any = await this.model('design').where({shop_id, designer_id}).update({status});
            if (!designer) {
                return  this.fail(-1, '操作失败!');
            }
            return this.success([], '操作成功!');
        }catch (e) {
            return this.fail(-1, e.stack || e);
        }
    }
    /**
     * 删除设计师
     * @param {designer_id} 设计师名称
     * @param {designer_phone} 设计师
     */
    async delDesignerAction() {
        try {
            const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
            if(!is_leader_info) {
                return  this.fail(-1, '权限不足!');
            }
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_id = this.post('designer_id');

            const designer: any = await this.model('designer').where({shop_id, designer_id, del: 0}).update({del: 1});
            const res: any = await this.model('design').where({shop_id, designer_id}).update({del: 1});
            if (!designer) {
                return  this.fail(-1, '没有这个设计师!');
            }
            return this.success([], '删除成功!');
        }catch (e) {
            return this.fail(-1, e.stack || e);
        }
    }

    async designListAction() {
        try {
            /**
             * 设计师信息
             */
            const designer_info = this.ctx.state.designer_info;
            const shop_id: number = designer_info.shop_id;
            const designer_id: number = designer_info.designer_id;
            const designer_team_id: number = designer_info.designer_team_id;

            let where: any = {shop_id, designer_team_id, del: 0};
            if(!designer_info.is_leader) {
                where.designer_id = designer_id;
            }

            const res = await this.model('design').where(where).countSelect();
            return this.success(res, '请求成功!');
        }catch (e) {
            return this.fail(-1, e.stack || e);
        }
    }

    /**
     * 添加花样
     * @params {dst_path} dst文件路径
     * @params {emb_path} emb文件路径
     * @params {png_path} png文件路径
     * @params {txt_png_path}
     * @params {txt_file_path}
     * @params {designer_id}
     * @params {designer_team_id}
     * @params {shop_id}
     */
    async addDesignAction() {
        try {
            /**
             * 设计师信息
             */
            const designer_info = this.ctx.state.designer_info;
            const shop_id: number = designer_info.shop_id;
            const designer_id: number = designer_info.designer_id;
            const designer_team_id: number = designer_info.designer_team_id;
            /**
             * 请求参数
             */
            const design_name: string = this.post('design_name');
            // const dst_path: string = this.post('dst_path');
            // const emb_path: string = this.post('emb_path');
            // const png_path: string = this.post('png_path');
            // const txt_png_path: string = this.post('txt_png_path');
            // const txt_file_path: string = designer_info.designer_team_id;
            // const params: object = {
            //     design_name,
            //     dst_path,
            //     emb_path,
            //     png_path,
            //     txt_png_path,
            //     designer_id,
            //     shop_id,
            //     designer_team_id
            // };
            let param: any = await this.uploadDesign();
            if (typeof param == "string") {
                return this.fail(-1, param)
            }
            param.design_name = design_name;
            param.designer_id = designer_id;
            param.shop_id = shop_id;
            param.designer_team_id = designer_team_id;
            const res = await this.model('design').add(param);
            if (!res) {
                return  this.fail(-1, '添加失败');
            }
            return this.success([], "上传成功!");
        }catch (e) {
            return this.fail(-1, e.stack || e);
        }
    }

    /**
     * 删除花样
     * @param {design_id} 花样id
     */
    async delDesignAction() {
        try {
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_id: number = this.ctx.state.designer_info.designer_id;
            const design_id = this.post('design_id');

            const designer: any = await this.model('design').where({shop_id, designer_id, design_id, del: 0}).update({del: 1});
            if (!designer) {
                return  this.fail(-1, '没有这个花样!');
            }
            return this.success([], '删除成功!');
        }catch (e) {
            return this.fail(-1, e.stack || e);
        }
    }
    /**
     * 上传图片 ----> OSS
     */
    async uploadDesign(): Promise<Object> {
        try {
            const emb_path = this.file('emb');
            const dst_path = this.file('dst');
            const prev_png_path = this.file('prev_png');
            const txt_png_path = this.file('txt_png');
            if (!emb_path || !emb_path.type) {
                return 'emb不能为空'
            }
            if (!dst_path || !dst_path.type) {
                return  'dst不能为空'
            }
            if (!prev_png_path || !prev_png_path.type) {
                return  'png不能为空'
            }
            if (!txt_png_path || !txt_png_path.type) {
                return  'txt_png不能为空'
            }
            let arrObj = {
                emb_path:"emb" ,
                dst_path:"dst" ,
                prev_png_path:"prev_png" ,
                txt_png_path:"txt_png" ,
            };
            let resultObj = {};
            const oss = await think.service('oss');
            const design_info = this.ctx.state.designer_info;
            const shop_id: number = design_info.shop_id;
            const designer_id: number = design_info.designer_id;
            // @ts-ignore
            for (let k in arrObj) {
                const fileName = think.uuid('v4');
                const gs = this.file(arrObj[k]).type.substring(6, this.file(arrObj[k]).type.length);
                let day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                let filePath = `/design/${shop_id}/${designer_id}/${day}/${fileName}.${gs}`;
                /**
                 * 上传到腾讯OSS
                 */
                let res: any = await oss.upload(this.file(arrObj[k]).path, filePath);
                resultObj[k] =  'http://' + res.Location;
            }
            return resultObj
        } catch (e) {
            return this.fail(-1, e.stack || e);
        }
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
