import {ValidationsType} from "../types/validations.type";

export class ValidationUtils {
    static validateForm(validations: ValidationsType[]): boolean {

        let isValid = true;

        validations.forEach((el) => {
            if (!ValidationUtils.validateField(el)) {
                isValid = false
            }
        })
        return isValid;
    }

    static validateField(object: ValidationsType): boolean {
        const element = object.element;
        const options = object.options;
        const errorElement = object.errorElement;
        const errorPatternText = object.errorPatternText;

        if (!element) { return false; }
        let condition: string | boolean = element.value;

        if (options) {
            if (options.hasOwnProperty('pattern')) {
                condition = element.value && !!element.value.match(options.pattern!);
                if (element.value && errorElement) {
                    if (typeof errorPatternText === "string") {
                        errorElement.innerText = errorPatternText
                    } }
            } else if (options.hasOwnProperty('compareTo')) {
                condition = element.value && element.value === options.compareTo!.value;
                if (element.value && errorElement) {
                    if (typeof errorPatternText === "string") {
                        errorElement.innerText = errorPatternText
                    } }
            } else if (options.hasOwnProperty('checkProperty')) {
                condition = !!options.checkProperty;
            } else if (options.hasOwnProperty('checked') && element instanceof HTMLInputElement) {
                condition = element.checked;
            }
        }

        if (condition) {
            element.classList.remove('is-invalid');
            return true;
        } else {
            element.classList.add('is-invalid');
            return false;
        }
    }
}