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

  getSliderAction() {
  }

  getCityAction() {
  }

  expTemplateAction() {
  }

  addExpTemplateAction() {
    const rules = {
      express_template_type: {
        required: true,
        trim: true,
        method: 'post'
      },
      express_template_name: {
        required: true,
        trim: true,
        method: 'post'
      },
      first_number: {
        required: true,
        trim: true,
        method: 'post'
      },
      first_amount: {
        required: true,
        trim: true,
        method: 'post'
      },
      continue_number: {
        required: true,
        trim: true,
        method: 'post'
      },
      continue_amount: {
        required: true,
        trim: true,
        method: 'post'
      },
      is_full_amount: {
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

  editExpTemplateAction() {
    const rules = {
      express_template_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      express_template_type: {
        required: true,
        trim: true,
        method: 'post'
      },
      express_template_name: {
        required: true,
        trim: true,
        method: 'post'
      },
      first_number: {
        required: true,
        trim: true,
        method: 'post'
      },
      first_amount: {
        required: true,
        trim: true,
        method: 'post'
      },
      continue_number: {
        required: true,
        trim: true,
        method: 'post'
      },
      continue_amount: {
        required: true,
        trim: true,
        method: 'post'
      },
      is_full_amount: {
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

  delExpTemplateAction() {
    const rules = {
      express_template_id: {
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

  expTemplateDetailAction() {
    const rules = {
      express_template_id: {
        required: true,
        trim: true,
        method: 'get'
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

  customCategoryAction() {

  }

  addCustomCateAction() {
    const rules = {
      custom_category_name: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_width: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_height: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_top: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_left: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_bg: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_bg_width: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_bg_height: {
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

  editCustomCateAction() {
    const rules = {
      custom_category_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      custom_category_name: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_width: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_height: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_top: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_left: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_bg: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_bg_width: {
        required: true,
        trim: true,
        method: 'post'
      },
      design_bg_height: {
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

  delCustomCateAction() {
    const rules = {
      custom_category_id: {
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

  getMachineByIdAction() {
    const rules = {
      custom_category_id: {
        required: true,
        trim: true,
        method: 'get'
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

  relationMachineAction() {
    const rules = {
      custom_category_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      machine_id: {
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

  unRelationMachineAction() {
    const rules = {
      custom_category_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      machine_id: {
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

  getMachineAction() {

  }

  delMachineAction() {
    const rules = {
      machine_id: {
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

  addMachineAction() {
    const rules = {
      machine_name: {
        required: true,
        trim: true,
        method: 'post'
      },
      machine_code: {
        required: true,
        trim: true,
        method: 'post'
      },
      desc: {
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

  editMachineAction() {
    const rules = {
      machine_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      machine_name: {
        required: true,
        trim: true,
        method: 'post'
      },
      machine_code: {
        required: true,
        trim: true,
        method: 'post'
      },
      desc: {
        required: true,
        trim: true,
        method: 'post'
      },
    }
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
