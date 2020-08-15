import { think } from 'thinkjs';
import base from './base'
export default class extends base {
  orderListAction() {

  }
  orderCountAction() {

  }
  orderDetailAction() {
    const rules = {
      order_no: {
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
  testAction() {

  }
  expressListAction() {

  }
  orderTraceAction() {
    const rules = {
      order_item_id: {
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

  sendGoodsAction() {
    const rules = {
      order_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      order_item_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      express_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      express_number: {
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
  confirmPaymentAction() {
    const rules = {
      order_id: {
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
  confirmReceivedAction() {
    const rules = {
      order_id: {
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
  dispatchOrderAction() {
    const rules = {
      order_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      designer_team_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      designer_price: {
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
  replyOrderAction() {
    this.allowMethods = 'POST';
    const rules = {
      order_id: {
        required: true,
        trim: true,
        method: 'post'
      },
      price: {
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
  sendMachineAction() {
    this.allowMethods = 'POST';
    const rules = {
      order_id: {
        required: true,
        trim: true,
        method: 'post',
        array: true
      },
      custom_template_id: {
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
  exportExcelAction() {

  }
}
