import {LoginInterface} from "./login.interface";

export interface SignUpInterface extends LoginInterface {
    name: string,
    lastName: string,
    passwordRepeat: string,
}