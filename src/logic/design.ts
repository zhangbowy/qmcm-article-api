import { think } from 'thinkjs';
import base from './base';

export default class extends base {

    designerListAction() {

    }
    addDesignerAction() {
        this.allowMethods = 'POST';
        const rules = {
            designer_name: {
                string: true,
                required: true,
                method: 'post'
            },
            designer_phone: {
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
    editDesignerAction() {
        this.allowMethods = 'POST';
        const rules = {
            designer_id: {
                string: true,
                required: true,
                method: 'post'
            },
            designer_name: {
                string: true,
                required: true,
                method: 'post'
            },
            designer_phone: {
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
    designListAction() {

    }
    designCountAction() {

    }
    setStatusAction() {
        this.allowMethods = 'POST';
        const rules = {
            design_id: {
                string: true,
                required: true,
                method: 'post'
            },
            status: {
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
    delDesignerAction() {

    }
    getCategoryAction() {
    }
    addCategoryAction() {
        const rules = {
            design_category_name: {
                required: true,
                trim: true,
                method: 'post'
            },

            image_path: {
                required: true,
                // trim: true,
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
    editCategoryAction() {
        const rules = {
            design_category_id: {
                required: true,
                trim: true,
                method: 'post'
            },
            design_category_name: {
                required: true,
                trim: true,
                method: 'post'
            },
            image_path: {
                required: true,
                // trim: true,
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
    delCategoryAction() {
        const rules = {
            design_category_id: {
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
    setCategoryAction() {
        const rules = {
            design_category_id: {
                required: true,
                trim: true,
                method: 'post'
            },
            design_id: {
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
    setPresellAction() {
        const rules = {
            is_presell: {
                required: true,
                trim: true,
                method: 'post'
            },
            design_id: {
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
}
