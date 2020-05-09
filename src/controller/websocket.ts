// import Base from './base.js';
// import {think} from "thinkjs";
// const userHash = {};
// const idHash = {};
// // @ts-ignore
// export default class  extends think.Controller {
// // export default class extends Base {
//     // @ts-ignore
//     constructor(...arg) {
//         // @ts-ignore
//         super(...arg);
//         // @ts-ignore
//         this.io = this.ctx.req.io;
//         // @ts-ignore
//         this.socket = this.ctx.req.websocket;
//         // @ts-ignore
//     }
//     async openAction() {
//         // @ts-ignore
//         this.socket.emit('open', '连接成功!');
//         // @ts-ignore
//         // this.ctx.req.websocket.emit('offline', '张博')
//
//     }
//     async closeAction() {
//         // @ts-ignore
//         this.socket.disconnect(true);
//         // @ts-ignore
//         if(this.socket.id in global.$socketList) {
//             // @ts-ignore
//             delete global.$socketList[this.socket.id];
//             // @ts-ignore
//             console.log(global.$socketList)
//         }
//
//         // @ts-ignore
//         console.log(global.$socketList)
//     }
//
//     sendInfoAction() {
//         // @ts-ignore
//         let $data = this.wsData;
//         // @ts-ignore
//         // @ts-ignore
//         global.$socketList[$data.socketId] = $data;
//         // @ts-ignore
//         global.$socketId[$data.adminId] = $data;
//
//         // @ts-ignore
//         // this.io.sockets.to($data.socketId).emit('offline', {
//         //     txt:"下线"
//         // });
//         console.log(global.$socketList);
//         // this.socket.on('sendInfo', function($data) {
//         //     this.userHash[$data.adm_sign] = $data
//         //  const { tokenId, userId, socketId } = info;
//         //     addSocketId(users, { tokenId, socketId, userId });
//         // });
//         // @ts-ignore
//         for(let socketId of Object.keys(global.$socketList)) { // @ts-ignore
//             this.ctx.req.io.sockets.to(socketId).emit('offline', {
//                 txt:"下线"
//             });
//         }
//     }
//      // @ts-ignore
//     async offlineAction() {
//         // let admin_id = 14;
//         // global.$socketId[$data.adminId] = $data;
//         let admin_id = this.ctx.state.adm_sign;
//         // @ts-ignore
//         let socketId =  global.$socketId[admin_id].socketId;
//         if(socketId) {
//                 // @ts-ignore
//             this.io.sockets.to(socketId).emit('offline', {
//                     txt:"下线"
//                 });
//         }
//             // @ts-ignore
//         // for(let socketId of Object.keys($socketList)) { // @ts-ignore
//         //     this.io.sockets.to(socketId).emit('offline', {
//         //                 txt:"下线"
//         //             });
//         // }
//         // this.ctx.req.io.emit('this', { will: 'be received by everyone'});
//         // this.ctx.req.websocket.broadcast.emit('open', '下线');
//              // this.socket.broadcast('offline', '下线');
//
//              // @ts-ignore
//              // this.socket.broadcast.emit('offline', 'This client opened successfully!');
//          }
//
//
// }
