import Base from './base.js';
const path = require('path');
export default class extends Base {
  async getListAction() {
    const res = await this.model('order').select()
    return  this.success(res, '请求成功');
  }
}
