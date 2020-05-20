import Base from './base.js';
// tslint:disable-next-line:import-spacing
import UserModel from  './../model/user';
import ExpressTemp from './../model/express_template'
export default class extends Base {

    /**
     * 刺绣模板列表
     */
    async embTemplateAction(): Promise<void> {
        try {
            let template_type = this.post('template_type');
            let res = await this.model('emb_template').where({template_type:template_type}).select();
            return this.success(res, '请求成功!');
        }catch (e) {

        }

    }

    /**
     * 編輯刺綉模板
     */
    async editEmbTemplateAction(): Promise<void> {
        let emb_template_id = this.post('id');
        let template_type = this.post('template_type');
        let cover_image = this.post('cover_image');
        let res = await this.model('emb_template').where({template_type,emb_template_id}).update({cover_image});
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
        let emb_template_id = this.post('emb_template_id');
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
            emb_template_id,
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
        let emb_template_id = this.post('emb_template_id');
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
        let res: any = await this.model('emb_template_price').where({emb_template_id,id}).update(params);
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
        let emb_template_id = this.post('template_id');
        // @ts-ignore
        let res:object = await this.model('emb_template_price').where({id,emb_template_id}).delete();
        if (res) {
            return this.success(res, '删除成功!');
        }
        return this.fail(-1, '删除失败!');
    }

    /**
     * 首页轮播图
     */
    async getSliderAction(): Promise<void> {
        // @ts-ignore
        const shop_id: number = this.ctx.state.admin_info.shop_id;
        let res = await this.model('slider').order('sort DESC').where({shop_id: shop_id}).select();
        if (res) {
            return this.success(res, '请求成功!');
        }
    }

    /**
     * 添加首页轮播图
     * @params {image_path} 图片路径
     * @params {link} 链接
     * @params {sort}
     */
    async addSliderAction(): Promise<void>  {
        // @ts-ignore
        const shop_id: number = this.ctx.state.admin_info.shop_id;
        let image_path = this.post('image_path');
        let link = this.post('link');
        let slider_name = this.post('slider_name');
        let sort = this.post('sort') || 0;
        // @ts-ignore
        let params = {
            link,
            image_path,
            sort,
            slider_name,
            shop_id
        };
        // @ts-ignore
        let res:object = await this.model('slider').add(params);
        if (res) {
            return this.success(res, '添加成功!');
        }
        return this.fail(-1, '添加失败!');
    }

    /**
     * 编辑首页轮播图
     * @params {id} id
     * @params {image_path} 图片路径
     * @params {link} 链接
     * @params {sort}
     */
    async editSliderAction(): Promise<void> {
        // @ts-ignore
        const shop_id: number = this.ctx.state.admin_info.shop_id;
        let id = this.post('id');
        let image_path = this.post('image_path');
        let link = this.post('link');
        let sort = this.post('sort') || 0;
        let slider_name = this.post('slider_name');
        // @ts-ignore
        let params = {
            link,
            image_path,
            sort,
            slider_name
        };
        // @ts-ignore
        let res:object = await this.model('slider').where({id:id,shop_id}).update(params);
        if (res) {
            return this.success(res, '编辑成功!');
        }
        return this.fail(-1, '编辑失败!');
    }

    /**
     * 删除首页轮播图
     * @params {id} 轮播图id
     */
    async delSliderAction(): Promise<void> {
        let id = this.post('id');
        // @ts-ignore
        let res:object = await this.model('slider').where({id}).delete();
        if (res) {
            return this.success(res, '删除成功!');
        }
        return this.fail(-1, '删除失败!');
    }

    /**
     * 城市列表
     */
    async getCityAction() {
        try {
            let region1: any[] = await this.model('region').field('id,pid,name,level,citycode as city_code,yzcode as yz_code').select();
            let region = this.getTree(region1,100000);
            return this.success(region, '请求成功!');
        }catch (e) {
            return this.fail(-1, e)
        }
    }

