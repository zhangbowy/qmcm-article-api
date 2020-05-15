import { think } from 'thinkjs';

export default class extends think.Model {
    get pk() {
        return 'auth_give_id';
    }
    // get relation() {
    //     return {
    //         authority: {
    //             type: think.Model.HAS_MANY,
    //             fKey: 'cate_id',
    //             key: 'cate_id',//当前表
    //
    //         }
    //     }
    // }
    // get relation() {
    //     return {
    //         machine: {
    //             type: think.Model.HAS_MANY,
    //             Model: 'machine',
    //             fKey: 'custom_category_id',//machine表
    //             key: 'custom_category_id',//当前表
    //             field: 'custom_category_id,desc,machine_name,machine_code',
    //             where: { del: 0},
    //         },
    //     };
    // }
    async checkAuth(role_id: any,auth_api: any){
        // let sql = 'select * from auth_give ag,authority au where ag.role_id='+role_id+' and ag.auth_id=au.id and au.auth_url="'+auth_api+'" and au.auth_type='+type;
        let sql = 'select * from auth_give ag,authority au where ag.admin_role_id='+role_id+' and ag.auth_id=au.auth_id and au.auth_api_url="'+auth_api+'"';
        let res = await this.query(sql);
        if(res.length == 0){
            return false
        }else{
            return true
        }
    }
}
