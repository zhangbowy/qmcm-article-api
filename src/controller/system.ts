import Base from './base.js';
// tslint:disable-next-line:import-spacing
import UserModel from  './../model/user';
import ExpressTemp from './../model/express_template'
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
     * 首页轮播图
     */
    async getSliderAction(): Promise<void> {
        // @ts-ignore
        const shop_id: number = (await this.session('token')).shop_id;
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
        const shop_id: number = (await this.session('token')).shop_id;
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
        const shop_id: number = (await this.session('token')).shop_id;
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
            let region = updateRegion(region1,100000);
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
            const shop_id: number = (await this.session('token')).shop_id;
            let page: number = this.get('currentPage');
            let limit: number = this.get('pageSize');
            let res = await (this.model('express_template') as ExpressTemp).getList({page, limit, shop_id});
            this.success(res,'请求成功!')
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
            const shop_id: number = (await this.session('token')).shop_id;
            let express_template_id: number = this.get('express_template_id');
            let res = await this.model('express_template').where({shop_id, express_template_id}).find();
            if (Object.keys(res).length > 0) {
                res.region_rules = JSON.parse(res.region_rules)
               return  this.success(res,'请求成功!')
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
            const shop_id: number = (await this.session('token')).shop_id;
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
            const shop_id: number = (await this.session('token')).shop_id;
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
            const shop_id: number = (await this.session('token')).shop_id;
            const express_template_id: number = this.post('express_template_id');
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
/**
 * 递归分类列表
 */
function updateRegion(data:any, root:any) {
    var idTxt:any = idTxt || 'id';
    var pidTxt:any = pidTxt || 'pid';
    var pushTxt:any = pushTxt || 'children';
    // 递归方法
    function getNode(id:any) {
        var node = [];
        var ids = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i][pidTxt] == id) {
                data[i][pushTxt] = getNode(data[i][idTxt]);
                if (data[i].level != 3 ) {
                    node.push(data[i])
                }
            }
        }
        if (node.length == 0) {
            return
        } else {
            return node
        }
    }
    return getNode(root)
}
