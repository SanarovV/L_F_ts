import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {OpenNewRouteInterface} from "../../types/open-new-route.interface";
import {ValidationsType} from "../../types/validations.type";
import {CategoryResponseType} from "../../types/category.type";

export class Category {
    readonly openNewRoute: OpenNewRouteInterface;
    readonly categoryNameElement: HTMLInputElement | null;
    readonly categoryNameError: HTMLElement | null;
    readonly proceedButtonElement: HTMLElement | null;
    private types: { income: { title: string }; expense: { title: string } };
    private actions: {
        create: { title: string; buttonTitle: string; method: string }
        edit: { title: string; buttonTitle: string; method: string }
    };
    readonly validations: ValidationsType[];
    readonly type: 'income' | 'expense';
    readonly action: 'edit' | 'create';
    constructor(openNewRoute: OpenNewRouteInterface, type: 'income' | 'expense', action: 'edit' | 'create') {
        this.openNewRoute = openNewRoute;
        this.categoryNameElement = document.getElementById("category-name") as HTMLInputElement;
        this.categoryNameError = document.getElementById("category-name-error");
        this.proceedButtonElement = document.getElementById("proceed");
        this.types = {
            income: {title: 'доходов'},
            expense: {title: 'расходов'},
        };
        this.actions = {
            create: {title: 'Создание', buttonTitle: 'Создать', method: 'POST'},
            edit: {title: 'Редактирование', buttonTitle: 'Сохранить', method: 'PUT'},
        };
        this.validations = [
            {
                element: this.categoryNameElement,
                options: {pattern: /^[А-ЯЁ][а-яё]+(?: [А-ЯЁ][а-яё]+)*$/,},
                errorElement: this.categoryNameError,
                errorPatternText: 'Поле - должно содержать русские буквы, начинается с большой буквы'
            },
        ];
        this.type = type;
        this.action = action;
        this.init();
    }

    private init(): void {
        const mainTitleElement = document.querySelector('.main-content__title') as HTMLElement;
        mainTitleElement.innerText = `${this.actions[this.action].title} категории ${this.types[this.type].title}`;
        const cancelButton = document.getElementById('cancel') as HTMLLinkElement;
        cancelButton ? cancelButton.href = `/categories/${this.type}` : null;
        this.proceedButtonElement ? this.proceedButtonElement.innerText = this.actions[this.action].buttonTitle : null;
        if (this.action === 'edit') {
            this.getCategory().then();
        } else {
            this.setCategory().then();
        }
    }

    private async getCategory(): Promise<void> {
        const params = new URLSearchParams(location.search);
        const catId = params.get("category");
        const result = await HttpUtils.request(`/categories/${this.type}/${catId}`, 'GET');
        this.setCategory(result.response).then();
    };

    private async setCategory(category: CategoryResponseType | null = null): Promise<void> {
        let idPath = '';
        if (category && this.categoryNameElement) {
            this.categoryNameElement.value = category.title;
            idPath = `/${category.id}`;
        }

        if (this.proceedButtonElement && this.categoryNameElement) {
            this.proceedButtonElement.addEventListener("click", () => {
                for (let i = 0; i < this.validations.length; i++) {
                    let validations = this.validations[i];
                    if ((validations.element!.value === '') && validations.errorPatternText) {
                        if (this.categoryNameError) {
                            this.categoryNameError.innerText = 'Заполните поле'
                        }
                    }
                }
                if (ValidationUtils.validateForm(this.validations)) {
                    if ((category && this.categoryNameElement!.value !== category.title) || this.action === 'create') {
                        HttpUtils.request(`/categories/${this.type}${idPath}`, this.actions[this.action].method, true, {title: this.categoryNameElement!.value});
                    }
                    this.openNewRoute(`/categories/${this.type}`);
                }
            });
        }
    };
}
