import { think } from 'thinkjs';
import base from './base'
module.exports = class extends base {

    constructor(ctx: any) {
        super(ctx);
    }
    async addGoodsAction() {
        const rules = {
            name: {
                string: true,       // 字段类型为 String 类型
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            old_price: {
                required: true,
                method: 'post'
            },
            current_price: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            sum_stock: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            weight: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            // min_buy: {
            //     required: true,     // 字段必填
            //     method: 'post'       // 指定获取数据的方式
            // },
            // max_buy: {
            //     required: true,
            //     method: 'post'
            // },
            // desc: {
            //     string: true,
            //     required: true,
            //     method: 'post'
            // },
            images: {
                array: true,
                required: true,
                method: 'post'
            },
            express_fee:{
                required: true,
                method: 'post'
            },
            is_custom:{
                required: true,
                method: 'post'
            },
            express_type:{
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
    editGoodsAction() {
        const rules = {
            name: {
                string: true,       // 字段类型为 String 类型
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            old_price: {
                required: true,
                method: 'post'
            },
            current_price: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            sum_stock: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            weight: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            // min_buy: {
            //     required: true,     // 字段必填
            //     method: 'post'       // 指定获取数据的方式
            // },
            // max_buy: {
            //     required: true,
            //     method: 'post'
            // },
            express_fee:{
                required: true,
                method: 'post'
            },
            images: {
                array: true,
                required: true,
                method: 'post'
            },
            is_custom:{
                required: true,
                method: 'post'
            },
            express_type:{
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
    async goodsDetailAction() {
        const rules = {
            id: {
                required: true,     // 字段必填
                trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
            }
        }
        const flag = this.validate(rules);
        if (!flag) {
            // @ts-ignore
            return this.fail(-1, '商品Id不能为空', this.validateErrors);
        }
    }
    deleteGoodsAction() {
        const rules = {
            id: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            }
        }
        const msgs: object = {
            required: '{name}不能为空'
        };
        if (!this.validate(rules, msgs)) { // 校验不通过
            const keys: string[] = Object.keys(this.validateErrors);
            const msg: string = this.validateErrors[keys[0]];
            return this.fail(-1, msg);
        }
    }
    addCategoryAction() {
        const rules = {
            category_name: {
                required: true,
                trim: true,
                method: 'post'
            },
            parent_id: {
                required: true,
                trim: true,
                method: 'post'
            },
            image_path: {
                required: true,
                // trim: true,
                method: 'post'
            },
            link: {
                required: true,
                // trim: true,
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
    editCategoryAction() {
        const rules = {
            id: {
                required: true,
                trim: true,
                method: 'post'
            },
            category_name: {
                required: true,
                trim: true,
                method: 'post'
            },
            image_path: {
                required: true,
                // trim: true,
                method: 'post'
            },
            link: {
                required: true,
                // trim: true,
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
    delCategoryAction() {
        const rules = {
            id: {
                required: true,
                trim: true,
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
    getCategoryAction() {

    }
    goodsListAction() {

    }
    setStatusAction() {
        const rules = {
            id: {
                required: true,
                trim: true,
                method: 'post'
            },
            status: {
                required: true,
                trim: true,
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
};
