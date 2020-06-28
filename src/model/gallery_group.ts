import { think } from 'thinkjs';
interface GetUserParams {
    id: number;
}
interface AddGruopParams {
    group_name: string;
    parent_id: number;
    level: number;
    shop_id?: number;
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
        return this.where(`FIND_IN_SET(id,getGalelryGroupId(${$id}))`).delete();
    }
    async editGroup($id: number, $data: any) {
        return this.where({id: $id}).update($data);
    }
    async getLevel($id: number) {
        const sql = `select getGalleryGroupLevel(${$id})`;
        const res =  await this.query(sql);
        const txt = `getGalleryGroupLevel(${$id})`;
        const result =  res[0][txt];
        return result;

    }
    // async getNeedsTree($group_id: number) {
    //     if ($group_id == 0) {
    //         return  [0];
    //     }
    //     const res = await this.select();
    //     const hash = {};
    //     for (const item of res) {
    //         hash[item.id] = item.parent_id;
    //     }
    //     const bmid = $group_id;
    //     // console.log(hash,'hash');
    //     const pids = new Set([bmid]);
    //     do {
    //         const len = pids.size;
    //
    //         for (const id in hash) {
    //             if (pids.has(hash[id])) {
    //                 pids.add(Number(id));
    //                 delete hash[id];
    //             }
    //         }
    //     } while (pids.size > len);
    //     return Array.from(pids);
    //
    //     let rootNeeds = await this.where({id: $group_id}).select();
    //     rootNeeds = await this.getChildNeeds(rootNeeds);
    //     return rootNeeds;
    // }
    // async getChildNeeds(rootNeeds: any) {
    //     const expendPromise: any = [];
    //     // @ts-ignore
    //     rootNeeds.forEach((item) => {
    //         expendPromise.push(this.where({parent_id: item.id}).select());
    //     });
    //     const child = await Promise.all(expendPromise);
    //     console.log(child);
    //     for (let [idx , item] of child.entries()) {
    //         // @ts-ignore
    //         // @ts-ignore
    //         if (item.length > 0) {
    //             item = await this.getChildNeeds(item);
    //         }
    //         rootNeeds[idx].child = item;
    //     }
    //     return rootNeeds;
    // }

    async getData() {
    //     // tslint:disable-next-line:no-unused-expression
    //     'SELECT ' +
    //         't.ITEM_NAME,' +
    //         't.ITEM_CID,' +
    //         't.ITEM_PID ' +
    //     'FROM ' +
    //         `gallery_group ` + 't '
    //     'WHERE NOT EXISTS(' +
    //         'select * from `gallery_group` t1,`gallery_group` t2  where' +
    //     `t1.id=t2.parent_id AND t.id=t1.id` +
    // ')';
    }

    async getChild() {
        // DROP FUNCTION IF EXISTS queryChildrenAreaInfo;
        // CREATE FUNCTION queryChildrenAreaInfo(areaId INT)
        // RETURNS VARCHAR(4000)
        // BEGIN
        // DECLARE sTemp VARCHAR(4000);
        // DECLARE sTempChd VARCHAR(4000);
        //
        // SET sTemp='$';
        // SET sTempChd = CAST(areaId AS CHAR);
        //
        // WHILE sTempChd IS NOT NULL DO
        // SET sTemp= CONCAT(sTemp,',',sTempChd);
        // SELECT GROUP_CONCAT(id) INTO sTempChd FROM t_areainfo WHERE FIND_IN_SET(parentId,sTempChd)>0;
        // END WHILE;
        // RETURN sTemp;
        // END;
    }
   async getPicByGroupId() {
   //     WITH _children AS
   //     (
   //         SELECT fun.* FROM `function` fun WHERE fun.ParentId='0' AND Classify = 0
   //     UNION ALL
   //     SELECT fun.* FROM _children,`function` fun WHERE fun.ParentId=_children.Id
   // )
   //     SELECT * FROM _children;
   //
   //     WITH _parent AS
   //     (
   //         SELECT fun.* FROM `function` fun WHERE fun.Id='9'
   //     UNION ALL
   //     SELECT fun.* FROM _parent,`function` fun WHERE fun.Id=_parent.ParentId
   // )
   //     SELECT * FROM _parent;
    }
}
