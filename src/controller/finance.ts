import Base from './base.js';
import {think} from "thinkjs";
const path = require('path');
const fs = require('fs');

export default class extends Base {
    /**
     * 提现列表
     * @param {status} 1 提现中 2 已驳回 3 提现成功
     * @param {designer_team_id} 设计师团队id
     */
    async getCashListAction() {
        try {
            const page: number = this.get('currentPage') || 1;
            const limit: number = this.get('pageSize') || 10;
            const status: number = this.get('status') || 0;
            const designer_team_id: number = this.get('designer_team_id') || 0;
            const shop_id = this.ctx.state.admin_info.shop_id;

            const where: any = {shop_id};
            if (designer_team_id) {
                where.designer_team_id = designer_team_id;
            }
            if (status) {
                where.status = status;
            }
            const res = await this.model('cash').where(where).page(page, limit).countSelect();
            return this.success(res, '提现记录');
        } catch (e) {
           this.dealErr(e);
        }
    }

    /**
     * 驳回
     */
    async cashRefusedAction() {
        try {
            const cash_id = this.post('cash_id');
            const shop_id = this.ctx.state.admin_info.shop_id;
            const res = await this.model('cash').where({shop_id, cash_id, status: 1}).update({status: 2});
            if (!res) {
                return this.fail(-1, '该提现申请不存在或状态已变更!');
            }
            return this.success([], '操作成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 打款
     * @param  {cert}
     * @param  {remark}
     * @param  {cash_id}
     */
    async cashVerifyAction() {
        try {
            const shop_id = this.ctx.state.admin_info.shop_id;
            const cash_id = this.post('cash_id');
            const remark = this.post('remark');
            const cert = this.post('cert');
            const res = await this.model('cash').where({shop_id, cash_id}).update({status: 3, remark, cert});
            if (!res) {
                return this.fail(-1, '该提现申请不存在或状态已变更!');
            }
            return this.success([], '操作成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }
}
