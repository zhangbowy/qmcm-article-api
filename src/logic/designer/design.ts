import base from './base'
export default class extends base {

    designerListAction() {

    }
    addDesignerAction() {
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
    setEnabledAction() {
        const rules = {
            status: {
                string: true,
                required: true,
                method: 'post'
            },
            designer_id: {
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
        const rules = {
            designer_id: {
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
    addDesignAction() {
        const rules = {
            design_name: {
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
    delDesignAction() {
        const rules = {
            design_id: {
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

    setPriceAction() {
        const rules = {
            design_id: {
                string: true,
                required: true,
                method: 'post'
            },
            price: {
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
    setStatusAction() {
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
    designCountAction() {

    }
    downLoadAction() {

    }
    uploadImgAction() {

    }
    getDesignInfoAction() {

    }
}
