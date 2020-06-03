import { think } from 'thinkjs';
import base from './base';

export default class extends base {
    listAction() {

    }
    detailAction() {
        const rules = {
            order_no: {
                required: true,
                method: 'get'
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
    cancelAction() {
        const rules = {
            order_no: {
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
    payAction() {
        const rules = {
            order_no: {
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
    notifyAction() {

    }
    createAction() {
        const rules = {
            cart_list: {
                required: true,
                method: 'post'
            },
            address_id: {
                required: true,
                method: 'post'
            },
            shopping_type: {
                required: true,
                method: 'post'
            }
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
    calculationAction() {
        const rules = {
            cart_list: {
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
    loginDevAction() {

    }
    confirmReceivedAction() {
        const rules = {
            order_no: {
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
    delAddressAction() {
        const rules = {
            address_id: {
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
    /**
     * 收货地址 logic
     */
    addressAction() {

    }
    /**
     * 添加收货地址
     */
    addAddressAction() {
        const rules = {
            name: {
                required: true,
                method: 'post'
            },
            phone: {
                required: true,
                method: 'post'
            },
            province: {
                string: true,
                required: true,
                method: 'post'
            },
            province_code: {
                required: true,
                method: 'post'
            },
            city: {
                string: true,
                required: true,
                method: 'post'
            },
            city_code: {
                required: true,
                method: 'post'
            },
            area: {
                string: true,
                required: true,
                method: 'post'
            },
            area_code: {
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
    /**
     * 编辑收货地址
     */
    editAddressAction() {
        const rules = {
            address_id: {
                required: true,
                method: 'post'
            },
            name: {
                string: true,
                required: true,
                method: 'post'
            },
            phone: {
                required: true,
                method: 'post'
            },
            province: {
                string: true,
                required: true,
                method: 'post'
            },
            province_code: {
                required: true,
                method: 'post'
            },
            city: {
                string: true,
                required: true,
                method: 'post'
            },
            city_code: {
                required: true,
                method: 'post'
            },
            area: {
                string: true,
                required: true,
                method: 'post'
            },
            area_code: {
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
    orderTraceAction() {
        const rules = {
            order_item_id: {
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
    askOrderAction() {
        this.allowMethods = 'POST'
        const rules = {
            order_no: {
                required: true,
                method: 'post'
            },
            buyer_message: {
                required: true,
                method: 'post'
            },
            price: {
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
    crontabAction() {

    }
}
