import { think } from 'thinkjs';
interface GetUserParams {
    id: number;
}
interface AddGruopParams {
    group_name: string;
    parent_id: number;
    level: number;
    shop_id?: number
}
interface GoodsListParams {
    // page?: number;
    // limit?: number;
    shop_id: number;
}
export default class extends think.Model {
    async list($data: GoodsListParams) {
        // @ts-ignore
        return this.field('id as group_id,group_name as group_name,shop_id as shop_id,level as level,created_at as created_at,updated_at as updated_at,parent_id as parent_id').order({created_at: 'DESC'}).where({del: 0, shop_id: $data.shop_id}).select();
    }
    async addGruop($data: AddGruopParams) {
        return await this.add($data);
    }
    async deleteGroup($id: number) {
        return this.where({id: $id}).delete();
    }
    async editGroup($id: number,$data: any) {
        return this.where({id: $id}).update($data);
    }
    async getNeedsTree($group_id: number){
        if($group_id == 0)
        {
            return  [0]
        }
        let res = await this.select();
        let hash = {};
        for(let item of res)
        {
            hash[item.id] = item.parent_id
        }
        var bmid = $group_id;
        // console.log(hash,'hash');
        var pids = new Set([bmid]);
        do {
            var len = pids.size;

            for(var id in hash) {
                if (pids.has(hash[id])) {
                    pids.add(Number(id));
                    delete hash[id];
                }
            }
        } while (pids.size>len);
        return Array.from(pids);

        let rootNeeds = await this.where({id:$group_id}).select();
        rootNeeds = await this.getChildNeeds(rootNeeds);
        return rootNeeds;
    }
    async getChildNeeds(rootNeeds:any){
        let expendPromise:any = [];
        // @ts-ignore
        rootNeeds.forEach(item => {
            expendPromise.push(this.where({parent_id:item.id}).select());
        })
        let child = await Promise.all(expendPromise);
        console.log(child);
        for(let [idx , item] of child.entries()){
            // @ts-ignore
            // @ts-ignore
            if(item.length > 0){
                item = await this.getChildNeeds(item);
            }
            rootNeeds[idx].child = item;
        }
        return rootNeeds;
    }
}
