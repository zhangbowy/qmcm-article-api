import { think } from 'thinkjs';

module.exports = class extends think.Logic {
    static get _REST() {
        return true;
    }

    constructor(ctx: any) {
        super(ctx);
    }
    __before() {
        this.header("Access-Control-Allow-Origin", this.header("origin") || "*");
        this.header("Access-Control-Allow-Headers", ["x-requested-with", 'token', 'content-type']);
        this.header("Access-Control-Request-Method", "GET,POST,PUT,DELETE,OPTIONS");
        this.header('Access-Control-Allow-Credentials', true);
        this.allowMethods = 'post';
    }
};
