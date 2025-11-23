import {AuthUtils} from "../../utils/auth-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {AuthService} from "../../services/auth-service";
import {OpenNewRouteInterface} from "../../types/open-new-route.interface";
import {ValidationsType} from "../../types/validations.type";
import {LoginResponseType} from "../../types/login-response.type";
import {CommonErrorType} from "../../types/common-error.type";

export class SignUp {
    readonly openNewRoute: OpenNewRouteInterface;
    private emailElement: HTMLInputElement | null = null;
    private nameElement: HTMLInputElement | null = null;
    private lastNameElement: HTMLInputElement | null = null;
    private passwordElement: HTMLInputElement | null = null;
    private passwordConfirmElement: HTMLInputElement | null = null;
    private nameErrorElement: HTMLInputElement | null = null;
    private lastNameErrorElement: HTMLInputElement | null = null;
    private commonErrorElement: HTMLElement | null = null;
    private passwordErrorElement: HTMLInputElement | null = null;
    private passwordConfirmErrorElement: HTMLInputElement | null = null;
    private validations: ValidationsType[] | [] = [];

    constructor(openNewRoute: OpenNewRouteInterface) {
        this.openNewRoute = openNewRoute;
        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            this.openNewRoute('/').then();
            return;
        }
        this.findElements();
        this.setValidations();
        const signUpButtonElement = document.getElementById("sign-up");
        if (signUpButtonElement) {
            signUpButtonElement.addEventListener("click", this.signUp.bind(this));
        }
    }

    private findElements(): void {
        this.emailElement = document.getElementById('email') as HTMLInputElement;
        this.nameElement = document.getElementById('name') as HTMLInputElement;
        this.lastNameElement = document.getElementById('last-name') as HTMLInputElement;
        this.passwordElement = document.getElementById('password') as HTMLInputElement;
        this.passwordConfirmElement = document.getElementById('password-confirm') as HTMLInputElement;
        this.nameErrorElement = document.getElementById('name-error') as HTMLInputElement;
        this.lastNameErrorElement = document.getElementById('last-name-error') as HTMLInputElement;
        this.commonErrorElement = document.getElementById('common-error');
        this.passwordErrorElement = document.getElementById('password-error') as HTMLInputElement;
        this.passwordConfirmErrorElement = document.getElementById('password-confirm-error') as HTMLInputElement;
    }

    private setValidations(): void {
        this.validations = [
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
            {
                element: this.nameElement,
                options: {pattern: /^[А-ЯЁ][а-яё]+(?: [А-ЯЁ][а-яё]+)*$/,},
                errorElement: this.nameErrorElement,
                errorPatternText: 'Имя - должно содержать русские буквы, начинается с большой буквы'
            },
            {
                element: this.lastNameElement,
                options: {pattern: /^[А-ЯЁ][а-яё]+(?: [А-ЯЁ][а-яё]+)*$/},
                errorElement: this.lastNameErrorElement,
                errorPatternText: 'Фамилия - должна содержать русские буквы, начинается с большой буквы'
            },
            {
                element: this.passwordElement,
                options: {pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/},
                errorElement: this.passwordErrorElement,
                errorPatternText: 'Пароль должен быть не менее 6 символов и содержать цифру, латинскую букву в верхнем и нижнем регистре'
            },
            {
                element: this.passwordConfirmElement,
                options: {compareTo: this.passwordElement!},
                errorElement: this.passwordConfirmErrorElement,
                errorPatternText: 'Пароль и подтверждение не совпадают'
            },
        ];
    }

    private async signUp(): Promise<void> {
        this.commonErrorElement ? this.commonErrorElement.style.display = 'none' : null;
        for (let i = 0; i < this.validations.length; i++) {
            let validations = this.validations[i];
            if ((validations.element!.value === '') && validations.errorPatternText) {
                if (this.nameErrorElement) { this.nameErrorElement.innerText = 'Введите имя' }
                if (this.lastNameErrorElement) { this.lastNameErrorElement.innerText = 'Введите фамилию' }
                if (this.passwordErrorElement) { this.passwordErrorElement.innerText = 'Введите пароль' }
                if (this.passwordConfirmErrorElement) { this.passwordConfirmErrorElement.innerText = 'Повторите пароль' }
            }

            if (validations.element === this.passwordConfirmElement) {
                let options: HTMLInputElement | undefined | string = validations.options!.compareTo;
                options = this.passwordElement!.value;
            }
        }
        if (ValidationUtils.validateForm(this.validations)) {
            let signUpResult = await AuthService.signUp( {
                name: this.nameElement!.value,
                lastName: this.lastNameElement!.value,
                email: this.emailElement!.value,
                password: this.passwordElement!.value,
                passwordRepeat: this.passwordConfirmElement!.value,
            });

            if (signUpResult && signUpResult.hasOwnProperty('user')) {
                signUpResult = signUpResult as LoginResponseType;
                AuthUtils.setAuthInfo(signUpResult.tokens.accessToken, signUpResult.tokens.refreshToken, {
                    id: signUpResult.user.id,
                    name: signUpResult.user.name,
                    lastName: signUpResult.user.lastName,
                });
                return this.openNewRoute('/?period=today');
            }

            this.commonErrorElement ? this.commonErrorElement.style.display = 'block': null;
            if (signUpResult && signUpResult.hasOwnProperty('errorMessage') && this.commonErrorElement) {
                this.commonErrorElement.innerText = (signUpResult as CommonErrorType).errorMessage;
            }
        }
    };
}