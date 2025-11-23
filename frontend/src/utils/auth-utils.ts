import config from "../config/config";
import {UserInfoType} from "../types/user-info.type";
import {AuthInfoType, AuthUtilsKeys} from "../types/auth-info.type";

export class AuthUtils {
    public static accessTokenKey: string = AuthUtilsKeys.accessTokenKey;
    public static refreshTokenKey: string = AuthUtilsKeys.refreshTokenKey;
    public static userInfoTokenKey: string = AuthUtilsKeys.userInfoTokenKey;

    public static setAuthInfo(accessToken: string, refreshToken: string, userInfo: UserInfoType | null = null): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        if (userInfo) {
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }

    public static removeAuthInfo(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    public static getAuthInfo(key: string | null = null): string | AuthInfoType | null {
        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)) {
            return localStorage.getItem(key);
        } else if (!key) {
            return {
                [AuthUtilsKeys.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [AuthUtilsKeys.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [AuthUtilsKeys.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
            };
        } else return null;
    }

    public static async updateRefreshToken(): Promise<boolean> {
        let result: boolean = false;
        const refreshToken: string | AuthInfoType | null = this.getAuthInfo(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.api + '/refresh', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken}),
            });
            if (response && response.status === 200) {
                const responseJson = await response.json();
                const tokens = responseJson.tokens;
                if (tokens && !tokens.error) {
                    this.setAuthInfo(tokens.accessToken, tokens.refreshToken);
                    result = true;
                }
            }
        }
        if (!result) {
            this.removeAuthInfo();
        }
        return result;
    };
}