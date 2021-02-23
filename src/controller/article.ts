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
            const category_id = this.get('category_id') || 0;
            const where: any = {del: 0};

            if (category_id) {
                where.category = category_id;
            }
            if (!think.isEmpty(title)) {
                where.title = ['like', `%${title}%`];
            }
            if (status) {
                where.status = status;
            }

            const res = await think.model('article').where(where).page(page, limit)
                .order('created_at DESC').countSelect();
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
                        statusList[0].count += count_item.count;
                    }
                }
            }
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
            const is_publish = this.post('is_publish');
            // const summary = content.substr(1, 100);  // 摘要
            const project_id = 1;  // 摘要
            const article_no = think.datetime(new Date().getTime(), 'YYYYMMDDHHmmss') +  Math.round(Math.random() * 10);

            const options = await think.model('options').where({key: 'site_url'}).find();
            const site_url = options.value;
            if (think.isEmpty(site_url)) {
               return this.fail(-1, '网站域名未配置');
            }
            const full_path = `${site_url}/news/${article_no}.html`;

            const params: any = {
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
                full_path,
            };
            // 直接发布
            if (is_publish) {
                params.status = 2;
            }
            const result = think.model('article').add(params);
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
            const is_publish = this.post('is_publish');
            // const summary = content.substr(1, 100);  // 摘要
            const project_id = 1;  // 摘要
            const article_no = think.datetime(new Date().getTime(), 'YYYYMMDDHHmmss') +  Math.round(Math.random() * 10);
            const full_path = `https://test.qmycm.com/news/${article_no}.html`;
            const params: any =  {
                title,
                content,
                cover_image,
                author,
                category_id,
                seo_title,
                seo_desc,
                seo_keywords,
                summary
            };
            if (is_publish) {
                params.status = 2;
            }
            const result = await think.model('article').where({article_id}).update(params);
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
            if (think.isEmpty(result)) {
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
     * @param {article_id} 文章id
     * @return boolean
     */
    async seoAction() {
        try {
            const article_id = this.post('article_id');
            const article = await think.model('article').where({article_id, del: 0}).find();
            if (think.isEmpty(article.full_path)) {
                return this.fail(-1, '链接不全!');
            }
            const list = await think.model('options').select();
            const options: any = {};
            for (const item of list) {
                // tslint:disable-next-line:no-unused-expression
                options[item.key] = item.value;
            }
            if (think.isEmpty(options.baidu_seo_token)) {
                return this.fail(-1, '请先配置百度seo token');
            }
            const res: unknown = await pushUrl(article.full_path, options);
            const result = JSON.parse(res);
            if (think.isEmpty(result)) {
               return this.fail(-1, '未知错误');
            }
            /**
             * 百度接口的错误
             */
            if (result.error) {
                return this.fail(-1, result.message);
            }
            if (result.success > 0) {
                await think.model('article').where({article_id}).update({
                    is_push_success: 1
                });
                await think.model('article').where({article_id}).increment('push_success_count', 1);
            }
            const msg = `成功${result.success},当日剩余推送次数${result.remain}`;
            return this.success(result, msg);
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * test
     */
    async seo1Action() {
        try {
            // const url = 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&tn=baidu&wd=site%3Aqinkeji.cn&oq=1&rsv_pq=9e13c3fd0000f03d&rsv_t=452es9NwrMtlG18OYprzHlUEqzRM4SiTwRbb9rsYzh3PbKgkjL3z5FFj4us&rqlang=cn&rsv_enter=1&rsv_dl=tb&rsv_sug3=17&rsv_sug1=9&rsv_sug7=100&rsv_sug2=0&rsv_btype=t&inputT=4033&rsv_sug4=4578'
            const url = 'https://m.baidu.com/pu=sz%401321_480/s?word=site%3Aqinkeji.cn&sa=tb&rsv_t=2200EoMMe0fGnSJlPp31BzdhXgtECk49uGgnBRiBi%2FpjUrB5vzi8';
            const data = await this.fetch(url).then(res => res.text());
            // const data1 = data.replace(/\n/g, '');
            const reg1 = /<a class  ="result_title" href="(.*?)">/g;
            const res1 = data.match(reg1);
            let list = [];
            for (const item of res1) {
                const child = /href="(.*)">/.exec(item);
                list.push(child[1]);
            }

            // const res2 = reg1.exec(data1);
            // const res2 = reg1.test(data);

            // this.redirect(list[0])
            return this.success(list);
            // return this.success(res1);
            const res = await pushUrl('http://zb.qinkeji.cn/1.html');
            this.success(res);
        } catch (e) {
            this.dealErr(e);
        }
    }

    async optionsAction() {
        if (this.ctx.isMethod('get')) {
            const list = await think.model('options').select();
            const obj: any = {};
            for (const item of list) {
                // tslint:disable-next-line:no-unused-expression
                obj[item.key] = item.value;
            }
            this.success(obj);
        } else {
            const parmas = this.post();
            // tslint:disable-next-line:forin
            for (const item in parmas) {
                await think.model('options').where({key: item}).update({
                    value: parmas[item]
                });
            }
            return this.success([], '操作成功');
        }
    }
}

//content 是url 地址，一个字符串，一个或多个链接，中间使用\n分割
function pushUrl(content: any, $config: any) {
    // 需要推送的网站链接
    var path = `/urls?site=${$config.site_url}&token=${$config.baidu_seo_token}`;
    //对应配置post推送的接口说明
    // tslint:disable-next-line:prefer-const
    var options = {
        host: "data.zz.baidu.com",
        path: path,//接口的调用地址
        method: "post",
        "User-Agent": "curl/7.12.1",
        headers: {
            "Content-Type": "text/plain",
            "Content-Length": content.length
        }
    };
    const http = require('http');
    return new Promise((reslove, rej) => {
        // tslint:disable-next-line:prefer-const
        var req = http.request(options, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (data) {
                console.log("data:", data); //返回的数据
                reslove(data);
            });
            res.on('end', (resp) => {
                console.log('end' ,resp)
            })
            console.log(res.statusCode)
        });
        req.on('error', (e) => {
            console.log(`error: ${e}`);
        });
        req.write(content);
        req.end;
    });
}