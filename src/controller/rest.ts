import { think } from 'thinkjs';
export default class extends think.Controller {
  async __before() {

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

  __call() {
    return this.fail(404,'res_controller');
  }
}
