import Base from './base.js';
import {think} from "thinkjs";
const path = require('path');
const fs = require('fs');

export default class extends Base {

    async getDataAction() {
        const shop_id = this.ctx.state.admin_info.shop_id;
        const total_pay_amount: any = await this.model('order').where(`shop_id=${shop_id} and ` + '`status` NOT IN (1,-2,5,6)').sum('pay_amount');
        // const today_pay_amount: any = await this.model('order').where(`shop_id=${shop_id} and ` + '`status` NOT IN (1,-2,5,6)').sum('pay_amount');
        const total_commission  = await this.model('order').where({designer_status: ['IN' ,  '2,3,4']}).sum('designer_price');
        const audit_commission = await this.model('cash').where({shop_id, status: ['IN' ,  '1']}).sum('cash_amount') || 0;
        const withdrawals_commission = await this.model('cash').where({shop_id, status: ['IN' ,  '3']}).sum('cash_amount') || 0;

        return this.success({
            total_pay_amount,
            total_commission,
            audit_commission,
            withdrawals_commission
        });
    }
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
            const remark = this.post('remark');
            const shop_id = this.ctx.state.admin_info.shop_id;
            const verify_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');

            const res = await this.model('cash').where({shop_id, cash_id, status: 1}).update({verify_time, remark, _status: '已驳回!', status: 2});
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
            const verify_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');
            const res = await this.model('cash').where({shop_id, cash_id}).update({verify_time, _status: '提现成功!', status: 3, remark, cert});
            if (!res) {
                return this.fail(-1, '该提现申请不存在或状态已变更!');
            }
            return this.success([], '操作成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }
}
