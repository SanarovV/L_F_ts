import {AuthUtils} from "../../utils/auth-utils";
import {AuthService} from "../../services/auth-service";
import {OpenNewRouteInterface} from "../../types/open-new-route.interface";
import {AuthInfoType} from "../../types/auth-info.type";

export class Logout {
    readonly openNewRoute: OpenNewRouteInterface;
    readonly refreshToken: string | AuthInfoType | null;

    constructor(openNewRoute: OpenNewRouteInterface) {
        this.openNewRoute = openNewRoute;
        this.refreshToken = AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey);
        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !this.refreshToken) {
            this.openNewRoute('/login').then();
            return;
        }
        this.logout().then();
    }

    private async logout(): Promise<void> {
            if (typeof this.refreshToken === "string") {
                await AuthService.logOut({ refreshToken: this.refreshToken });
            }
            AuthUtils.removeAuthInfo();
            await this.openNewRoute('/login');
        };
}
