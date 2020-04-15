import { think } from 'thinkjs';

module.exports = class extends think.Logic {

    constructor(ctx: any) {
        super(ctx);
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
            age: {
                int: {min: 20, max: 60} // 20到60之间的整数
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
