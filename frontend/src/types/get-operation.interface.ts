import {OperationType} from "./operation.type";

export interface GetOperationInterface {
    (period: string,
     dateFromElement?: (HTMLInputElement | null),
     dateToElement?: (HTMLInputElement | null)): Promise<Array<OperationType>>,
}