import Base from './base.js';
const path = require('path');
export default class extends Base {
  indexAction() {
    // return this.display();
    // return this.redirect('http://www.wkdao.com', '走错路发现世界,走对路发现自己');
    const filepath = path.join(think.ROOT_PATH, 'view/index_index.html');
    // return this.success([], '走错路发现世界,走对路发现自己');
    return  this.download(filepath);
  }
}
