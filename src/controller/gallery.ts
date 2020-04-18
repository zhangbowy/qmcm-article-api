import Base from './base.js';
const path = require('path');
import GroupModel from './../model/gallery_group';
import GalleryModel from "../model/gallery";
import {think} from "thinkjs";
const fs = require('fs');
interface AddParams {
    group_name: string;
    parent_id: number;
    level: number;
    shop_id?: number
}
export default class extends Base {
    /**
     * 图库列表
     */
    async indexAction(): Promise<Object>  {
        const page: number = this.post('currentPage') || 1;
        const limit: number = this.post('pageSize') || 10;
        const gallery_group_id: number = Number(this.post('gallery_group_id'));
        const img_name: number =this.post('img_name') || "";
        const model = this.model('gallery') as GalleryModel;
        const groupModel = this.model('gallery_group') as GroupModel;
        const group_list: any  = await groupModel.getNeedsTree(gallery_group_id);
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const data = await model.list({page, limit, shop_id,gallery_group_id:group_list,img_name});
        return this.success(data, '请求成功!');
    }
    /**
     * test
     */
    async getNeedsTreeAction()
    {
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        // const data = await model.list({page, limit, shop_id,gallery_group_id});
        // return this.success(data, '请求成功!');
    }
    /**
     * 上传图片 ----> OSS
     */
    async uploadImgAction(): Promise<Object>  {
        const file = this.file('image');
        if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            const fileName = think.uuid('v4');
            const gs = file.type.substring(6, file.type.length);
            // const filepath = path.join(think.ROOT_PATH, 'www/static/card/' + );
            // await think.mkdir(path.dirname(filepath));
            const readStream = fs.createReadStream(file.path);
            // @ts-ignore
            const shop_id = (await this.session('token')).shop_id;
            let day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
            let filePath =`/gallary/${shop_id}/${day}/${fileName}.${gs}`;
            const oss = await think.service('oss');
            /**
             * 上传到腾讯OSS
             */
            let res: any = await oss.upload(file.path,filePath);
            const model = this.model('gallery') as GalleryModel;
            const gallery_group_id: number = this.post('gallery_group_id') || 0;
            let imageParams: any ={
                oss_path : res.Location,
                region: 'ap-guangzhou',
                img_name:`${fileName}.${gs}`,
                img_init_name:file.name,
                path:filePath,
                fullPath:"",
                shop_id,
                gallery_group_id
            };
            /**
             * 存库
             */
            const data  = await model.addImage(imageParams);
            if (data) {
                return this.success({url: 'gallary/' + fileName + '.' + gs,res});
            }
            // fs.unlinkSync((this.files as any).upload.path);
            return this.fail(-1,'上传失败,请稍后再试!',[]);
        } else {
            this.fail(-1, '请上传png或jpg格式的图片', []);
        }
    }
    /**
     * 删除图片
     * @params id 图片ID 多个,隔开
     */
    async deleteAction(): Promise<Object> {
        const id: string = (this.post('id')).toString();
        const model = this.model('gallery') as GalleryModel;
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        let res =await model.findImageById(id);
        if (res.length == 0) {
           return   this.fail(-1, '图片不存在!',[]);
        }
        let arr: any = [];
        for (let item of res) {
            let obj = {
                Key:item.path
            };
            arr.push(obj)
        }
        let data =  await model.deleteImg(id);
         // @ts-ignore
        if(data) {
            const  oss  = think.service('oss');
            let del = await oss.deleteFile(arr);
            if(del.statusCode && del.statusCode == 200)
            {
                return this.success({del,data}, '删除成功!');
            }
            return   this.fail(-1, '删除失败!',del);
        }
    }
    /**
     * 编辑图片
     * @params id
     * @params gallery_group_id 分组Id
     * @params img_name 图片名称
     */
    async editAction(): Promise<Object> {
        const id: number = this.post('id');
        const gallery_group_id: number = this.post('gallery_group_id');
        const img_name: string = this.post('img_name');
        const model = this.model('gallery') as GalleryModel;
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        let params: any = {
            gallery_group_id,
            img_name
        };
        const data: any = await model.editImg(id,params);
        if (data) {
            return this.success(data, '修改成功!');
        }
        return this.fail(-1, '图片不存在!',data);

    }
    /**
     * 给图片设置分组
     * @params id 图片ID 多个,隔开
     * @params gallery_group_id 分组Id
     */
    async setGroupAction(): Promise<Object> {
        const id: number = this.post('id');
        const gallery_group_id: number = this.post('gallery_group_id');
        const model = this.model('gallery') as GalleryModel;
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const data: any = await model.setGroup(id,gallery_group_id);
        return this.success(data, '请求成功!');
    }
    /**
     * 图库分类列表
     */
    async groupListAction(): Promise<Object> {
        const model = this.model('gallery_group') as GroupModel;
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const data = await model.list({shop_id});
        let res = updateGroup(data,0);
        return this.success(res, '请求成功!');
    }
    /**
     * 添加图库分组
     * @params group_name 分组名称
     * @params parent_id 上级ID
     * @params level 当前层级
     */
    async addGroupAction(): Promise<Object> {
        const group_name: string = this.post('group_name');
        const parent_id: number = this.post('parent_id');
        const level: number = this.post('level');
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        let params: AddParams = {
            group_name,
            parent_id,
            level,
            shop_id
        };
        const model = this.model('gallery_group') as GroupModel;
        const data = await model.addGruop(params);
        if (data) {
            return this.success(data, '添加成功!');
        }
        return this.fail(-1, '添加失败!', []);

    }
    /**
     * 编辑图库分组
     * @params id 分组ID
     * @params parent_id 上级ID
     * @params level 当前层级
     */
    async editGroupAction(): Promise<Object> {
        const id: number = this.post('group_id');
        const group_name: string = this.post('group_name');
        const parent_id: number = this.post('parent_id');
        const level: number = this.post('level');
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        let params: AddParams = {
            group_name,
            parent_id,
            level,
        };
        const model = this.model('gallery_group') as GroupModel;
        const data:any = await model.editGroup(id,params);
        if (data) {
            return this.success(data, '编辑成功!');
        }
        return this.fail(-1, '编辑失败!', data);
    }
    /**
     * 删除图库分组
     * @params id 分组ID
     */
    async deleteGroupAction($id: number): Promise<Object> {
        const gallery_group_id: number = this.post('gallery_group_id');
        // @ts-ignore
        const shop_id: number = (await this.session('token')).shop_id;
        const model = this.model('gallery_group') as GroupModel;
        const galleryModel = this.model('gallery') as GalleryModel;
        /**
         * 删除分组
         */
        const data:any = await model.deleteGroup(gallery_group_id);
        if (data) {
            /**
             * 清除分组Id
             */
            const groupModel = this.model('gallery_group') as GroupModel;
            const group_list: any  = await groupModel.getNeedsTree(gallery_group_id);
            const res = await galleryModel.deletePid(group_list);
            return this.success([], '删除成功!');
        }
        return this.fail(-1, '分组不存在!', []);
    }
}
/**
 * 递归分类
 */
function updateGroup(data:any, root:any) {
        var idTxt:any = idTxt || 'group_id';
        var pidTxt:any = pidTxt || 'parent_id';
        var pushTxt:any = pushTxt || 'children';
        // 递归方法
        function getNode(id:any) {
            var node = [];
            var ids = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i][pidTxt] == id) {
                    data[i][pushTxt] = getNode(data[i][idTxt]);
                    node.push(data[i])
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
