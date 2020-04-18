import { think } from 'thinkjs';
module.exports = class extends think.Logic {

    constructor(ctx: any) {
        super(ctx);
    }
    async addGoodsAction() {
        // const rules = {
        //     category: {
        //         string: true,       // 字段类型为 String 类型
        //         required: true,     // 字段必填
        //         trim: true,         // 字段需要trim处理
        //         method: 'post'       // 指定获取数据的方式
        //     },
        //     name: {
        //         string: true,       // 字段类型为 String 类型
        //         required: true,     // 字段必填
        //         method: 'post'       // 指定获取数据的方式
        //     },
        //     old_price: {
        //         string: true,
        //         required: true,
        //         method: 'post'
        //     },
        //     current_price: {
        //         string: true,       // 字段类型为 String 类型
        //         required: true,     // 字段必填
        //         method: 'post'       // 指定获取数据的方式
        //     },
        //     sum_stock: {
        //         string: true,       // 字段类型为 String 类型
        //         required: true,     // 字段必填
        //         method: 'post'       // 指定获取数据的方式
        //     },
        //     weight: {
        //         string: true,       // 字段类型为 String 类型
        //         required: true,     // 字段必填
        //         method: 'post'       // 指定获取数据的方式
        //     },
        //     min_buy: {
        //         string: true,       // 字段类型为 String 类型
        //         required: true,     // 字段必填
        //         method: 'post'       // 指定获取数据的方式
        //     },
        //     max_buy: {
        //         string: true,
        //         required: true,
        //         method: 'post'
        //     },
        //     desc: {
        //         string: true,
        //         required: true,
        //         method: 'post'
        //     },
        //     images: {
        //         string: true,
        //         required: true,
        //         method: 'post'
        //     },
        //
        // };
        // const flag = this.validate(rules);
        // if (!flag) {
        //     // @ts-ignore
        //     return this.fail(-1, 'validate error', this.validateErrors);
        // }
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
        // const rules = {
        //     id: {
        //         number: true,       // 字段类型为 String 类型
        //         required: true,     // 字段必填
        //         method: 'post'       // 指定获取数据的方式
        //     }
        // }
        // const flag = this.validate(rules);
        // if (!flag) {
        //     // @ts-ignore
        //     return this.fail(-1, '商品Id不能为空', this.validateErrors);
        // }
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
};
