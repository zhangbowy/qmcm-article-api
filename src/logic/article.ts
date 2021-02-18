import { think } from 'thinkjs';
import base from './base';

export default class extends base {
    fontListAction() {

    }
    addArticleAction() {
        const rules = {
            title: {
                string: true,
                required: true,
                method: 'post'
            },
            content: {
                string: true,
                required: true,
                method: 'post'
            },
            cover_image: {
                string: true,
                required: true,
                method: 'post'
            },
            author: {
                string: true,
                required: true,
                method: 'post'
            },
            category_id: {
                string: true,
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
    deleteFontAction() {
        const rules = {
            font_id: {
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
    editFontAction() {
        const rules = {
            font_id: {
                string: true,
                required: true,
                method: 'post'
            },
            font_name: {
                string: true,
                required: true,
                method: 'post'
            },
            min_height: {
                string: true,
                required: true,
                method: 'post'
            },
            max_height: {
                string: true,
                required: true,
                method: 'post'
            },
            preview_image: {
                string: true,
                required: true,
                method: 'post'
            },
            font_type: {
                required: true,
                method: 'post'
            },
        };
        const preview_image: number = this.post('preview_image');
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
