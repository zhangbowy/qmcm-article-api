import { think } from 'thinkjs';

export default class extends think.Model {
    get pk() {
        return 'article_id';
    }

    async checkAuth(role_id: any, auth_api: any) {
        /**
         * 白名单
         */
        const whiteList = ['/system/getCity', '/order/expressList', '/admin/info', '/authority/authorityList'];
        // let sql = 'select * from auth_give ag,authority au where ag.role_id='+role_id+' and ag.auth_id=au.id and au.auth_url="'+auth_api+'" and au.auth_type='+type;
        const sql = 'select * from auth_give ag,authority au where ag.admin_role_id=' + role_id + ' and ag.auth_id=au.id and ag.del=0 and au.auth_api_url="' + auth_api + '"';
        const res = await this.query(sql);
        if (res.length == 0) {
            if (whiteList.indexOf(auth_api) > -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }
}
