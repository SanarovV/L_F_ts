import {HttpUtils} from "../utils/http-utils";
import {OperationType} from "../types/operation.type";

export class OperationsService {

    public static async getOperations (period: string, dateFromElement: HTMLInputElement | null = null,
                                       dateToElement: HTMLInputElement | null = null): Promise<Array<OperationType>> {
            let params: string = `?period=${period}`;
            if (period === 'interval' && dateFromElement && dateToElement) {
                params += `&dateFrom=${dateFromElement.value}&dateTo=${dateToElement.value}`;
            }
            else if (period === 'today') {
                const today: string = new Date().toISOString().slice(0, 10);
                params = `?period=interval&dateFrom=${today}&dateTo=${today}`;
            }
            const result = await HttpUtils.request(`/operations${params}`, 'GET');
            return result.response;
        };

}