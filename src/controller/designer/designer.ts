import Base from './base.js';
import {think} from "thinkjs";
const path = require('path');
const fs = require('fs');
const util = require('util');
const AdmZip = require('adm-zip');

interface UploadRes {
    Location: string;
    statusCode: number;
    headers?: any;
    ETag: string;
}

const rename = think.promisify(fs.rename, fs);
export default class extends Base {

    async addAction() {
        try {
            /**
             * 设计师信息
             */
            const designer_info = this.ctx.state.designer_info;
            const shop_id: number = designer_info.shop_id;
            const designer_id: number = designer_info.designer_id;
            const designer_team_id: number = designer_info.designer_team_id;

            const where: any = {shop_id, designer_team_id};
            if (!designer_info.is_leader) {
                where.designer_id = designer_team_id;
            }

            const res = await this.model('design').where(where).countSelect();
            return this.success(res, '请求成功!');
        } catch (e) {
            return this.fail(-1, e.stack || e);
        }
    }

}
