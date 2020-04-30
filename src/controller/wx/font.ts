import Base from './base.js';
const path = require('path');
export default class extends Base {
    fontListAction(): any {
        throw new Error("Method not implemented.");
    }
    /**
     * 首页接口
     */
    async getFontAction(): Promise<void> {
        /**
         * 调用pc端fontList
         */
        const fontController = this.controller('font');
        await fontController.fontListAction();
    }
}
