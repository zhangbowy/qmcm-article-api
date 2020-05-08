import Base from './base.js';
// tslint:disable-next-line:import-spacing
import UserModel from  './../model/user';
// @ts-ignore
import ThinkSvgCaptcha from 'think-svg-captcha';

export default class extends Base {
    /**
     * 设计师列表
     */
    async designerListAction(): Promise<any> {
        // @ts-ignore
        const shop_id: number = (await this.session('token')).shop_id;
        const res = await this.model('designer').where({shop_id}).countSelect();
        this.success(res, '请求成功!');
    }

    /**
     * 添加设计师
     */
    async addDesignerAction(): Promise<any> {
        const designer_name = this.post('designer_name');
        const designer_phone = this.post('designer_phone');
        const design_password = this.post('design_password');
        const is_leader = this.post('is_leader');
        const designer_team_id = this.post('designer_team_id');

        const params = {
            designer_name,
            designer_phone,
            design_password,
            is_leader,
            designer_team_id
        }
    }

    /**
     * 编辑设计师
     */
    async editDesignerAction(): Promise<any> {

    }

    /**
     * 删除设计师
     */
    async delDesignerAction(): Promise<any>  {

    }
}
