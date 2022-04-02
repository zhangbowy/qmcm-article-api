import Base from './base';
import {ancestorWhere} from "tslint";
import {think} from "thinkjs";
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
            const env = think.env;
            const article_no = this.get('article_id');
            const hot_list = await think.model('article').field('article_id,full_path,title').where({
                del: 0,
                status: 2
            }).order('pv DESC').page(1, 10).select();
            const newest_list = await think.model('article').field('cover_image,article_id,full_path,title').where({
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
                this.redirect('/news/cate/index.html');
            }
            this.assign('hot_list', hot_list);
            this.assign('newest_list', newest_list);
            /**
             * 当前文章
             */
            const result = await think.model('article').cache(env + `article_no${article_no}`, {timeout: 1000 * 60}).where({del: 0, status: 2, article_no}).find();
            if (think.isEmpty(result)) {
                return this.redirect('/news');
            }
            const category = await think.model('item_category').field('id as category_id,category_name')
                .cache('category', {timeout: 5 * 60 * 1000}).where({del: 0}).select();
            for (const item of category) {
                item.url = `/news/cate/${item.category_id}.html`;
            }
            const current_cate = await think.model('item_category').field('id as category_id,category_name').where({
                id: result.category_id,
                del: 0
            }).cache(`cate_id${result.category_id}`, {timeout: 5 * 60 * 1000}).find();
            const next_article = await think.model('article').cache(env + `article_no${article_no}_next`, {timeout: 2 * 60 * 1000}).order('created_at DESC').where({status: 2, del: 0, category_id: result.category_id, article_id: ['<', result.article_id]}).find();
            const prev_article = await think.model('article').cache(env + `article_no${article_no}_prev`, {timeout: 2 * 60 * 1000}).order('created_at ASC').where({status: 2, del: 0, category_id: result.category_id, article_id: ['>', result.article_id]}).group('article_id').find();
            const list = await think.model('options').cache(env + `optionss`, {timeout: 2 * 60 * 1000}).select();
            const options: any = {};
            for (const item of list) {
                // tslint:disable-next-line:no-unused-expression
                options[item.key] = item.value;
            }
            this.assign('options', options);
            this.assign('current_cate', current_cate);
            this.assign('category', category);
            this.assign('current_article', result);
            this.assign('next_article', next_article);
            this.assign('prev_article', prev_article);
            // return this.success({newest_list, hot_list , next_article, prev_article, current_cate, category, current_article: result});
            // 增加阅读
            think.model('article').where({article_no}).increment('pv', 1);
            think.model('article').where({article_no}).increment('real_pv', 1);
            return this.display('blog-article');
        } catch ($err) {
            this.fail(-1, $err.stack);
        }
    }


    /**
     * 文章分类
     */
    async cateAction() {
        try {
            const env = think.env;
            const cate_id = this.get('cate_id');
            const page = this.get('page') || 1;
            let current_cate = null;
            if(cate_id && cate_id != 'index') {
                current_cate = await think.model('item_category').field('id as category_id,category_name').where({
                    id: cate_id,
                    del: 0
                }).find();
            }
            const category = await think.model('item_category').cache('category', {timeout: 2 * 60 * 1000}).field('id as category_id,category_name').where({del: 0}).select();
            for (const item of category) {
                item.url = `/news/cate/${item.category_id}.html`;
            }
            const hot_list = await think.model('article').where({
                del: 0,
                status: 2
            }).field('cover_image,article_id,full_path,title').order('pv DESC').page(1, 10).select();
            const newest_list = await think.model('article').where({
                del: 0,
                status: 2
            }).field('cover_image,article_id,full_path,title').order('created_at DESC').page(1, 10).select();
            const articleWhere = {
                del: 0,
                status: 2
            };
            if (current_cate) {
                articleWhere.category_id = current_cate.category_id;
            }
            const current_list = await think.model('article').where(articleWhere).cache(env + 'current_list' + page + '_' + cate_id, {timeout: 30 * 1000}).order('created_at DESC').page(page, 5).select();
            for (const new_item of current_list) {
                if (!think.isEmpty(new_item.seo_keywords)) {
                    new_item.seo_keywords = new_item.seo_keywords.split(',');
                } else {
                    new_item.seo_keywords = [];
                }
            }
            const count = await think.model('article').where(articleWhere).count('*');
            this.assign({
                hot_list,
                newest_list,
                current_list,
                count,
                page: Number(page),
                pageSize: 5,
                current_cate,
                category
            });
            await this.display('blog-journal');
        } catch ($err) {
            this.fail(-1, $err.stack);
        }
    }


    async newsListAction() {
        const page: number = this.get('currentPage') || 1;
        const limit: number = this.get('pageSize') || 4;
        const newest_list = await think.model('article').where({
            del: 0,
            status: 2
        }).field('article_id,full_path,title,summary,created_at,cover_image').order('created_at DESC').page(page, limit).select();
        this.success(newest_list, '新闻列表');
    }
}
