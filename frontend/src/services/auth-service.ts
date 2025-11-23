import {HttpUtils} from "../utils/http-utils";
import {LoginInterface} from "../types/login.interface";
import {LoginResponseType} from "../types/login-response.type";
import {CommonErrorType} from "../types/common-error.type";
import {SignUpInterface} from "../types/sign-up.interface";
import {LogoutType} from "../types/logout.type";

export class AuthService {

    public static async logIn(data: LoginInterface): Promise<LoginResponseType | CommonErrorType | null> {
        const result = await HttpUtils.request('/login', 'POST', false, data);
        if (result.response.error || !result.response.tokens || !result.response.user) {
            if (result.response && result.response.message) {
                return {errorMessage: result.response.message};
            }
            return null;
        }
        return result.response;
    };

    public static async signUp(data: SignUpInterface): Promise<CommonErrorType | LoginResponseType | null> {
        const result = await HttpUtils.request('/signup', 'POST', false, data);
        if (result.response.error || !result.response.user) {
            if (result.response && result.response.message) {
                return {errorMessage: result.response.message};
            }
            return null;
        }
        return await this.logIn({
            email: data.email,
            password: data.password,
            rememberMe: false,
        })
    }

    static async logOut(data: LogoutType): Promise<void> {
        await HttpUtils.request('/logout', 'POST', false, data);
    };
}