export type OperationType = {
    id?: number,
    type: string,
    amount: number,
    date: string,
    comment: string,
    category?: string,
    category_id?: number,
}

export type OperationKeysType = 'id' | 'type' | `amount` | 'date' | 'comment' | 'category' | 'category_id'