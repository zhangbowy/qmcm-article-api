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
        try {
            // @ts-ignore
            const page: number = this.get('currentPage') || 1;
            const limit: number = this.get('pageSize') || 10;
            const status: number = Number(this.get('status') || 0);
            const title: string = this.get('title') || '';
            const where: any = {};

            if (!think.isEmpty(title)) {
                where.title = ['like', `%${title}%`];
            }
            if (status) {
                where.status = status;
            }

            const res = await think.model('article').where(where).page(page, limit).order('created_at DESC').countSelect();
            const statusList = [
                {
                    _status: "全部",
                    status: 0,
                    count: 0
                },
                {
                    _status: "草稿箱",
                    status: 1,
                    count: 0
                },
                {
                    _status: "已发布",
                    status: 2,
                    count: 0
                },
                {
                    _status: "废纸篓",
                    status: 3,
                    count: 0
                },
            ];
            delete where.status;
            const counts = await think.model('article').field('status, count(*) as count').where(where).group('status').select();
            for (const item of statusList) {
                for (const count_item of counts) {
                    if (item.status == count_item.status) {
                        item.count = count_item.count;
                    }
                }
            }
            statusList[0].count = res.count;
            res.counts = statusList;
            this.success(res, '文章列表');
        } catch (e) {
            this.dealErr(e);
        }
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
            const summary = this.post('summary');
            // const summary = content.substr(1, 100);  // 摘要
            const project_id = 1;  // 摘要
            const article_no = think.datetime(new Date().getTime(), 'YYYYMMDDHHmmss') +  Math.round(Math.random() * 10);
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
     * @param {article_id} 文章id
     */
    async editArticleAction() {
        try {
            const article_id = this.post('article_id');
            const title = this.post('title');
            const content = this.post('content');
            const cover_image = this.post('cover_image');
            const author = this.post('author');
            const category_id = this.post('category_id');
            const seo_title = this.post('seo_title');
            const seo_desc = this.post('seo_desc');
            const seo_keywords = this.post('seo_keywords');
            const summary = this.post('summary');
            // const summary = content.substr(1, 100);  // 摘要
            const project_id = 1;  // 摘要
            const article_no = think.datetime(new Date().getTime(), 'YYYYMMDDHHmmss') +  Math.round(Math.random() * 10);
            const full_path = `https://test.qmycm.com/news/${article_no}.html`;
            const result = await hink.model('article').where({article_id}).update({
                title,
                content,
                cover_image,
                author,
                category_id,
                seo_title,
                seo_desc,
                seo_keywords,
                summary,
                // project_id,
                // article_no,
                // full_path
            });
            if (!result) {
                this.fail(-1, '修改失败');
            }
            this.success([], '操作成功');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 获取详情
     * @param {article_id} 文章id
     */
    async getDetailAction() {
        try {
            const article_id = this.get('article_id');
            const result = await think.model('article').where({article_id}).find();
            if (think.isEmpty(result)) {
                return this.fail(-1, '改文章不存在');
            }
            this.success(result, '文章详情');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 发布
     */
    async publishAction() {
        try {
            const status = this.post('status');
            const article_id = this.post('article_id');
            const statusList = [1, 2, 3];
            if (statusList.indexOf(Number(status)) == -1) {
                return this.fail(-1, '状态不存在');
            }
            const result = await think.model('article').where({del: 0, article_id}).update({
                status
            });
            if (!think.isEmpty(result)) {
                return this.fail(-1, '操作失败');
            }
            this.success([], '操作成功');
        } catch (e) {
            this.dealErr(e);
        }
    }
    /**
     * 删除文章
     * @param {article_id} 文章id
     */
    async delArticleAction() {
        try {
            const article_id = this.post('article_id');
            const result = await think.model('article').where({article_id}).update({
                del: 1, status: 3
            });
            if (think.isEmpty(result)) {
                return this.fail(-1, '改文章不存在');
            }
            this.success(result, '操作成功');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * seo接口
     */
    async seoAction() {
        try {
            // content 是url 地址，一个字符串，一个或多个链接，中间使用\n分割
            // function pushUrl (content) {
            //     // 需要推送的网站链接
            //     var path = '/urls?site=www.vuexx.com&token=提交秘钥'
            //     //对应配置post推送的接口说明
            //     var options = {
            //         host: "data.zz.baidu.com",
            //         path: path,//接口的调用地址
            //         method: "post",
            //         "User-Agent": "curl/7.12.1",
            //         headers: {
            //             "Content-Type": "text/plain",
            //             "Content-Length": content.length
            //         }
            //     };
            //     var req = http.request(options, function (res) {
            //         res.setEncoding("utf8");
            //         res.on("data", function (data) {
            //             console.log("data:", data); //返回的数据
            //         });
            //         res.on('end', (resp) => {
            //             console.log('end' ,resp)
            //         })
            //         console.log(res.statusCode)
            //     });
            //     req.on('error', (e) => {
            //         console.log(`error: ${e}`);
            //     });
            //     req.write(content);
            //     req.end;
            // }
        } catch (e) {

        }
    }
}
