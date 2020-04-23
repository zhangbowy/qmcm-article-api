import { think } from 'thinkjs';
import base from './base'
export default class extends base {
  getListAction() {

  }
  addSliderAction() {
    const rules = {
      image_path: {
        required: true,
        trim: true,
        method: 'post'
      },
      link: {
        required: true,
        trim: true,
        method: 'post'
      },
    };
    const msgs: object = {
      required: '{name}不能为空'
    };
    if (!this.validate(rules, msgs)) { // 校验不通过
      const keys: string[] = Object.keys(this.validateErrors);
      const msg: string = this.validateErrors[keys[0]];
      return this.fail(-1, msg);
    }
  }
}
