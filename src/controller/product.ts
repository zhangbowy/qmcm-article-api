import Base from './base.js';
export default class extends think.Controller {
    /**
     * 用户列表
     */
    async indexAction(): Promise<void> {
        return this.display()
    }
}
