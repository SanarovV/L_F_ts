import {OperationsService} from "../../services/operations-service";
import {BalanceService} from "../../services/balance-service";
import {HttpUtils} from "../../utils/http-utils";
import {CategoryResponseType} from "../../types/category.type";

export class Categories {
    private types: { income: { title: string }; expense: { title: string } };
    readonly type: 'income' | 'expense';
    readonly createCategoryElement: HTMLLinkElement | null;

    constructor(type: 'income' | 'expense') {
        this.types = {
            income: {title: 'Доходы'},
            expense: {title: 'Расходы'},
        };
        this.type = type;
        this.createCategoryElement = document.getElementById("create-category") as HTMLLinkElement;
        this.init();
        this.getCategories().then();
    }

    private init(): void {
        const mainTitleElement: HTMLElement | null = document.querySelector('.main-content__title');
        if (mainTitleElement) {
            mainTitleElement.innerText = this.types[this.type].title;
        }
        if (this.createCategoryElement) {
            this.createCategoryElement.href = `/categories/${this.type}/create`;
        }
    }


    private async getCategories(): Promise<void> {
        const result = await HttpUtils.request(`/categories/${this.type}`, 'GET');
        this.showCategories(result.response).then();
    };


    private async showCategories(categories: CategoryResponseType[]): Promise<void> {
        if (this.createCategoryElement) {
            categories.forEach(category => {
                const newCatElement = document.createElement('div');
                newCatElement.classList.add('card', 'card-category', 'border', 'rounded-3', 'me-3', 'mb-3', 'category-item');
                newCatElement.innerHTML = `
                <div class="card-body p-20">
                    <div class="card-title h3 f-weight-500" id="${category.id}">${category.title}</div>
                    <div class="actions f-weight-500">
                        <a href="/categories/${this.type}/edit?category=${category.id}" class="btn btn-primary f-size-14 l-height-24 px-3 edit-button">Редактировать</a>
                        <button type="button" class="btn btn-danger ml-10 f-size-14 l-height-24 px-3 remove-button"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">Удалить
                        </button>
                    </div>
                </div>
            `;
                this.createCategoryElement!.parentNode!.insertBefore(newCatElement, this.createCategoryElement);
            });
        }
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'), {});
        const deleteModalTitle = document.getElementById('delete-modal-title');
        if (deleteModalTitle) {
            deleteModalTitle.innerText = 'Вы действительно хотите удалить категорию? Связанные доходы будут удалены навсегда.';
        }
        const removeButtonsElementArray = Array.from(document.getElementsByClassName("remove-button")) as HTMLElement[];
        removeButtonsElementArray.forEach((btn) => {
            btn.addEventListener("click", () => {
                const confirmRemoveButton = document.getElementById('confirm-remove') as HTMLElement;
                const cloneBtn = confirmRemoveButton.cloneNode(true);
                confirmRemoveButton.parentNode!.replaceChild(cloneBtn, confirmRemoveButton);
                cloneBtn.addEventListener('click', this.removeButtonEventListener.bind(this, btn, modal));
            });
        });
    };


    private async removeButtonEventListener(btn: HTMLElement, modal: any): Promise<void> {
        modal.hide();
        const catId = btn.parentElement!.previousElementSibling!.id;
        const catTitle = btn.parentElement!.previousElementSibling!.innerHTML;
        const operations = await OperationsService.getOperations('all');
        const removingOperations = operations.filter(operation => operation.category === catTitle && operation.type === this.type);
        removingOperations.forEach(operation => {
            HttpUtils.request(`/operations/${operation.id}`, 'DELETE').then();
        });
        HttpUtils.request(`/categories/${this.type}/${catId}`, 'DELETE').then(() => {
            this.clearCategoriesList();
            this.getCategories().then();
            BalanceService.getBalance().then((balance) => {
                const balanceElement = document.getElementById('balance');
                if (balanceElement && balance) {
                    balanceElement.innerText = `${parseInt(balance).toLocaleString()} $`;
                }
            });
        });
    };

    private clearCategoriesList(): void {
        document.querySelectorAll('.category-item').forEach(category => {
            category.remove();
        });
    }
}
