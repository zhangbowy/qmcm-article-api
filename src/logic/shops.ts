import { think } from 'thinkjs';
import base from './base';

module.exports = class extends base {

    constructor(ctx: any) {
        super(ctx);
    }
    async shopListAction() {

    }
    async editShopAction() {
        const rules = {
            shop_id: {
                required: true,     // 字段必填
                trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
            },
            system_end_time: {
                string: true,       // 字段类型为 String 类型
                required: true,     // 字段必填
                trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
            },
            shop_name: {
                string: true,       // 字段类型为 String 类型
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            logo: {
                string: true,
                required: true,
                method: 'post'
            },
            phone: {
                string: true,       // 字段类型为 String 类型
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
        };
        const flag = this.validate(rules);
        if (!flag) {
            // @ts-ignore
            return this.fail(-1, 'validate error', this.validateErrors);
        }
    }
     async addShopAction() {
        const rules = {
            system_end_time: {
                string: true,       // 字段类型为 String 类型
                required: true,     // 字段必填
                trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
            },
            shop_name: {
                string: true,       // 字段类型为 String 类型
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            logo: {
                string: true,
                required: true,
                method: 'post'
            },
            phone: {
                string: true,       // 字段类型为 String 类型
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            password: {
                string: true,       // 字段类型为 String 类型
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
        };
        const flag = this.validate(rules);
        if (!flag) {
            // @ts-ignore
            return this.fail(-1, 'validate error', this.validateErrors);
        }
    }
   async delShopAction() {
       const rules = {
           shop_id: {
               string: true,       // 字段类型为 String 类型
               required: true,     // 字段必填
               method: 'post'       // 指定获取数据的方式
           },
       };
       const flag = this.validate(rules);
       if (!flag) {
           // @ts-ignore
           return this.fail(-1, 'validate error', this.validateErrors);
       }
   }

};
