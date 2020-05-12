import Base from './base.js';
import {think} from "thinkjs";

export default class extends Base {

    /**
     * 设计师列表
     */
    async designerListAction(): Promise<any> {
        // @ts-ignore
        const shop_id: number = this.ctx.state.admin_info.shop_id;
        const res = await this.model('designer_team').fieldReverse('del').where({shop_id,del: 0}).countSelect();
        return this.success(res, '请求成功!');
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
            if(!designer_team_id) {
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
            const default_password ='888888';
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
        }catch (e) {
            return this.fail(-1, e.stack || e);
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
        }catch (e) {
            return this.fail(-1, e.stack || e);
        }
    }

    /**
     * 删除设计师团队
     */
    async delDesignerAction(): Promise<any>  {
        const designer_team_id = this.post('designer_team_id');
        const res = await this.model('designer_team').where({designer_team_id}).update({del:1});
        if (!res) {
            return  this.fail(-1, '设计师团队不存在!');
        }
        return this.success([], '删除成功!');
    }
}
