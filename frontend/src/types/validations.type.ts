export type ValidationsType = {
    element: HTMLInputElement | HTMLSelectElement | null
    options?: {
        pattern?: RegExp,
        checkProperty?: boolean,
        compareTo?: HTMLInputElement,
    },
    errorElement?: HTMLElement | null
    errorPatternText?: string
}