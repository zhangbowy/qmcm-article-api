import Base from './base.js';
import {think} from "thinkjs";

export default class extends Base {

    /**
     * 设计师列表
     */
    async designerListAction(): Promise<any> {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const res = await this.model('designer_team').fieldReverse('del').where({shop_id, del: 0}).countSelect();
            return this.success(res, '请求成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 添加设计师
     * @param {designer_name} 设计师名称
     * @param {designer_phone} 设计师
     * @param {is_leader} 是否管理者
     */
    async addDesignerAction(): Promise<any> {
        try {
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const designer_team_name = this.post('designer_team_name');
            const designer_team_id: any = await this.model('designer_team').add({designer_team_name, shop_id});
            if (!designer_team_id) {
                return  this.fail(-1, '团队添加失败!');
            }
            const designer_name = this.post('designer_name');
            const designer_phone = this.post('designer_phone');
            const user = await this.model('designer').where({designer_phone}).find();
            if (!think.isEmpty(user)) {
                return  this.fail(-1, '手机号已被使用!');
            }
            /**
             * 后台添加的 是管理者 默认都为 1
             */
            const is_leader =  1;
            const designer_password = think.md5('888888');
            const default_password = '888888';
            const params = {
                designer_name,
                designer_phone,
                designer_team_id,
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
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 编辑设计师管理者/ 一个管理者就是一个团队
     * @param {designer_id} 设计师id
     * @param {designer_name} 设计师名称
     * @param {designer_phone} 设计师
     * @param {is_leader} 是否管理者
     */
    async editDesignerAction(): Promise<any> {
        try {
            const designer_id = this.post('designer_id');
            const designer_name = this.post('designer_name');
            const designer_phone = this.post('designer_phone');
            // const is_leader = this.post('is_leader');
            const params = {
                designer_name,
                designer_phone,
                // is_leader,
                // designer_team_id
            };
            const res: any = await this.model('designer').where({designer_id}).update(params);
            if (!res) {
                return  this.fail(-1, '修改失败!');
            }
            return this.success([], '修改成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 删除设计师团队
     * @param {designer_team_id} 设计师团队id
     */
    async delDesignerAction(): Promise<any>  {
        try {
            const designer_team_id = this.post('designer_team_id');
            const res = await this.model('designer_team').where({designer_team_id}).update({del: 1});
            if (!res) {
                return  this.fail(-1, '设计师团队不存在!');
            }
            return this.success([], '删除成功!');
        } catch (e) {
            this.dealErr(e);
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
            const designer_team_id: string = this.get('designer_team_id') || 0;
            const status: number = Number(this.get('status')) || 0;
            /**
             * 设计师信息
             */
            const admin_info = this.ctx.state.admin_info;
            const shop_id: number = admin_info.shop_id;
            // const designer_id_own: number = designer_info.designer_id;
            // const designer_team_id: number = designer_info.designer_team_id;
            /**
             * 默认条件 查团队的花样
             */
            const where: any = {shop_id, del: 0, design_name: ['like', `%${design_name}%`]};
            if (designer_team_id) {
                where.designer_team_id = designer_team_id;
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
            const designer_team_id: string = this.get('designer_team_id');
            /**
             * 设计师信息
             */
            const admin_info = this.ctx.state.admin_info;

            const shop_id: number = admin_info.shop_id;
            // const designer_team_id: number = admin_info.designer_team_id;
            // const designer_id_own: number = admin_info.designer_id;


            const where: any = {shop_id, del: 0, design_name: ['like', `%${design_name}%`]};
            if (designer_team_id) {
                where.designer_team_id = designer_team_id;
            }

            const statusList = [
                {
                    _status: "全部",
                    status: 0,
                    count: 0
                },
                // {
                //     _status: "待标定价格",
                //     status: 1,
                //     count: 0
                // },
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
            const res = await this.model('design').where({...where, status: ['IN', '2,3']}).order('created_at DESC').count('status');
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

    /**
     * 上下架
     * @param {design_id} 花样id
     * @param {status} 花样价格
     */
    async setStatusAction(): Promise<any> {
        try {
            const admin_info = this.ctx.state.admin_info;

            const shop_id: number = admin_info.shop_id;
            // const designer_id: number = this.ctx.state.designer_info.designer_id;
            // const designer_team_id: number = this.ctx.state.designer_info.designer_team_id;
            const design_id = this.post('design_id');
            const status = this.post('status');
            // const designs = await this.model('design').where({shop_id, designer_team_id, design_id, del: 0}).find();
            const designs = await this.model('design').where({shop_id,  design_id, del: 0}).find();
            if (think.isEmpty(designs)) {
                return this.fail(-1, '没有这个花样!');
            }
            if (designs.status == 1) {
                return this.fail(-1, '该花样还未标定价格!');
            }
            if (status != 2 && status != 3) {
                return this.fail(-1, '不被允许的状态!');
            }
            let _status;
            if (status == 1) {
                _status = '待上架';
            } else {
                _status = '已上架';
            }
            const updateOptions: any = {
                status,
                _status
            };
            const design: any = await this.model('design').where({
                shop_id,
                design_id,
                del: 0
            }).update(updateOptions);
            return this.success([], '操作成功!');
        } catch ($err) {
            this.dealErr($err);
        }
    }
}
