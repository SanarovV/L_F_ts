import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {ValidationsType} from "../../types/validations.type";
import {OpenNewRouteInterface} from "../../types/open-new-route.interface";
import {OperationKeysType, OperationType} from "../../types/operation.type";
import {CategoryResponseType, CategoryType} from "../../types/category.type";

export class Operation {
    readonly categoryObject: { [key: string]: number } = {};
    public params: URLSearchParams | null;
    public cancelButton: HTMLLinkElement | null;
    public dateInputElement: HTMLInputElement | null;
    public proceedButton: HTMLElement | null;
    public amountInputElement: HTMLInputElement | null;
    public commentaryInputElement: HTMLInputElement | null;
    public validations: ValidationsType[] | [];
    private typeOptionsObject: { [key: string]: HTMLOptionElement };
    public categorySelectElement: HTMLInputElement | null;
    public typeSelectElement: HTMLSelectElement | null;
    public period: string;
    public openNewRoute: OpenNewRouteInterface;
    public currentOperation: OperationType | null;

    constructor(openNewRoute: OpenNewRouteInterface) {
        this.categoryObject = {};
        this.params = null;
        this.cancelButton = null;
        this.dateInputElement = null;
        this.proceedButton = null;
        this.amountInputElement = null;
        this.commentaryInputElement = null;
        this.validations = [];
        this.typeOptionsObject = {};
        this.categorySelectElement = null;
        this.typeSelectElement = null;
        this.period = 'today';
        this.openNewRoute = openNewRoute;
        this.currentOperation = null;
        this.init().then();
    }

    public async init(): Promise<void> {
        this.findElements();
        this.setValidations();
        this.setTypeSelectElementEventListener().then();
        this.params = new URLSearchParams(window.location.search);
        const paramsPeriod = this.params.get('period');
        if (paramsPeriod) {
            this.period = paramsPeriod;
        }
        this.cancelButton ? this.cancelButton.href = `/balance?period=${this.period}` : null;
        this.dateInputElement ? this.dateInputElement.value = new Date().toISOString().slice(0, 10) : null;
    };

    private async getCategories(type: CategoryType): Promise<CategoryResponseType[]> {
        const result: any = await HttpUtils.request('/categories/' + type, 'GET');
        console.log(result);
        return result.response;
    };

    private findElements(): void {
        this.categorySelectElement = document.getElementById("category") as HTMLInputElement;
        this.typeSelectElement = document.getElementById('type') as HTMLSelectElement;
        this.proceedButton = document.getElementById('proceed');
        this.cancelButton = document.getElementById('cancel') as HTMLLinkElement;
        this.amountInputElement = document.getElementById('amount') as HTMLInputElement;
        this.dateInputElement = document.getElementById('date') as HTMLInputElement;
        this.commentaryInputElement = document.getElementById('commentary') as HTMLInputElement;
    }

    private setValidations(): void {
        this.validations = [
            {element: this.categorySelectElement},
            {element: this.typeSelectElement},
            {element: this.amountInputElement},
            {element: this.dateInputElement},
        ];
    }

    public async loadCategoryList(category: CategoryType, safeToObject: boolean = false): Promise<void> {
        if (['income', 'expense'].includes(category)) {
            const categories: CategoryResponseType[] = await this.getCategories(category);
            categories.forEach(category => {
                const optionElement = document.createElement('option');
                optionElement.value = category.id.toString();
                optionElement.innerText = category.title;
                optionElement.classList.add('added-option-category');
                if (this.categorySelectElement) {
                    this.categorySelectElement.appendChild(optionElement);
                }
                if (safeToObject) {
                    this.categoryObject[category.title] = category.id;
                }
            });
        }
    };

    private async setTypeSelectElementEventListener(): Promise<void> {
        if (this.typeSelectElement) {
            this.typeSelectElement.addEventListener('change', (e) => {
                document.querySelectorAll('.added-option-category').forEach(item => {
                    item.remove();
                });
                this.loadCategoryList((e.target as HTMLInputElement).value as CategoryType);
                this.categorySelectElement!.value = '';
            });
        }
    };

