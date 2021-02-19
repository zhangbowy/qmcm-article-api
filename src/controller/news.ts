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
            const hot_list = await think.model('article').where({del: 0, status: 2}).order('pv DESC').page(1, 10).select();
            const newest_list = await think.model('article').where({del: 0, status: 2}).order('created_at DESC').page(1, 10).select();
            this.assign('hot_list', hot_list);
            this.assign('newest_list', newest_list);
            if (think.isEmpty(article_no)) {
                /**
                 * 列表
                 */
                return  this.display();
            }
            /**
             * 当前文章
             */
            const result = await think.model('article').where({del: 0 , status: 2, article_no}).find();
            if (think.isEmpty(result)) {
                return  this.redirect('/news');
            }
            /**
             * 详情
             */
            this.assign('current_article', result);
            // 增加阅读
            await think.model('article').where({article_no}).increment('pv', 1);
            await think.model('article').where({article_no}).increment('real_pv', 1);
            return this.display('news_detail');
        } catch ($err) {
            // this.dealErr($err)
        }
    }
}
