import {HttpUtils} from "../../utils/http-utils";
import {BalanceService} from "../../services/balance-service";
import {OperationsService} from "../../services/operations-service";
import {periodSelectButtonsProcessing} from "../main-page";
import {GetOperationInterface} from "../../types/get-operation.interface";
import {OperationType} from "../../types/operation.type";

export class Balance {
    public period: string;
    public periodBarElementsArray: NodeListOf<HTMLElement>;
    public dateFromElement: HTMLInputElement | null;
    public dateToElement: HTMLInputElement | null;
    public IntervalDurationDivElement: HTMLElement | null;
    readonly createIncomeButton: HTMLLinkElement | null;
    readonly createExpenseButton: HTMLLinkElement | null;
    readonly tableBody: HTMLElement | null;
    readonly balanceElement: HTMLElement | null;
    private getOperations: GetOperationInterface;

    constructor() {
        this.period = 'today';
        this.periodBarElementsArray = document.querySelectorAll('.period-selection a');
        this.dateFromElement = document.getElementById('dateFrom') as HTMLInputElement;
        this.dateToElement = document.getElementById('dateTo') as HTMLInputElement;
        this.IntervalDurationDivElement = document.getElementById('interval-duration');
        this.createIncomeButton = document.getElementById("create-income") as HTMLLinkElement;
        this.createExpenseButton = document.getElementById("create-expense") as HTMLLinkElement;
        this.tableBody = document.getElementById('records');
        this.balanceElement = document.getElementById('balance');
        this.getOperations = OperationsService.getOperations;
        this.init();
        this.getOperations(this.period, this.dateFromElement, this.dateToElement)
            .then(operations => {
                this.loadBalance(operations);
            });
    }

    private init(): void {
        const currentPeriod: string | null = new URLSearchParams(location.search).get('period');
        this.period = currentPeriod ? currentPeriod : 'today';
        if (this.createIncomeButton) {
            this.createIncomeButton.href += `&period=${currentPeriod}`;
        }
        if (this.createExpenseButton) {
            this.createExpenseButton.href += `&period=${currentPeriod}`;
        }
        periodSelectButtonsProcessing.call(this);
        if (this.dateFromElement) {
            this.dateFromElement.addEventListener('change', () => {
                this.tableBody ? this.tableBody.innerHTML = '' : null;
                this.getOperations(this.period, this.dateFromElement, this.dateToElement)
                    .then(operations => {
                        this.loadBalance(operations);
                    });
            });
        }
        if (this.dateToElement) {
            this.dateToElement.addEventListener('change', () => {
                this.tableBody ? this.tableBody.innerHTML = '' : null;
                this.getOperations(this.period, this.dateFromElement, this.dateToElement)
                    .then(operations => {
                        this.loadBalance(operations);
                    });
            });
        }
    }

    private loadBalance(operations: OperationType[]): void {
        operations.forEach(operation => {
            const trElement: HTMLTableRowElement = document.createElement("tr");
            const thElement: HTMLTableCellElement = document.createElement("th");
            thElement.setAttribute('scope', 'row');
            thElement.classList.add('row_number');
            thElement.innerText = operation.id!.toString();
            trElement.appendChild(thElement);
            const typeCellElement: HTMLTableCellElement = document.createElement("td");
            typeCellElement.innerText = operation.type === 'income' ? 'доход' : 'расход';
            if (operation.type === "expense") {
                typeCellElement.classList.add('text-danger');
            } else {
                typeCellElement.classList.add('text-success');
            }
            trElement.appendChild(typeCellElement);
            trElement.insertCell().innerText = operation.category ? operation.category.toLocaleLowerCase() : '';
            trElement.insertCell().innerText = `${operation.amount.toLocaleString()}$`;
            trElement.insertCell().innerText = (new Date(operation.date)).toLocaleDateString();
            trElement.insertCell().innerText = operation.comment;
            trElement.insertCell().innerHTML = `
                            <div class="balance-table__actions">
                                <button class="btn m-0 p-0 remove-button" operation-id="${operation.id}" data-bs-toggle="modal" data-bs-target="#deleteModal">
                                    <i class="bi bi-trash"></i>
                                </button>
                                <a href="/balance/edit?operationId=${operation.id}&period=${this.period}" class="btn m-0 p-0 edit-operation">
                                    <i class="bi bi-pencil"></i>
                                </a>
                            </div>`;
            const tableBodyElement: HTMLElement | null = document.getElementById('records');
            if (tableBodyElement) {
                tableBodyElement.appendChild(trElement);
            }
        });
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'), {});
        const removeButtonsElementArray: HTMLElement[] = Array.from(document.querySelectorAll(".remove-button"));
        removeButtonsElementArray.forEach((btn) => {
            btn.addEventListener("click", () => {
                const confirmRemoveButton: HTMLElement | null = document.getElementById('confirm-remove');
                if (confirmRemoveButton) {
                    const cloneBtn = confirmRemoveButton.cloneNode(true);
                    confirmRemoveButton.parentNode!.replaceChild(cloneBtn, confirmRemoveButton);
                    cloneBtn.addEventListener('click', () => {
                        const operationId: string | null = btn.getAttribute('operation-id');
                        modal.hide();
                        btn.parentElement!.parentElement!.parentElement!.remove();
                        HttpUtils.request(`/operations/${operationId}`, 'DELETE').then(() => {
                            BalanceService.getBalance().then((balance) => {
                                if (balance && this.balanceElement) {
                                    this.balanceElement.innerText = `${parseInt(balance).toLocaleString()} $`;
                                }
                            });
                        });
                    });
                }
            });
        });
    }
}