    public setInitialType(this: this, type: CategoryType): void {
        if (!this.typeSelectElement) return;
        this.typeOptionsObject = {};
        for (let el of Array.from(this.typeSelectElement.children)) {
            if ((el as HTMLOptionElement).value) {
                this.typeOptionsObject[(el as HTMLOptionElement).value] = el as HTMLOptionElement;
            }
        }
        if (this.typeOptionsObject[type]) {
            this.typeOptionsObject[type].setAttribute('selected', '');
        }
    }
}

export class OperationCreate extends Operation {
    public async init(): Promise<void> {
        super.init().then();
        const type: CategoryType | null = (new URLSearchParams(window.location.search)).get('type') as CategoryType | null;
        if (type) {
            this.setInitialType(type);
        }
        if (this.typeSelectElement!.value) {
            await this.loadCategoryList(this.typeSelectElement!.value as CategoryType);
        }
        if (this.proceedButton) {
            this.proceedButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (ValidationUtils.validateForm(this.validations)) {
                    HttpUtils.request('/operations', 'POST', true, {
                        type: this.typeSelectElement!.value,
                        category_id: parseInt(this.categorySelectElement!.value),
                        amount: parseInt(this.amountInputElement!.value),
                        date: new Date(this.dateInputElement!.value).toISOString().slice(0, 10),
                        comment: this.commentaryInputElement!.value ? this.commentaryInputElement!.value : ' ',
                    });
                    this.openNewRoute(`/balance?period=${this.period}`);
                }
            });
        }
    };

}

export class OperationEdit extends Operation {
    public async init(): Promise<void> {
        super.init().then();
        const mainTitleElement: HTMLElement | null = document.querySelector('.main-content__title');
        if (mainTitleElement) {
            mainTitleElement.innerText = 'Редактирование дохода/расхода';
        }
        let operationId: string | null = null;
        if (this.params) {
            operationId = this.params.get('operationId');
            if (operationId) {
                await this.loadCurrentOperation(operationId);
            } else {
                await this.openNewRoute('/balance');
                return;
            }
        }
        if (this.proceedButton) {
            this.proceedButton.innerText = 'Сохранить';
            this.proceedButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (ValidationUtils.validateForm(this.validations)) {
                    const changedOperation: OperationType = {
                        type: this.typeSelectElement!.value,
                        category_id: parseInt(this.categorySelectElement!.value),
                        amount: parseInt(this.amountInputElement!.value),
                        date: new Date(this.dateInputElement!.value).toISOString().slice(0, 10),
                        comment: this.commentaryInputElement!.value ? this.commentaryInputElement!.value : ' ',
                    };
                    const hasChanged: boolean = Object.keys(changedOperation).map((key) => {
                        return changedOperation[key as OperationKeysType] !== this.currentOperation![key as OperationKeysType];
                    }).some(Boolean);
                    if (hasChanged) {
                        HttpUtils.request(`/operations/${operationId}`, 'PUT', true, changedOperation);
                    }
                    this.openNewRoute(`/balance?period=${this.period}`);
                }
            });
        }
        if (this.cancelButton) {
            this.cancelButton.href = `/balance?period=${this.period}`;
        }
        if (this.typeSelectElement) {
            this.typeSelectElement.disabled = true;
        }
    };

    public async loadCurrentOperation(id: string): Promise<void> {
        const result = await HttpUtils.request(`/operations/${id}`, 'GET');
        if (result.response && !result.response.error) {
            this.currentOperation = result.response;
            this.setInitialType(this.currentOperation!.type as CategoryType);
            if (this.typeSelectElement!.value) {
                await this.loadCategoryList(this.typeSelectElement!.value as CategoryType, true);
            }
            this.currentOperation!.category_id = this.categoryObject[this.currentOperation!.category as string];
            this.categorySelectElement!.value = this.categoryObject[this.currentOperation!.category as string].toString();
            this.amountInputElement!.value = this.currentOperation!.amount.toString();
            this.dateInputElement!.value = new Date(this.currentOperation!.date.split('.').reverse().join('-')).toISOString().slice(0, 10);
            this.commentaryInputElement!.value = this.currentOperation!.comment;
        }
    };
}
