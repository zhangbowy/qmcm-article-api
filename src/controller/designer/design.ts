import Base from './base.js';
import {think} from "thinkjs";
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const pinyin = require("node-pinyin");
const rename = think.promisify(fs.rename, fs);
const xml2js = require("xml2js");
export default class extends Base {

    /**
     * 设计师列表
     */
    async designerListAction(): Promise<any> {
        try {
            const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
            const designer_team_id: boolean = this.ctx.state.designer_info.designer_team_id;
            if (!is_leader_info) {
                return  this.fail(-1, '权限不足!');
            }
            const page: number = this.get('currentPage') || 1;
            const limit: number = this.get('pageSize') || 10;

            const shop_id: boolean = this.ctx.state.designer_info.shop_id;
            const designer_id: number = this.ctx.state.designer_info.designer_id;
            const res = await this.model('designer').page(page, limit).field('designer_id,designer_team_id,designer_name,avatar_url,designer_phone,is_active,is_leader,default_password,status,created_at,updated_at').where({ shop_id, designer_team_id, del: 0}).countSelect();
            // const res = await this.model('designer').page(page, limit).field('designer_id,designer_team_id,designer_name,avatar_url,designer_phone,is_active,is_leader,default_password,status,created_at,updated_at').where({designer_id: ['!=', designer_id], shop_id, designer_team_id, del: 0}).countSelect();
            return this.success(res, '请求成功!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 添加设计师
     * @param {designer_name} 设计师名称
     * @param {designer_phone} 设计师
     */
    async addDesignerAction(): Promise<any>  {
        try {
            const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
            const designer_team_id: boolean = this.ctx.state.designer_info.designer_team_id;
            if (!is_leader_info) {
                 return  this.fail(-1, '权限不足, 您不是团队管理者!');
             }
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_name = this.post('designer_name');
            const designer_phone = this.post('designer_phone');
            const avatar_url = this.post('avatar_url');
            const user = await this.model('designer').where({del: 0, designer_phone}).find();
            if (!think.isEmpty(user)) {
                return  this.fail(-1, '手机号已被使用!');
            }
            /**
             * 设计师后台 管理者添加 默认都是 0
             */
            const is_leader =  0;
            const designer_password = think.md5('888888');
            const default_password = '888888';
            const params = {
                designer_team_id,
                designer_name,
                designer_phone,
                avatar_url,
                designer_password,
                is_leader,
                default_password,
                shop_id
            };
            const res: any = await this.model('designer').add(params);
            if (!res) {
                return  this.fail(-1, '添加失败!');
            }
            return this.success({designer_id: res, designer_phone, default_password}, '添加成功!');
        } catch ($err) {
            this.dealErr($err);
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

    /**
     * 禁用启用设计师
     * @param {designer_id} 设计师名称
     * @param {status} 状态 1 启用  2 禁用
     */
    async setEnabledAction(): Promise<any>  {
        try {
            const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
            if (!is_leader_info) {
                return  this.fail(-1, '权限不足!');
            }
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_id = this.post('designer_id');
            const status1 = Number(this.post('status'));
            let status;
            if (status1)  {
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
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 删除设计师
     * @param {designer_id} 设计师名称
     * @param {designer_phone} 设计师
     */
    async delDesignerAction(): Promise<any>  {
        try {
            const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
            if (!is_leader_info) {
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
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 花样列表
     */
    async designListAction(): Promise<any>  {
        try {
            const page: number = this.get('currentPage') || 1;
            const limit: number = this.get('pageSize') || 10;
            const design_name: string = this.get('design_name') || '';
            const designer_id: string = this.get('designer_id') || 0;
            const status: number = Number(this.get('status')) || 0;
            /**
             * 设计师信息
             */
            const designer_info = this.ctx.state.designer_info;
            const shop_id: number = designer_info.shop_id;
            const designer_id_own: number = designer_info.designer_id;
            const designer_team_id: number = designer_info.designer_team_id;
            /**
             * 默认条件 查团队的花样
             */
            const where: any = {shop_id, designer_team_id, del: 0, design_name: ['like', `%${design_name}%`]};
            /**
             * 普通设计师
             */
            if (!designer_info.is_leader) {
                /**
                 * 条件限制自己
                 */
                where.designer_id = designer_id_own;
            } else {
                /**
                 * 设计师管理员 灵活查下级
                 */
                if (designer_id) {
                    where.designer_id = designer_id;
                }
            }

            if (status) {
                where.status = status;
            }
            // tslint:disable-next-line:max-line-length
            const res = await this.model('design').where(where).order('created_at DESC').page(page, limit).countSelect();
            return this.success(res, '请求成功!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 花样列表数量统计
     * @param {design_name} 花样名称
     * @param {designer_id} 设计师id
     */
    async designCountAction() {
        try {
            const design_name: string = this.get('design_name') || '';
            const designer_id: string = this.get('designer_id');
            /**
             * 设计师信息
             */
            const designer_info = this.ctx.state.designer_info;
            const shop_id: number = designer_info.shop_id;
            const designer_team_id: number = designer_info.designer_team_id;
            const designer_id_own: number = designer_info.designer_id;

            /**
             * 默认条件 查团队的花样
             */
            const where: any = {shop_id, designer_team_id, del: 0, design_name: ['like', `%${design_name}%`]};
            /**
             * 普通设计师
             */
            if (!designer_info.is_leader) {
                /**
                 * 普通设计师 条件限制自己
                 */
                where.designer_id = designer_id_own;
            } else {
                /**
                 * 设计师管理员 灵活查下级
                 */
                if (designer_id) {
                    where.designer_id = designer_id;
                }
            }
            const statusList = [
                {
                    _status: "全部",
                    status: 0,
                    count: 0
                },
                {
                    _status: "待标定价格",
                    status: 1,
                    count: 0
                },
                {
                    _status: "待上架",
                    status: 2,
                    count: 0

                },
                {
                    _status: "已上架",
                    status: 3,
                    count: 0
                }
            ];
            const res = await this.model('design').where(where).order('created_at DESC').count('status');
            for (const item of statusList) {
                where.status = item.status;
                const count =  await this.model('design').where(where).order('created_at DESC').count('status');
                const index = statusList.indexOf(item);
                statusList[index].count = count;
            }
            statusList[0].count = res;
            return this.success(statusList, '请求成功!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    async addDesignAction(): Promise<any> {
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

            const file = this.file('design');

            if (!file || !file.type) {
                return this.fail(-1, '导入文件不能为空', []);
            }
            const filepath = path.join(think.ROOT_PATH, 'www/static/updesign/');
            if (file && (file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
                const res: any = await this.exportFile(file.path);
                if (typeof res === 'string') {
                    this.deleteFolder(filepath);
                    return this.fail(-1, res);
                }
                const param: any = res.fileObj;
                param.design_name = design_name;
                param.designer_id = designer_id;
                param.shop_id = shop_id;
                param.designer_team_id = designer_team_id;
                const oss = await think.service('oss');
                /**
                 * 上传到腾讯OSS
                 */
                const ossRes: any = await oss.uploadFiles(res.fileList);

                const design_id = await this.model('design').add(param);
                if (!design_id) {
                    return this.fail(-1, "添加失败!");
                }
                this.deleteFolder(filepath);
                return this.success([], "添加成功!");
            } else {
                return this.fail(-1, '上传文件格式必须为zip');
            }
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 添加花样
     * @params {dst} dst文件路径
     * @params {emb} emb文件路径
     * @params {png} png文件路径
     * @params {txt_png}
     * @params {txt_file}
     * @params {designer_id}
     * @params {designer_team_id}
     * @params {shop_id}
     * status 废弃 改为上传压缩包
     */
    async addDesignAction1(): Promise<any>  {
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
            const param: any = await this.uploadDesign();
            if (typeof param === "string") {
                return this.fail(-1, param);
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
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 编辑花样
     * @params {dst} dst文件路径
     * @params {emb} emb文件路径
     * @params {png} png文件路径
     * @params {txt_png} 工艺单预览图
     * @params {design_name} 花样名称
     * @returns boolean
     */
    async editDesignAction1() {
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
            // const design_name: string = this.post('design_name');
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
            const design_id: number = this.post('design_id');
            const design = await this.model('design').where({shop_id, designer_id, designer_team_id, design_id}).find();
            if (think.isEmpty(design)) {
                return this.fail(-1, '花样不存在或不属于你');
            }

            const param: any = await this.uploadDesign();
            if (typeof param === "string") {
                return this.fail(-1, param);
            }
            // param.design_name = design_name;
            // param.designer_id = designer_id;
            // param.shop_id = shop_id;
            // param.designer_team_id = designer_team_id;
            const res = await this.model('design').where({shop_id, designer_id, designer_team_id, design_id}).update(param);
            if (!res) {
                return  this.fail(-1, '修改失败');
            }
            return this.success([], "修改成功!");
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 编辑花样
     * @param {dst_path} dst文件路径
     * @param {emb_path} emb文件路径
     * @param {prev_png_path} png预览图文件路径
     * @param {txt_png_path} 工艺单预览图路径
     * @returns boolean
     */
    async editDesignAction(): Promise<any> {
        try {
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_id: number = this.ctx.state.designer_info.designer_id;
            const designer_team_id: number = this.ctx.state.designer_info.designer_team_id;
            const design_id: number = Number(this.post('design_id'));
            const dst_path: string = this.post('dst_path');
            const emb_path: string = this.post('emb_path');
            const prev_png_path: string = this.post('prev_png_path');
            const txt_png_path: string = this.post('txt_png_path');
            const res = await this.model('design').where({designer_team_id, design_id, shop_id, designer_id}).update({
                dst_path,
                emb_path,
                prev_png_path,
                txt_png_path
            });
            if (!res) {
                return this.fail(-1, '花样不存在或不是属于你的花样');
            }
            return this.success([], '操作成功!');
        } catch (e) {
            this.dealErr(e);
        }
   }

    /**
     * 删除花样
     * @param {design_id} 花样id
     */
    async delDesignAction(): Promise<any>  {
        try {
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_id: number = this.ctx.state.designer_info.designer_id;
            const design_id = this.post('design_id');

            const designer: any = await this.model('design').where({shop_id, designer_id, design_id, del: 0}).update({del: 1});
            if (!designer) {
                return  this.fail(-1, '没有这个花样!');
            }
            return this.success([], '删除成功!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 标价
     * @param {design_id} 花样id
     * @param {price} 花样价格
     */
    async setPriceAction(): Promise<any>  {
        try {
            const is_leader_info: boolean = this.ctx.state.designer_info.is_leader;
            if (!is_leader_info) {
                return  this.fail(-1, '权限不足!');
            }
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_id: number = this.ctx.state.designer_info.designer_id;
            const designer_team_id: number = this.ctx.state.designer_info.designer_team_id;
            const design_id = this.post('design_id');
            const price = this.post('price');
            const designs =  await this.model('design').where({shop_id, designer_team_id, design_id, del: 0}).find();
            if (think.isEmpty(designs)) {
                return  this.fail(-1, '没有这个花样!');
            }
            const updateOptions: any = {
                price
            };
            if (designs.status == 1) {
                updateOptions.status = 2;
                updateOptions._status = '待上架';
            }
            const design: any = await this.model('design').where({shop_id, designer_team_id, design_id, del: 0}).update(updateOptions);
            return this.success([], '操作成功!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 上下架
     * @param {design_id} 花样id
     * @param {status} 花样价格
     */
    async setStatusAction(): Promise<any>  {
        try {
            return false;
            const shop_id: number = this.ctx.state.designer_info.shop_id;
            const designer_id: number = this.ctx.state.designer_info.designer_id;
            const designer_team_id: number = this.ctx.state.designer_info.designer_team_id;
            const design_id = this.post('design_id');
            const status = this.post('status');
            const designs =  await this.model('design').where({shop_id, designer_team_id, design_id, del: 0}).find();
            if (think.isEmpty(designs)) {
                return  this.fail(-1, '没有这个花样!');
            }
            if (designs.status == 1) {
                return  this.fail(-1, '该花样还未标定价格!');
            }
            if (status != 2 && status != 3) {
                return  this.fail(-1, '不被允许的状态!');
            }
            let _status;
            if (status == 1 ) {
                _status = '待上架';
            } else {
                _status = '已上架';
            }
            const updateOptions: any = {
                status,
                _status
            };
            const design: any = await this.model('design').where({shop_id, designer_team_id, design_id, del: 0}).update(updateOptions);
            return this.success([], '操作成功!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 上传花样文件
     */
    async uploadDesign(): Promise<any> {
        try {
            const emb_path = this.file('emb');
            const dst_path = this.file('dst');
            const prev_png_path = this.file('prev_png');
            const txt_png_path = this.file('txt_png');
            if (!emb_path || !emb_path.type) {
                return 'emb不能为空';
            }
            if (!dst_path || !dst_path.type) {
                return  'dst不能为空';
            }
            if (!prev_png_path || !prev_png_path.type) {
                return  'png不能为空';
            }
            if (!txt_png_path || !txt_png_path.type) {
                return  'txt_png不能为空';
            }
            const arrObj = {
                emb_path: "emb" ,
                dst_path: "dst" ,
                prev_png_path: "prev_png" ,
                txt_png_path: "txt_png" ,
            };
            const resultObj = {};
            const oss = await think.service('oss');
            const design_info = this.ctx.state.designer_info;
            const shop_id: number = design_info.shop_id;
            const designer_id: number = design_info.designer_id;
            // tslint:disable-next-line:forin
            for (const k in arrObj) {
                const fileName = think.uuid('v4');
                const gs = this.file(arrObj[k]).type.substring(6, this.file(arrObj[k]).type.length);
                const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                const extname = path.extname(this.file(arrObj[k]).path);
                const filePath = `/design/${shop_id}/${designer_id}/${day}/${fileName}${extname}`;
                /**
                 * 上传到腾讯OSS
                 */
                const res: any = await oss.upload(this.file(arrObj[k]).path, filePath);
                resultObj[k] =  'http://' + res.Location;
            }
            return resultObj;
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 上传图片
     * @params image file
     * @params type 上传类型 design
     * @return IMAGE PATH
     */
    async uploadImgAction() {
        try {
            const design_info = this.ctx.state.designer_info;
            const shop_id: number = design_info.shop_id;
            const designer_team_id: number = design_info.designer_team_id;
            const file = this.file('image');
            const fileName = think.uuid('v4');
            // const gs = file.type.substring(6, file.type.length);
            const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
            let filePath;
            // @ts-ignore
            const upload_type = this.post('type') || "";
            /**
             * 获取文件后缀
             */
            const extname = path.extname(file.path);
            console.log(extname);
            if (file && file.type) {

                if (upload_type == 'design') {
                    // filePath = `/design/${shop_id}/${designer_team_id}/${day}/${fileName}.${gs}`;
                    filePath = `/design/${shop_id}/${designer_team_id}/${day}/${fileName}${extname}`;
                } else {
                    filePath = `/design/avatar/${shop_id}/${designer_team_id}/${day}/${fileName}${extname}`;
                    if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {

                    } else {
                        this.fail(-1, '请上传png或jpg格式的图片', []);
                    }
                }

                /**
                 * 上传到腾讯OSS
                 */
                const oss = await think.service('oss');
                const res: any = await oss.upload(file.path, filePath);
                return this.success('http://' + res.Location, '上传成功!');
            } else {
                this.fail(-1, '文件不能为空!');
            }
        } catch (e) {
           this.dealErr(e);
        }
    }

    async getDesignInfo($emb_path: any) {
        try {
            // const data = fs.readFileSync('3.EMB');
            let embBase64;
            let embBuffer;
            if ($emb_path instanceof Buffer) {
                embBuffer = $emb_path;
            } else {
               embBuffer = await this.getBuffer(this, $emb_path, true);
            }
            // @ts-ignore
            embBase64 = embBuffer.toString('base64');

            const post = this.post();
            // const embBuffer: any  = await this.getBuffer(this, url, true);
            const wilcom = think.service('wilcom');
            // const embData = await wilcom.getEmbByImg(imgBase64);
            const design_info = await wilcom.getDesignInfo(embBase64);
            const res: any = await this.parseXML(design_info);
            // @ts-ignore
            let threadList = res.design_info.colorways.colorway.threads.thread;
            let stop_recordList = res.design_info.stop_sequence.stop_record;
            if ( Object.prototype.toString.call(threadList) === '[object Object]') {
                threadList = [threadList];
            }
            if ( Object.prototype.toString.call(stop_recordList) === '[object Object]') {
                stop_recordList = [stop_recordList];
            }
            if (!stop_recordList || !Array.isArray(stop_recordList)) {
                return design_info;
            }
            /**
             * @tip 刺绣txt文件
             * 每一行构成: 色序+线号+(R,G,B)+品牌+针位。
             */
            let txt_str: string = '{\r\n';
            stop_recordList.forEach(($item: any, i: number) => {
                const color_index = Number($item.$.color_idx);
                const color = threadList[color_index].$;
                txt_str += `${i + 1}:${color.code}:${this.colorRgb(Number(color.color).toString(16))}:${color.brand}:${color_index + 1}\r\n`;
                // str += `${i};${color_index};${$item.$.num_stitches};${color.code};${color.brand};${this.colorRgb(Number(color.color).toString(16))}\r\n`;
            });
            txt_str += '}';
            // await fs.writeFileSync('1.txt', txt_str);
            // return this.success({design_info, txt_str, threadList, stop_recordList});
            return {txt_str};
        } catch (e) {
            // this.dealErr(e);
            return e.stack;
        }
    }
    // rgbToHex(r, g, b) { return ((r << 16) | (g << 8) | b).toString(16); }

    colorRgb($color: string) {
        // 16进制颜色值的正则
        const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        // 把颜色值变成小写
        if ($color.length == 1) {
            $color +=  '00000';

        }
        if ($color.length == 5) {
            $color +=  '0';
        }
        if ($color.length == 6) {
            // $color +=  '00';
            // $color = this.shiftCircle($color, 2);
            const start = $color.substr(0, 2);
            const mid = $color.substr(2, 2);
            const end = $color.substr(4, 2);
            $color =  end + mid + start;
        }
        if ($color.length == 2) {
            $color +=  '0000';
        }
        if ($color.length == 4) {
            const start = $color.substr(0, 2);
            const end = $color.substr(2, 2);
            $color =  end + start + '00';
        }

        let color = ('#' + $color).toLowerCase();
        if (reg.test(color)) {
            // 如果只有三位的值，需变成六位，如：#fff => #ffffff
            if (color.length === 4) {
                let colorNew = "#";
                for (let i = 1; i < 4; i += 1) {
                    colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
                }
                color = colorNew;
            }
            // 处理六位的颜色值，转为RGB
            // tslint:disable-next-line:prefer-const
            let colorChange = [];
            for (var i = 1; i < 7; i += 2) {
                // tslint:disable-next-line:radix
                colorChange.push( parseInt("0x" + color.slice(i, i + 2)) );
            }
            // return "RGB(" + colorChange.join(",") + ")";
            return '(' + colorChange.join(",") + ')';
        } else {
            return color;
        }
    }
    getString($string: string, $len?: number) {

        const len = $string.length;
        if (len < ($len || 10)) {
            for (let i = 1; i <= ($len || 10) - len; i++) {
                $string += ' ';
            }
        }
        return $string;
    }
   // @ts-ignore
    async parseXML(xml) {
        return new Promise((resolve, reject) => {
            // tslint:disable-next-line:prefer-const
            let parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
            // tslint:disable-next-line:only-arrow-functions
            parser.parseString(xml, function(err: any, result: any) {
                resolve(result);
            });
        });
    }

    /**
     *  下载资源接口
     *  @param {url} 资源链接
     *  @param {fileName} 文件名
     */
    async downLoadAction() {
        const file = this.get('url');
        const fileName = this.get('fileName');
        const fileBuffer = await getBuffer(this, file, true);
        await fs.writeFileSync('1.PNG', fileBuffer);
        this.download('1.PNG', fileName + '.png');
    }

}

/**
 * 獲取遠程圖片內容
 * @param $this
 * @param $filePath url
 * @param $buffer  output tpye of 1 buffer 0 base64
 */
async function getBuffer($this: any, $filePath: any, $buffer?: boolean) {

    const { Writable } = require('stream');
    // const res = await $this.fetch('http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/gallary/15/2020-04-22/6ca6e51d-028a-43d7-89a2-3537ccfe1adf.png');
    const res = await $this.fetch($filePath);
    const chunks: any = [];
    let size = 0;
    return new Promise((resolve, reject) => {
        /**
         * 创建可写流
         */
        const outStream = new Writable({
            write(chunk: Buffer, encoding: string, callback: any) {
                chunks.push(chunk);
                console.log(chunk);
                size += chunk.length;
                callback();
            },
            final() {
                /**
                 * 拼接Buffer
                 */
                const newBuffer = Buffer.concat(chunks, size);
                // @ts-ignore
                const img = 'data:image/png;base64,' + Buffer.from(newBuffer, 'utf8').toString('base64');
                if ($buffer) {
                    resolve(newBuffer);
                } else {
                    resolve(img);
                }
            }
        });
        res.body.pipe(outStream);
    });

}
