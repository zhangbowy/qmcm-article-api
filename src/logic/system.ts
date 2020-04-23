import { think } from 'thinkjs';
import base from './base'
export default class extends base {
  embTemplateAction() {
    const rules = {
      template_type: {
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
  editEmbTemplateAction() {
    const rules = {
      id: {
        required: true,
        trim: true,
        method: 'post'
      },
      template_type: {
        required: true,
        trim: true,
        method: 'post'
      },
      cover_image: {
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


  addEmbPriceAction() {
    const rules = {
      id: {
        required: true,
        trim: true,
        method: 'post'
      },
      // template_type: {
      //   required: true,
      //   trim: true,
      //   method: 'post'
      // },
      name: {
        required: true,
        trim: true,
        method: 'post'
      },
      price: {
        required: true,
        trim: true,
        method: 'post'
      },
      width: {
        required: true,
        trim: true,
        method: 'post'
      },
      height: {
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

  delEmbPriceAction() {
    const rules = {
      id: {
        required: true,
        trim: true,
        method: 'post'
      },
      template_id: {
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

  delSliderAction() {
    const rules = {
      id: {
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
  editSliderAction() {
    const rules = {
      id: {
        required: true,
        trim: true,
        method: 'post'
      },
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
