import Base from './base.js';
import {think} from "thinkjs";
const path = require('path');
const fs = require('fs');

export default class extends Base {
    async getCommissionAction() {
        try {
            /**
             * 设计师信息
             */
            const designer_info = this.ctx.state.designer_info;
            const shop_id: number = designer_info.shop_id;
            const designer_id: number = designer_info.designer_id;
            const designer_team_id: number = designer_info.designer_team_id;
            // const total_cash  = await this.model('designer').where({designer_team_id}).getField('designer_id');
            const total_commission  = await this.model('order').where({designer_team_id, designer_status: ['IN' ,  '2,3,4']}).sum('designer_price');
            const unfinishe_commission = await this.model('order').where({designer_team_id, designer_status: ['IN' ,  '2,3']}).sum('designer_price');
            const finished_commission = await this.model('order').where({designer_team_id, designer_status: ['IN' ,  '4']}).sum('designer_price');
            const audit_commission = await this.model('cash').where({designer_team_id, status: ['IN' ,  '1']}).sum('cash_amount') || 0;
            const withdrawals_commission = await this.model('cash').where({designer_team_id, status: ['IN' ,  '3']}).sum('cash_amount') || 0;
            const withdrawable_commission = finished_commission - audit_commission - withdrawals_commission;
            return this.success({total_commission, unfinishe_commission, finished_commission , withdrawable_commission, audit_commission , withdrawals_commission}, '设计师团队佣金');
        } catch (e) {
           this.dealErr(e);
        }
    }

    /**
     * 提现列表
     * @param {status} 1 提现中 2 已驳回 3 提现成功
     */
    async getCashListAction() {
        const page: number = this.get('currentPage') || 1;
        const limit: number = this.get('pageSize') || 10;
        const status: number = this.get('status') || 0;
        /**
         * 设计师信息
         */
        const designer_info = this.ctx.state.designer_info;
        const shop_id: number = designer_info.shop_id;
        const designer_id: number = designer_info.designer_id;
        const designer_team_id: number = designer_info.designer_team_id;

        const where: any = {shop_id, designer_team_id};
        if (status) {
            where.status = status;
        }
        const res = await this.model('cash').where(where).page(page, limit).countSelect();
        return this.success(res, '提现记录');
    }

    /**
     * 佣金提现
     * @param {cash_amount} 金额
     * @return boolean
     */
    async withdrawalAction() {
        try {
            /**
             * 设计师信息
             */
            const designer_info = this.ctx.state.designer_info;
            const shop_id: number = designer_info.shop_id;
            const designer_id: number = designer_info.designer_id;
            const designer_team_id: number = designer_info.designer_team_id;
            const designer_phone: string = designer_info.designer_phone;
            const cash_amount  = this.post('cash_amount');
            // const remark  = this.post('remark');

            const finished_commission = await this.model('order').where({designer_team_id, designer_status: ['IN' ,  '4']}).sum('designer_price');
            const Withdrawals_commission = await this.model('cash').where({status: ['IN', '1,3']}).sum('cash_amount');
            if (finished_commission - Withdrawals_commission < Number(cash_amount)) {
                return this.fail([], '可提现金额不足!');
            }
            const design_team = await this.model('designer_team').where({shop_id, designer_team_id}).find();
            const designer_team_name = design_team.designer_team_name;
            await this.model('cash').add({
                designer_team_id,
                designer_phone,
                designer_team_name,
                cash_amount,
                shop_id,
                // remark,
                status: 1,
                _status: '提现中!'
            });
            return this.success([], '申请成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }
}
