import { think } from 'thinkjs';
import base from './base';

export default class extends base {
    getDataAction() {

    }
    getCashListAction() {
        this.allowMethods = 'GET';
    }
    cashRefusedAction() {
        this.allowMethods = 'POST';
        const rules = {
            cash_id: {
                string: true,
                required: true,
                method: 'post'
            },
            remark: {
                string: true,
                required: true,
                method: 'post'
            },
        };
        const msgs: object = {
            required: '{name}不能为空'
        };
        if (!this.validate(rules, msgs)) { // 校验不通过
            const keys: string[] = Object.keys(this.validateErrors);
            const msg: string = this.validateErrors[keys[0]];
            return this.fail(-1, msg);
        }
    }
    cashVerifyAction() {
        this.allowMethods = 'POST';
        const rules = {
            cash_id: {
                string: true,
                required: true,
                method: 'post'
            },
            cert: {
                string: true,
                required: true,
                method: 'post'
            },
            remark: {
                string: true,
                required: true,
                method: 'post'
            },
        };
        const msgs: object = {
            required: '{name}不能为空'
        };
        if (!this.validate(rules, msgs)) { // 校验不通过
            const keys: string[] = Object.keys(this.validateErrors);
            const msg: string = this.validateErrors[keys[0]];
            return this.fail(-1, msg);
        }
    }
}

