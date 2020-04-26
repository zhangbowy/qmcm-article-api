import Base from './base.js';
const path = require('path');
export default class extends Base {
    /**
     * 首页接口
     */
    async indexAction(): Promise<void> {
        let slider: any[] = await this.model('slider').order('sort DESC').select();
        let category: any[] = await this.model('item_category').where({parent_id:0,del:0}).select();
        let region1: any[] = await this.model('region').select();
        let region = updateRegion(region1,0)
        let resObj:object = {
            slider,
            category,
            region
        };
        return this.success(resObj, '请求成功!');
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
