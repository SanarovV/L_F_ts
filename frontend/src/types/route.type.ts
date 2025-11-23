export type RouteType = {
    route: string,
    title?: string,
    filePathTemplate?: string,
    useLayout: string | null,
    includes?: string[],
    load(): void,
    styles?: string[],
    scripts?: string[],
    unload?(): void,
}