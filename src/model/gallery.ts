import { think } from 'thinkjs';
interface GetUserParams {
    id: number;
}
interface GoodsListParams {
    page?: number;
    limit?: number;
    shop_id: number;
    gallery_group_id?: any;
    img_name?: string | number
}
export default class extends think.Model {
    async list($data: GoodsListParams) {
        const page = $data.page || 1;
        const limit: number = $data.limit || 10;
        const offset: number = (page - 1) * limit;
        // @ts-ignore
        if($data.gallery_group_id == -1)
        {
            // @ts-ignore
            return this.order({created_at: 'DESC'}).where({del: 0, shop_id: $data.shop_id,img_name:['like',`%${$data.img_name}%`]}).page(page, limit).cache(0).countSelect({cache: false});
        }
        else
        {
            // @ts-ignore
            return this.order({created_at: 'DESC'}).where({del: 0, shop_id: $data.shop_id,gallery_group_id: ['in', $data.gallery_group_id],img_name:['like',`%${$data.img_name}%`]}).page(page, limit).countSelect({cache: false});
        }
    }
    async addImage($data: any) {
        return await this.add($data);
    }
    /**
     * 清除分组Id
     */
    async deletePid($ids: any) {
        return this.where({gallery_group_id: ['IN', $ids]}).update({gallery_group_id: 0});
    }
    /**
     * 图片设置分组
     */
    async setGroup($ids: number,$group_id: number) {
        return this.where({id: ['IN', $ids]}).update({gallery_group_id:$group_id});
    }
    /**
     * 编辑图片
     */
    async editImg($id: number,$data: any) {
        return this.where({id: $id}).update($data);
    }
    // /**
    //  * id
    //  */
    async findImageById($ids: any) {
        return this.where({id: ['IN', $ids]}).select();
    }
    async deleteImg($ids: string) {
        return await this.where({id: ['IN', $ids]}).delete();
    }
}
