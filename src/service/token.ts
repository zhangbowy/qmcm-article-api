const jwt = require('jsonwebtoken');
const secret = 'yuncixiu';
import { think } from 'thinkjs';
module.exports = class extends think.Service {
    async getUserId(token: string) {
        if (!token) {
            return 0;
        }

        const result = await this.parse1(token);
        if (think.isEmpty(result) || result.user_id <= 0) {
            return 0;
        }

        return result.user_id;
    }

    async create1(userInfo: any) {
        const token = jwt.sign(userInfo, secret);
        return token;
    }

    async parse1(token: string) {
        if (token) {
            try {
                return jwt.verify(token, secret);
            } catch (err) {
                return null;
            }
        }
        return null;
    }

    async verify(token: any) {
        const result = await this.parse1(token);
        if (think.isEmpty(result)) {
            return false;
        }

        return true;
    }
};
