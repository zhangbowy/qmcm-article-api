import {think} from "thinkjs";
import Base from './base.js';
module.exports = class extends Base {
    /**
     * 权限列表
     */
    async authorityListAction(): Promise<void> {
        try {
            const res = await this.model('authority_category').select();
            return this.success(res)
        }catch (e) {

        }
    }

    /**
     * 角色列表
     */
    async roleListAction(): Promise<void> {
        const shop_id = this.ctx.state.admin_info.shop_id;
        const res = await this.model('admin_role').where({shop_id,role_type:['NOTIN', [1, 2]]}).countSelect();
        return this.success(res)
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
        const admin_role_name = this.post('admin_role_name');
        const shop_id = this.ctx.state.admin_info.shop_id;
        const admin_role_id = await this.model('admin_role').add({admin_role_name, shop_id});
        const authority_list  = this.post('authority_list') || [1,2];
        const get_auth_list = [];
        for (let auth_v of authority_list) {
            let obj = {
                admin_role_id:admin_role_id,
                auth_id:auth_v
            };
            get_auth_list.push(obj)
        }
        await this.model('auth_give').addMany(get_auth_list);
        return this.success([],'添加成功!');
    }
    /*
    *
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
