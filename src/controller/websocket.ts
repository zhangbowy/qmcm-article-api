import Base from './base.js';
import {think} from "thinkjs";

export default class  extends think.Controller {
// export default class extends Base {
    // @ts-ignore
    // constructor(...arg) {
    //     // @ts-ignore
    //     super(...arg);
    //     // @ts-ignore
    //     this.io = this.ctx.req.io;
    //     // @ts-ignore
    //     this.socket = this.ctx.req.websocket;
    // }
    async openAction() {
        // @ts-ignore
        this.ctx.req.websocket.emit('open', '张博');
        // @ts-ignore
        this.ctx.req.websocket.emit('offline', '张博')

    }
    async closeAction() {
        // @ts-ignore
        // this.socket.disconnect(true);
    }
     // @ts-ignore
    async offlineAction() {
            // @ts-ignore
             // @ts-ignore
        this.ctx.req.websocket.broadcast.emit('open', '下线');
             // this.socket.broadcast('offline', '下线');

             // @ts-ignore
             // this.socket.broadcast.emit('offline', 'This client opened successfully!');
         }


}
