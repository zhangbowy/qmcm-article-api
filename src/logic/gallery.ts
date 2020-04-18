import { think } from 'thinkjs';
module.exports = class extends think.Logic {
    constructor(ctx: any) {
        super(ctx);
    }
    indexAction() {
        const rules = {
            gallery_group_id: {
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
    setGroupAction() {
        const rules = {
            gallery_group_id: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
            },
            id: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
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
    deleteGroupAction() {
        const rules = {
            gallery_group_id: {
                required: true,     // 字段必填
                method: 'post'       // 指定获取数据的方式
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
    addGroupAction() {
        const rules = {
            parent_id: {
                required: true,     // 字段必填
                trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
            },
            group_name: {
                required: true,     // 字段必填
                trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
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
    editGroupAction() {
        const rules = {
            gallery_group_id: {
                required: true,     // 字段必填
                trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
            },
            group_name: {
                required: true,     // 字段必填
                // trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
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
    deleteAction() {
            // const rules = {
            //     id: {
            //         // number: true,       // 字段类型为 String 类型
            //         required: true,     // 字段必填
            //         method: 'post'       // 指定获取数据的方式
            //     }
            // }
            // const msgs: object = {
            //     required: '{name}不能为空'
            // };
            // if (!this.validate(rules, msgs)) { // 校验不通过
            //     const keys: string[] = Object.keys(this.validateErrors);
            //     const msg: string = this.validateErrors[keys[0]];
            //     return this.fail(-1, msg);
            // }
    }
    editAction() {
        const rules = {
            id: {
                required: true,     // 字段必填
                trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
            },
            img_name: {
                required: true,     // 字段必填
                trim: true,         // 字段需要trim处理
                method: 'post'       // 指定获取数据的方式
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
