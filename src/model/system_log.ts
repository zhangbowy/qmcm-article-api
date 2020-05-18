import { think } from 'thinkjs';

export default class extends think.Model {
    get pk() {
        return 'system_log_id';
    }
}
