import Base from './base';
import {ancestorWhere} from "tslint";
import {think} from "thinkjs";
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const AdmZip = require('adm-zip');

export default class extends Base {
    async indexAction() {
        try {
            // return this.redirect('http://www.wkdao.com', '走错路发现世界,走对路发现自己');
            // const filepath = path.join(think.ROOT_PATH, 'view/index_index.html');
            // const res = await this.fetch('http://www.wkdao.com/hangye/504.html#').then($res => $res.text())
            // return this.ctx.body = res;
            const article_id = this.get('article_id');
            const result = await think.model('article').where({article_id}).find();
            this.assign('current_article', result);
            return this.display();
            // return this.success(result, "请求成功!");
        } catch ($err) {
            // this.dealErr($err)
        }
    }

    /**
     * 文章列表接口
     */
    async articleListAction() {
        // @ts-ignore
        const page: number = this.get('currentPage') || 1;
        const limit: number = this.get('pageSize') || 10;
        // const status: number = Number(this.get('status') || -1);
        // const title: string = this.get('title') || '';
        const res = await think.model('article').page(page, limit).countSelect();
        this.success(res, '文章列表');
    }

    /**
     * 添加文章
     */
    async addArticleAction() {
        try {
            const title = this.post('title');
            const content = this.post('content');
            const cover_image = this.post('cover_image');
            const author = this.post('author');
            const category_id = this.post('category_id');
            const seo_title = this.post('seo_title');
            const seo_desc = this.post('seo_desc');
            const seo_keywords = this.post('seo_keywords');
            const summary = content.substr(1, 100);  // 摘要
            const project_id = 1;  // 摘要
            const article_no = think.datetime(new Date().getTime(), 'yyMMDDHHMMSS') +  Math.round(Math.random() * 10);
            const full_path = `https://test.qmycm.com/news/${article_no}.html`;

            const result = think.model('article').add({
                title,
                content,
                cover_image,
                author,
                category_id,
                seo_title,
                seo_desc,
                seo_keywords,
                summary,
                project_id,
                article_no,
                full_path
            });
            if (!result) {
                this.fail(-1, '添加失败');
            }
            this.success([], '操作成功');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 编辑文章
     * @param
     */
    editArticleAction() {
        try {

        } catch ($err) {

        }
    }
}
