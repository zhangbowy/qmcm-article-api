import { think } from 'thinkjs';
import base from './base';
export default class extends base {
    loginAction() {

    }
    logoutAction() {

    }
    infoAction() {

    }
    sendSmsAction() {
        this.allowMethods = 'POST';
    }
}
