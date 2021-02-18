import Base from './base';
import {ancestorWhere} from "tslint";
// import {think} from "thinkjs";
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const AdmZip = require('adm-zip');
export default class extends think.Controller {
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
}
