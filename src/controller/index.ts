import Base from './rest';
import {ancestorWhere} from "tslint";
const path = require('path');
const fs = require('fs');
export default class extends Base {
  indexAction() {
    // return this.display();
    return this.redirect('http://www.wkdao.com', '走错路发现世界,走对路发现自己');
    const filepath = path.join(think.ROOT_PATH, 'view/index_index.html');
    return this.success([], "请求成功!");
    return  this.download(filepath);
  }
  /**
   *  下载资源接口
   *  @param {url} 资源链接
   *  @param {fileName} 文件名
   */
  async downLoadAction() {
    const file = this.get('url');
    const fileName = this.get('fileName');
    const fileBuffer = await this.getBuffer(this, file,true);
    await fs.writeFileSync('1.PNG',fileBuffer);
    this.download('1.PNG', fileName+'.png');
  }
  async getDataAction() {
    const res: any = await this.model('order').where({status:['NOTIN',[1,-2,5,6]]}).sum('pay_amount');
    // SELECT SUM(score) AS think_sum FROM `test_d` LIMIT 1
    return this.success(res)
  }
}
