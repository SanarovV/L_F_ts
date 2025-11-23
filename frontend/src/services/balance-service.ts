import {HttpUtils} from "../utils/http-utils";

export class BalanceService {
    public static async getBalance(): Promise<string | null> {
        const result = await HttpUtils.request('/balance');
        if (result.response.error || !result.response.hasOwnProperty('balance')) {
            if (result.response && result.response.message) {
                return result.response.message;
            }
            return null;
        }
        return result.response.balance;
    };
}