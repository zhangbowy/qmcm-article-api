import { think } from 'thinkjs';
import base from './base';

export default class extends base {
    getCashListAction() {
        this.allowMethods = 'GET';
    }

}

