import Base from './base.js';
// tslint:disable-next-line:import-spacing
import UserModel from  './../model/user';
export default class extends Base {

    /**
     * 刺绣模板列表
     */
    async embTemplateAction(): Promise<void> {
        let template_type = this.post('template_type');
        let res = await this.model('emb_template').where({template_type:template_type}).select();
        return this.success(res, '请求成功!');
    }

    /**
     * 編輯刺綉模板
     */
    async editEmbTemplateAction(): Promise<void> {
        let id = this.post('id');
        let template_type = this.post('template_type');
        let cover_image = this.post('cover_image');
        let res = await this.model('emb_template').where({template_type,id}).update({cover_image});
        if (res) {
            return this.success([], '修改成功!')
        }
        return this.fail(-1, '模板不存在')
    }


    /**
     * 添加刺绣模板价格
     * @params {name} 价格名称
     * @params {price} 价格
     * @params {width} 宽度mm
     * @params {height} 高度mm
     */
    async addEmbPriceAction(): Promise<void> {
        let template_id = this.post('id');
        /**
         * type 1 有價格 2 沒有 只有基础价
         */
        let template_type = 1;
        // let template_type = this.post('template_type');
        let name = this.post('name');
        let price = this.post('price');
        let width = this.post('width');
        let height = this.post('height');
        let params = {
            template_id,
            template_type,
            name,
            price,
            width,
            height
        };
        let res = await this.model('emb_template_price').add(params);
        return this.success(res,'请求成功!');
    }

    /**
     * 编辑刺绣模板价格
     * @params {id} 价格id
     * @params {template_id} 模板id
     * @params {name} 价格名称
     * @params {price} 价格
     * @params {width} 宽度mm
     * @params {height} 高度mm
     */
    async editEmbPriceAction(): Promise<void> {
        let id = this.post('id');
        let template_id = this.post('template_id');
        // let template_type = this.post('template_type');
        let name = this.post('name');
        let price = this.post('price');
        let width = this.post('width');
        let height = this.post('height');
        let params = {
            id,
            name,
            price,
            width,
            height
        };
        let res: any = await this.model('emb_template_price').where({template_id,id}).update(params);
        if (res) {
            return this.success(res, '编辑成功!');

        }
        return this.fail(-1, '该模板价格不存在!');
    }

    /**
     * 删除刺绣模板价格
     * @params {id} 价格id
     * @params {template_id} 模板id
     */
    async delEmbPriceAction(): Promise<void> {
        let id = this.post('id');
        let template_id = this.post('template_id');
        // @ts-ignore
        let res:object = await this.model('emb_template_price').where({id,template_id}).delete();
        if (res) {
            return this.success(res, '删除成功!');
        }
        return this.fail(-1, '删除失败!');
    }

    /**
     * 角色列表
     */
    async roleListAction(): Promise<void> {

    }
    /**
     * 角色详情
     */
    async getRoleInfo(): Promise<void> {

    }
    /**
     * 添加角色
     */
    async addRoleAction(): Promise<void> {
    }
    /**
     * 编辑角色
     */
    async editRoleAction(): Promise<void> {
    }
    /**
     * 删除角色
     */
    async delRoleAction(): Promise<void> {
    }
    /**
     * 管理员列表
     */
    async adminListAction(): Promise<void> {
    }
    /**
     * 添加管理员
     */
    async addAdminAction(): Promise<void> {
    }
    /**
     * 编辑管理员
     */
    async editAdminAction(): Promise<void> {
    }
    /**
     * 删除管理员
     */
    async delAdminAction(): Promise<void> {
    }
}
