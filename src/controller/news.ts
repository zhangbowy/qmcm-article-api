import Base from './base';
import {ancestorWhere} from "tslint";
// import {think} from "thinkjs";
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const AdmZip = require('adm-zip');
export default class extends think.Controller {
    /**
     * 默认控制器
     */
    async indexAction() {
        try {
            const article_no = this.get('article_id');
            const hot_list = await think.model('article').field('article_id,full_path,title').where({
                del: 0,
                status: 2
            }).order('pv DESC').page(1, 10).select();
            const newest_list = await think.model('article').field('article_id,full_path,title').where({
                del: 0,
                status: 2
            }).order('created_at DESC').page(1, 10).select();
            // const current_list = await think.model('article').where({del: 0, status: 2}).order('created_at DESC').page(1, 10).select();
            if (think.isEmpty(article_no)) {
                /**
                 * 列表
                 */
                // return  this.display();
                // return this.success({newest_list, hot_list});
                this.redirect('/news/cate/45.html');
            }
            this.assign('hot_list', hot_list);
            this.assign('newest_list', newest_list);
            /**
             * 当前文章
             */
            const result = await think.model('article').where({del: 0, status: 2, article_no}).find();
            if (think.isEmpty(result)) {
                return this.redirect('/news');
            }
            const category = await think.model('item_category').field('id as category_id,category_name').where({del: 0}).select();
            for (const item of category) {
                category.url = `/news/cate/${item.category_id}.html`;
            }
            const current_cate = await think.model('item_category').field('id as category_id,category_name').where({
                id: result.category_id,
                del: 0
            }).find();
            this.assign('current_cate', current_cate);
            this.assign('category', category);
            this.assign('current_article', result);
            // return this.success({newest_list, hot_list , current_cate, category, current_article: result});
            // 增加阅读
            await think.model('article').where({article_no}).increment('pv', 1);
            await think.model('article').where({article_no}).increment('real_pv', 1);
            return this.display('news_detail');
        } catch ($err) {
            this.fail(-1, $err.stack);
        }
    }

    async cateAction() {
        try {
            const cate_id = this.get('cate_id');
            const page = this.get('page') || 1;
            let current_cate = await think.model('item_category').field('id as category_id,category_name').where({
                id: cate_id,
                del: 0
            }).find();
            const category = await think.model('item_category').cache('category', {timeout: 2 * 60 * 1000}).field('id as category_id,category_name').where({del: 0}).select();
            if (think.isEmpty(current_cate)) {
                current_cate = category[0];
            } else {
                // current_cate = current_cate.category_id;
            }
            for (const item of category) {
                item.url = `/news/cate/${item.category_id}.html`;
            }
            const hot_list = await think.model('article').where({
                del: 0,
                status: 2
            }).cache('hot_list', {timeout: 2 * 60 * 1000}).field('article_id,full_path,title').order('pv DESC').page(1, 10).select();
            const newest_list = await think.model('article').where({
                del: 0,
                status: 2
            }).cache('newest_list', {timeout: 2 * 60 * 1000}).field('article_id,full_path,title').order('created_at DESC').page(1, 10).select();
            const current_list = await think.model('article').where({
                category_id: current_cate.category_id,
                del: 0,
                status: 2
            }).cache('current_list', {timeout: 30 * 1000}).order('created_at DESC').page(page, 5).select();
            const count = await think.model('article').cache('count', {timeout: 30 * 1000}).where({del: 0, status: 2}).count('*');
            this.assign({
                hot_list,
                newest_list,
                current_list,
                count,
                page,
                pageSize: 5,
                current_cate,
                category
            });
            await this.display('news_index');
            // this.success({hot_list, newest_list, current_list, count, page, pageSize: 5, current_cate, category});
        } catch ($err) {
            this.fail(-1, $err.stack);
        }
    }
}
