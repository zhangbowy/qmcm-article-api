import { think } from 'thinkjs';
export default class extends think.Model {
    get pk() {
        return 'express_id';
    }
}
