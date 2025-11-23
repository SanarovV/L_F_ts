import {AuthUtils} from "../../utils/auth-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {OpenNewRouteInterface} from "../../types/open-new-route.interface";
import {ValidationsType} from "../../types/validations.type";
import {LoginResponseType} from "../../types/login-response.type";
import {CommonErrorType} from "../../types/common-error.type";
import {AuthService} from "../../services/auth-service";


export class Login {
    private readonly openNewRoute: OpenNewRouteInterface;
    private emailElement: HTMLInputElement | null = null;
    private passwordElement: HTMLInputElement | null = null;
    private rememberMeElement: HTMLInputElement | null = null;
    private commonErrorElement: HTMLElement | null = null;
    private passwordErrorElement: HTMLInputElement | null = null;
    private validations: ValidationsType[] | [] = [];

    constructor(openNewRoute: OpenNewRouteInterface) {
        this.openNewRoute = openNewRoute;
        this.findElements();
        this.setValidations();
        const loginButtonElement = document.getElementById("login");
        if (loginButtonElement) {
            loginButtonElement.addEventListener("click", this.login.bind(this));
        }
    }

    private findElements(): void {
        this.emailElement = document.getElementById('email') as HTMLInputElement;
        this.passwordElement = document.getElementById('password') as HTMLInputElement;
        this.rememberMeElement = document.getElementById('remember') as HTMLInputElement;
        this.commonErrorElement = document.getElementById('common-error');
        this.passwordErrorElement = document.getElementById('password-error') as HTMLInputElement;
    }

    private setValidations(): void {
        this.validations = [
            {
                element: this.passwordElement,
                options: {pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/},
                errorElement: this.passwordErrorElement,
                errorPatternText: 'Пароль должен быть не менее 6 символов и содержать цифру, латинскую букву в верхнем и нижнем регистре'
            },
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
        ];
    }

    private async login(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }
        for (let i = 0; i < this.validations.length; i++) {
            let validations: ValidationsType = this.validations[i];
            if ((validations.element!.value === '') && validations.errorPatternText) {
                if (this.passwordErrorElement) {
                    this.passwordErrorElement.innerText = 'Введите пароль'
                }
            }
        }
        if (ValidationUtils.validateForm(this.validations)) {
            let loginResult: LoginResponseType | CommonErrorType | null = await AuthService.logIn({
                email: this.emailElement!.value,
                password: this.passwordElement!.value,
                rememberMe: this.rememberMeElement ? this.rememberMeElement.checked : false
            });

            if (!(loginResult as CommonErrorType).errorMessage && (loginResult as LoginResponseType).user) {
                loginResult = loginResult as LoginResponseType;
            } else {
                if (this.commonErrorElement) {
                    this.commonErrorElement.style.display = 'block';
                    if (loginResult && (loginResult as CommonErrorType).errorMessage) {
                        this.commonErrorElement.innerText = (loginResult as CommonErrorType).errorMessage;
                    }
                }
                return;
            }

            if (loginResult && loginResult.user) {
                AuthUtils.setAuthInfo(loginResult.tokens.accessToken,
                    loginResult.tokens.refreshToken, {
                        id: loginResult.user.id,
                        name: loginResult.user.name,
                        lastName: loginResult.user.lastName,
                    });
                return this.openNewRoute('/')
            }
        }
    }
}