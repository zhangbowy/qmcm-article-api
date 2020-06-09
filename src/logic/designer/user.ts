import { think } from 'thinkjs';
import base from './base';
export default class extends base {
    loginAction() {

    }
    logoutAction() {

    }
    infoAction() {

    }
    sendSmsAction() {
        this.allowMethods = 'POST';
        const rules = {
            phone: {
                mobile: 'zh-CN',
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
    saveInfoAction() {
        this.allowMethods = 'POST';
        const rules = {
            avatar_url: {
                required: true,
                method: 'post'
            },

            designer_name: {
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
    changePsdAction() {
        this.allowMethods = 'POST';
        const rules = {
            old_password: {
                required: true,
                method: 'post'
            },
            new_password: {
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
