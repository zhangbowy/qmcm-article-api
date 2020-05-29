import { think } from 'thinkjs';

export default class extends think.Logic {
    static get _REST() {
        return true;
    }
    constructor(ctx: any) {
        super(ctx);
    }
    __before() {
        this.header("Access-Control-Allow-Origin", this.header("origin") || "*");
        this.header("Access-Control-Allow-Headers", ["x-requested-with", 'origin', 'content-type', 'design_sign']);
        this.header("Access-Control-Request-Method", "GET,POST,PUT,DELETE,OPTIONS");
        this.header('Access-Control-Allow-Credentials', true);
        this.header('X-Powered-By', 'thinkphp5.0');
        // this.allowMethods = 'post';
    }
    __call() {
        return this.fail(404, 'design_logic');
    }

}
