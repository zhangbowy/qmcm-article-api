import { think } from 'thinkjs';
import base from './base';

export default class extends base {
    fontListAction() {

    }

    articleListAction() {

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
    delArticleAction() {
        const rules = {
            article_id: {
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
    editArticleAction() {
        const rules = {
            article_id: {
                required: true,
                method: 'post'
            },
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

    getDetailAction() {
        const rules = {
            article_id: {
                required: true,
                method: 'get'
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

    publishAction() {
        const rules = {
            article_id: {
                required: true,
                method: 'post'
            },
            status: {
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
}