    /**
     * 运费模板列表
     */
    async expTemplateAction(): Promise<void> {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            let page: number = this.get('currentPage');
            let limit: number = this.get('pageSize');
            let res = await (this.model('express_template') as ExpressTemp).getList({page, limit, shop_id});
            return this.success(res,'请求成功!')
        }catch (e) {
            return this.fail(-1, e)
        }
    }

    /**
     * 运费模板详情
     * @params {express_template_id} 模板id
     */
    async expTemplateDetailAction(): Promise<void> {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            let express_template_id: number = this.get('express_template_id');
            let res = await this.model('express_template').where({shop_id, express_template_id}).find();
            if (Object.keys(res).length > 0) {
                res.region_rules = JSON.parse(res.region_rules);
               return this.success(res,'请求成功!')
            }
            return  this.fail(-1,'该物流模板不存在!')
        }catch (e) {
            return this.fail(-1, e)
        }
    }

    /**
     * 添加运费模板
     * @params {express_template_type} 计费类型 1 重量 2 件数
     * @params {region_rules} 地区规则 {region，city_show,first_number,first_amount,continue_number,continue_amount}
     * @params {express_template_name} 物流模板名称
     * @params {first_number} 首重/多少件以内
     * @params {first_amount}  首重/多少件以内 价格
     * @params {continue_number} 续重
     * @params {continue_amount} 续重价格
     * @params {full_amount} 包邮金额
     * @params {is_full_amount} 是否满额包邮
     * @params {shop_id} 店铺id
     */
    async addExpTemplateAction(): Promise<void> {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const express_template_type: number = this.post('express_template_type');
            const express_template_name: number = this.post('express_template_name');
            let region_rules: any = this.post('region_rules') || [];
            const first_number: number = this.post('first_number');
            const first_amount: number = this.post('first_amount');
            const continue_amount: number = this.post('continue_amount');
            const continue_number: number = this.post('continue_number');
            const is_full_amount: number = this.post('is_full_amount');
            const full_amount: number = this.post('full_amount') || 0;
            if (region_rules.length > 0) {
                for (let rules_val of region_rules) {
                    if ((rules_val.region && rules_val.region.length == 0) || !rules_val.region) {
                        return this.fail(-1, '区域计费-地区不能为空')
                    }
                }
            }
            region_rules = JSON.stringify(region_rules);
            let params: object = {
                shop_id,
                express_template_type,
                express_template_name,
                first_number,
                first_amount,
                continue_number,
                continue_amount,
                is_full_amount,
                full_amount,
                region_rules
            };
            let res = await this.model('express_template').add(params);
            if (res) {
                return this.success(res, '添加成功!')
            }
            return this.fail(-1, '添加失败!')
        }catch (e) {
            return this.fail(-1, e)
        }
    }

    /**
     * 编辑运费模板
     * @params {express_template_id} 模板id
     * @params {express_template_type} 计费类型 1 重量 2 件数
     * @params {region_rules} 地区规则 {region，city_show,first_number,first_amount,continue_number,continue_amount}
     * @params {express_template_name} 物流模板名称
     * @params {first_number} 首重/多少件以内
     * @params {first_amount}  首重/多少件以内 价格
     * @params {continue_number} 续重
     * @params {continue_amount} 续重价格
     * @params {full_amount} 包邮金额
     * @params {is_full_amount} 是否满额包邮
     * @params {shop_id} 店铺id
     */
    async editExpTemplateAction(): Promise<void> {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const express_template_id: number = this.post('express_template_id');
            const express_template_type: number = this.post('express_template_type');
            const express_template_name: number = this.post('express_template_name');
            let region_rules: any = this.post('region_rules') || [];
            const first_number: number = this.post('first_number');
            const first_amount: number = this.post('first_amount');
            const continue_amount: number = this.post('continue_amount');
            const continue_number: number = this.post('continue_number');
            const is_full_amount: number = this.post('is_full_amount');
            const full_amount: number = this.post('full_amount') || 0;
            if (region_rules.length > 0) {
                for (let rules_val of region_rules) {
                    if ((rules_val.region && rules_val.region.length == 0) || !rules_val.region) {
                        return this.fail(-1, '区域计费-地区不能为空')
                    }
                }
            }
            region_rules = JSON.stringify(region_rules);
            let params: object = {
                express_template_type,
                express_template_name,
                first_number,
                first_amount,
                continue_number,
                continue_amount,
                is_full_amount,
                full_amount,
                region_rules
            };
            let res: any = await this.model('express_template').where({express_template_id,shop_id}).update(params);
            if (res) {
                return this.success(res, '编辑成功!')
            }
            return this.fail(-1, '编辑失败!')
        }catch (e) {
            return this.fail(-1, e)
        }
    }

    /**
     * 删除运费模板
     * @params {express_template_id} 模板id
     */
    async delExpTemplateAction(): Promise<void> {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const express_template_id: number = this.post('express_template_id');
            const goods = await this.model('item').where({express_template_id}).select();
            if (goods.length > 0) {
                return this.fail(-1, `该运费模板已被【${goods[0].name}】等${goods.length}件商品使用!`);
            }
            let res: any = await this.model('express_template').where({express_template_id,shop_id}).update({del:1});
            if (res) {
                return this.success(res, '删除成功!');
            }
            return this.fail(-1, '模板不存在!');
        }catch (e) {
            return this.fail(-1, e)
        }
    }

    /**
     * 定制分类列表
     */
    async customCategoryAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const res = await this.model('custom_category').order('created_at DESC').where({shop_id,del: 0}).select();
            return this.success(res, '请求成功!')
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 添加定制分类
     * @param {shop_id} 店铺id
     * @param {custom_category_name} 定制分类名称
     * @param {design_width} 设计区域宽度
     * @param {disign_height} 设计区域高度
     * @param {design_top} 设计区域据图片顶部距离
     * @param {design_left} 设计区域据图片左边距离
     * @param {design_bg} 背景
     * @param {design_bg_width} 背景宽
     * @param {design_bg_height} 背景高
     */
    async addCustomCateAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const custom_category_name = this.post('custom_category_name');
            const design_width = this.post('design_width');
            const design_height = this.post('design_height');
            const design_top = this.post('design_top');
            const design_left = this.post('design_left');
            const design_bg = this.post('design_bg');
            const design_bg_width = this.post('design_bg_width');
            const design_bg_height = this.post('design_bg_height');

            const params = {
                shop_id,
                custom_category_name,
                design_width,
                design_height,
                design_top,
                design_left,
                design_bg,
                design_bg_width,
                design_bg_height
            };
            const res = await this.model('custom_category').add(params);
            if (!res) {
                return this.fail(-1, '添加失败!');
            }
            return this.success(res, '添加成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 编辑定制分类
     * @param {shop_id} 店铺id
     * @param {custom_category_id} 定制分类id
     * @param {custom_category_name} 定制分类名称
     * @param {design_width} 设计区域宽度
     * @param {disign_height} 设计区域高度
     * @param {design_top} 设计区域据图片顶部距离
     * @param {design_left} 设计区域据图片左边距离
     * @param {design_bg} 背景
     * @param {scale} 比例
     */
    async editCustomCateAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const custom_category_id = this.post('custom_category_id');
            const custom_category_name = this.post('custom_category_name');
            const design_width = this.post('design_width');
            const design_height = this.post('design_height');
            const design_top = this.post('design_top');
            const design_left = this.post('design_left');
            const design_bg = this.post('design_bg');
            const design_bg_width = this.post('design_bg_width');
            const design_bg_height = this.post('design_bg_height');

            const params = {
                custom_category_name,
                design_width,
                design_height,
                design_top,
                design_left,
                design_bg,
                design_bg_width,
                design_bg_height
            };
            const res: any = await this.model('custom_category').where({shop_id, custom_category_id}).update(params);
            if (!res) {
                return this.fail(-1, '编辑失败!');
            }
            return this.success(res, '编辑成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 删除定制分类
     * @param {custom_category_id} 定制分类id
     */
    async delCustomCateAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const custom_category_id: number = this.post('custom_category_id');
            const machineList: any = await this.model('machine').where({shop_id, custom_category_id, del: 0}).select();
            if(machineList.length > 0) {
                let machine = '';
                for(let v of machineList) {
                    machine += v.name + ','
                }
                return this.fail(-1, `该定制分类已关联${machine}机器`)
            }
            const res: any = await this.model('custom_category').where({shop_id, custom_category_id}).update({del:1});
            if (!res) {
                return this.fail(-1, '该定制分类不存在!')
            }
            return this.success(res, '删除成功!')
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 关联机器
     * @param {custom_category_id} 定制分类id
     * @param {machine_id} 机器id
     */
    async relationMachineAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const custom_category_id: number = this.post('custom_category_id');
            const categoryRes: any = await this.model('custom_category').where({shop_id, custom_category_id}).find();
            if (think.isEmpty(categoryRes)) {
                return this.fail(-1, '定制分类不存在!');
            }
            const machine_id: number = this.post('machine_id');
            const res: any = await this.model('machine').where({shop_id, machine_id}).find();
            if (think.isEmpty(res)) {
                return this.fail(-1, '机器不存在!');
            }
            if (!think.isEmpty(res.custom_category_id)) {
                if (res.custom_category_id == custom_category_id) {
                    return this.fail(-1, '该机器已关联至当前可定制分类!');
                } else {
                    const res1: any = await this.model('custom_category').where({shop_id, custom_category_id:res.custom_category_id}).find();

                    return this.fail(-1, `该机器已关联至[${ res1.custom_category_name }]可定制分类!`);
                }
            } else {
                const res: any = await this.model('machine').where({shop_id, machine_id}).update({custom_category_id});
                if (!res) {
                    return this.fail(-1, '关联失败!');
                }
                return this.success(res, '关联成功!')
            }
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 解除关联机器
     * @param {custom_category_id} 定制分类id
     * @param {machine_id} 机器id
     */
    async unRelationMachineAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const custom_category_id: number = this.post('custom_category_id');
            const categoryRes: any = await this.model('custom_category').where({shop_id, custom_category_id}).find();
            if (think.isEmpty(categoryRes)) {
                return this.fail(-1, '定制分类不存在!');
            }
            const machine_id: number = this.post('machine_id');
            const res: any = await this.model('machine').where({shop_id, machine_id}).find();
            if (think.isEmpty(res)) {
                return this.fail(-1, '机器不存在!');
            }
            if (!think.isEmpty(res.custom_category_id)) {
                if (res.custom_category_id == custom_category_id) {
                    const res: any = await this.model('machine').where({shop_id, machine_id}).update({custom_category_id:''});
                    if (!res) {
                        return this.fail(-1, '解除关联失败');
                    }
                    return this.success(res, '解除关联成功!');
                } else {
                    return this.fail(-1, `该机器已关联至[${ categoryRes.custom_category_name }]可定制分类!`);
                }
            } else {
                return this.fail(-1, '该机器未关联可定制分类!');
            }
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 根据定制分类id获取机器列表
     * @param {custom_category_id} 定制分类id
     */
    async getMachineByIdAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const custom_category_id: number = this.get('custom_category_id');
            const res: any = await this.model('machine').where({shop_id,del: 0, custom_category_id}).select();
            return this.success(res, '请求成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 机器列表
     * @return machineList
     */
    async getMachineAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const page: number = this.get('currentPage') || 1;
            const limit: number = this.get('pageSize') || 10;
            const res: any = await this.model('machine').order('machine.created_at DESC').where({'machine.shop_id': shop_id, 'machine.del': 0}).page(page, limit).join({
                table: 'custom_category',
                join: 'left', //join 方式，有 left, right, inner 3 种方式
                // as: 'c', // 表别名
                on: ['custom_category_id', 'custom_category_id'] //ON 条件
            }).countSelect();
            return this.success(res, '请求成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 添加机器
     * @param {machine_code} 机器编号
     * @param {machine_name} 机器名称
     * @param {desc} 机器描述
     * @return boolean
     */
    async addMachineAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const machine_code: string = this.post('machine_code');
            const machine_name: string = this.post('machine_name');
            const desc: string = this.post('desc');
            const params = {
                shop_id,
                machine_code,
                machine_name,
                desc
            };
            const res = await this.model('machine').add(params);
            if (!res) {
                return this.fail(-1, '添加失败!');
            }
            return this.success(res, '添加成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 编辑机器
     * @param {machine_id} 机器id
     * @param {machine_code} 机器编号
     * @param {machine_name} 机器名称
     * @param {desc} 机器描述
     * @return boolean
     */
    async editMachineAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const machine_id: string = this.post('machine_id');
            const machine_code: string = this.post('machine_code');
            const machine_name: string = this.post('machine_name');
            const desc: string = this.post('desc');
            const params = {
                machine_code,
                machine_name,
                desc
            };
            const res: any = await this.model('machine').where({machine_id, shop_id}).update(params);
            if (!res) {
                return this.fail(-1, '编辑失败!');
            }
            return this.success(res, '修改成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 删除机器
     * @param {machine_id} 机器id
     * @return boolean
     */
    async delMachineAction() {
        try {
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const machine_id: number = this.post('machine_id');
            let res: any = await this.model('machine').where({machine_id,shop_id}).update({del:1});
            if (res) {
                return this.success(res, '删除成功!');
            }
            return this.fail(-1, '机器不存在!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }


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
