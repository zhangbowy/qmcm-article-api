import {think} from "thinkjs";
import Base from './base.js';
import ItemModel from "../model/item";
module.exports = class extends Base {
    /**
     * 权限列表
     */
    async authorityListAction(): Promise<void> {
        try {
            const res = await this.model('authority').where({is_show: 1,only_role_type:3}).fieldReverse('del').select();
            const data = this.getTree(res,0);
            return this.success(data)
        }catch (e) {

        }
    }

    /**
     * 角色列表
     */
    async roleListAction(): Promise<void> {
        const shop_id = this.ctx.state.admin_info.shop_id;
        const res = await this.model('admin_role').where({shop_id, del:0, role_type:['NOTIN', [1, 2]]}).countSelect();
        return this.success(res)
    }

    /**
     * 角色详情
     */
    async roleDetailAction(): Promise<void> {
        const admin_role_id = this.get('admin_role_id');
        const shop_id = this.ctx.state.admin_info.shop_id;
        const admin_role = await this.model('admin_role').where({shop_id,admin_role_id: admin_role_id,role_type:['NOTIN', [1, 2]]}).find();
        if (think.isEmpty(admin_role)) {
            return this.fail(-1, '该角色不存在!')
        }
        const auth_list = await this.model('auth_give').where({shop_id, admin_role_id: admin_role_id,del: 0}).getField('auth_id');
        // const res = await this.model('authority').where({is_page: 1, auth_id:['in',auth_list]}).getField('id');
        // const res = await this.model('authority').where({auth_id:['in',auth_list]}).getField('id');
        admin_role.authority_list = auth_list;
        return this.success(admin_role);
    }

    /**
     * 添加角色
     */
    async addRoleAction(): Promise<void> {
        try {
            const admin_role_name = this.post('admin_role_name');
            const shop_id = this.ctx.state.admin_info.shop_id;
            const admin_role_id = await this.model('admin_role').add({admin_role_name, shop_id});
            const authority_list  = this.post('authority_list') || [1,2];
            const get_auth_list = [];
            for (let auth_v of authority_list) {
                let obj = {
                    admin_role_id:admin_role_id,
                    auth_id:auth_v,
                    shop_id
                };
                get_auth_list.push(obj)
            }
            await this.model('auth_give').addMany(get_auth_list);
            await this.saveSystemLog('添加权限角色',{'角色名称':admin_role_name,'赋予的权限':authority_list});
            return this.success([], '添加成功!');
        }catch (e) {

        }
    }
    /*
     * 编辑角色
     */
    async editRoleAction(): Promise<void> {
        const admin_role_id = this.post('admin_role_id');
        const admin_role_name = this.post('admin_role_name');
        const shop_id = this.ctx.state.admin_info.shop_id;
        await this.model('admin_role').where({admin_role_id,shop_id}).update({admin_role_name});
        const authority_list  = typeof this.post('authority_list') == 'string'?this.post('authority_list').split(','):this.post('authority_list');
        if (authority_list.length == 0) {
            return this.fail(-1, '给予的权限列表不能为空!')
        }
        const get_auth_list = [];
        for (let auth_v of authority_list) {
            let obj = {
                admin_role_id:admin_role_id,
                auth_id:auth_v,
                shop_id
            };
            get_auth_list.push(obj)
        }
        await this.model('auth_give').where({admin_role_id,shop_id}).update({del:1});
        await this.model('auth_give').addMany(get_auth_list);
        return this.success([], '编辑成功!');
    }
    /**
     * 删除角色
     */
    async delRoleAction(): Promise<void> {
        try {
            const admin_role_id = this.post('admin_role_id');
            const shop_id = this.ctx.state.admin_info.shop_id;
            const admin_role = await this.model('admin_role').where({shop_id, admin_role_id}).update({del: 1});
            if (!admin_role) {
                return this.fail(-1, '该角色不存在!')
            }
            const res = await this.model('admin').where({shop_id,role_id:admin_role_id}).update({del: 1});
            return this.success([], '删除成功!')
        }catch (e) {

        }
    }
    /**
     * 管理员列表
     */
    async adminListAction(): Promise<void> {
        try {
            const page: number = this.post('currentPage') || 1;
            const limit: number = this.post('pageSize') || 10;
            const shop_id = this.ctx.state.admin_info.shop_id;
            const name: string = this.post('name') || "";
            const res = await this.model('admin')
                .where({'admin.shop_id': shop_id,'admin.role_type':3, 'admin.del':0})
                .join({
                table: 'admin_role',
                join: 'left', //join 方式，有 left, right, inner 3 种方式
                as: 'c', // 表别名
                on: ['role_id', 'admin_role_id']}) //ON 条件
                .field('admin.id,admin.role_id,admin.name,admin.phone,admin.created_at,admin.updated_at,admin_role_name as role_name').page(page, limit).countSelect();
            return this.success(res, '请求成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }
    /**
     * 添加管理员
     */
    async addAdminAction(): Promise<void> {
        try {
            const name = this.post('name');
            const phone = this.post('phone');
            const password = this.post('password');
            const pwd = new Buffer(password, 'utf-8' );
            const role_id = this.post('role_id');
            const shop_id = this.ctx.state.admin_info.shop_id;
            const is_use_phone = await this.model('admin').where({phone,  del: 0}).find();
            if (!think.isEmpty(is_use_phone)) {
                return this.fail(-1, '该手机号已被使用!');
            }
            const role_info = await this.model('admin_role').where({shop_id, admin_role_id:role_id,  del: 0}).find();
            if (think.isEmpty(role_info)) {
                return this.fail(-1, '该角色不存在!');
            }
            const admin = await this.model('admin').add({
                shop_id,
                role_id,
                name,
                phone,
                pwd
            });
            if (admin) {
                return this.success([], '创建成功!');
            }
            return this.fail(-1, '创建失败!');
        }catch (e) {

        }
    }
    /**
     * 编辑管理员
     */
    async editAdminAction(): Promise<void> {
        try {
            const id = this.post('id');
            const name = this.post('name');
            const phone = this.post('phone');
            const password = this.post('password');
            const role_id = this.post('role_id');
            const shop_id = this.ctx.state.admin_info.shop_id;
            const is_admin = await this.model('admin').where({shop_id, id ,del: 0}).find();
            if (think.isEmpty(is_admin)) {
                return this.fail(-1, '该管理员不存在!');
            }
            const is_use_phone = await this.model('admin').where({phone, del: 0,id:['NOTIN',[id]]}).find();
            if (!think.isEmpty(is_use_phone)) {
                return this.fail(-1, '该手机号已被使用!');
            }
            const role_info = await this.model('admin_role').where({shop_id, admin_role_id:role_id, del: 0}).find();
            if (think.isEmpty(role_info)) {
                return this.fail(-1, '该角色不存在!');
            }
            let udpOption: any = {
                name,
                phone,
                role_id
            }
            if (password) {
                const pwd = new Buffer(password, 'utf-8' );
                udpOption.pwd = pwd
            }
            const admin = await this.model('admin').where({id, shop_id,del: 0}).update(udpOption);
            if (admin) {
                return this.success([], '修改成功!');
            }
            return this.fail(-1, '修改失败!');
        }catch (e) {

        }

    }
    /**
     * 删除管理员
     */
    async delAdminAction(): Promise<void> {
        const id = this.post('id');
        const shop_id = this.ctx.state.admin_info.shop_id;
        const res = await this.model('admin').where({id,shop_id}).update({del: 1});
        if (!res) {
            return this.fail(-1, '管理员不存在!')
        }
        return this.success([], '删除成功!')
    }
}