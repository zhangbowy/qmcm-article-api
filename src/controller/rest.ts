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

  __call() {
    return this.fail(404,'res_controller');
  }
}
