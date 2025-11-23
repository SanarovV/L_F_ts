export enum AuthUtilsKeys {
    accessTokenKey = 'accessToken',
    refreshTokenKey = 'refreshToken',
    userInfoTokenKey = 'userInfo',
}

export type AuthInfoType = {
    [key in AuthUtilsKeys]: string | null;
}