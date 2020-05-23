import { think } from 'thinkjs';
export default class extends think.Controller {

  async __before() {

  }


  test1Action() {
    this.download('http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/demo/1/1/1/1.png')
  }
  /**
   * 抛出错误
   */
  // @ts-ignore
  dealErr($err) {
    let $errMsg;
    let $data: any = {};
    if ($err.sql) {
      $errMsg = $err.sqlMessage || $err.message;
      $data.code  = $err.code;
      $data.errno  = $err.errno;
      $data.sqlMessage  = $err.sqlMessage;
      $data.sqlState  = $err.sqlState;
      $data.index  = $err.index;
      $data.sql  = $err.sql;
      $data.stack  = $err.stack;
      $data.message  = $err.message;
    } else {
      if($err.stack && $err.message) {
        $errMsg= $err.message;
        $data.stack = $err.stack
      }
    }
    return this.fail(-1,$errMsg,$data);
  }

  /**
   * 递归分类列表
   */
   getTree(data:any, root:any, $id?: any,$pid?: any, pushTxt?: any) {
    var idTxt:any = $id || 'id';
    var pidTxt:any = $pid || 'pid';
    var pushTxt:any = pushTxt || 'children';
    // 递归方法
    function getNode(id:any) {
      var node = [];
      var ids = [];
      for (var i = 0; i < data.length; i++) {
        if (data[i][pidTxt] == id) {
          data[i][pushTxt] = getNode(data[i][idTxt]);
          node.push(data[i])
        }
      }
      if (node.length == 0) {
        return
      } else {
        return node
      }
    }
    return getNode(root)
  }
  /**
   * 獲取遠程圖片內容
   * @param $this
   * @param $filePath url
   * @param $buffer  output tpye of 1 buffer 0 base64
   */
  async  getBuffer($this: any,$filePath: any,$buffer?: boolean) {

    const { Writable } = require('stream');
    // const res = await $this.fetch('http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/gallary/15/2020-04-22/6ca6e51d-028a-43d7-89a2-3537ccfe1adf.png');
    const res = await $this.fetch($filePath);
    let chunks: any = [];
    let size = 0;
    return new Promise((resolve,reject) => {
      /**
       * 创建可写流
       */
      const outStream = new Writable({
        write(chunk: Buffer, encoding: string, callback: any) {
          chunks.push(chunk);
          console.log(chunk);
          size += chunk.length;
          callback()
        },
        final(){
          /**
           * 拼接Buffer
           */
          let newBuffer = Buffer.concat(chunks,size);
          // @ts-ignore
          let img = 'data:image/png;base64,' + Buffer.from(newBuffer, 'utf8').toString('base64');
          if ($buffer) {
            resolve(newBuffer);
          } else {
            resolve(img);
          }
        }
      });
      res.body.pipe(outStream);
    })
  }
  __call() {
    return this.fail(404,'res_controller');
  }
}
