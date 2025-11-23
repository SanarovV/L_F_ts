import {MainPage} from "./components/main-page";
import {Balance} from "./components/balance/balance";
import {Login} from "./components/auth/login";
import {SignUp} from "./components/auth/sign-up";
import {Categories} from "./components/categories/categories";
import {NotFoundError} from "./components/404";
import {OperationCreate} from "./components/balance/operation";
import {OperationEdit} from "./components/balance/operation";
import {Category} from "./components/categories/category";
import {Logout} from "./components/auth/logout";
import {AuthUtils} from "./utils/auth-utils";
import {BalanceService} from "./services/balance-service";
import {RouteType} from "./types/route.type";
import {UserInfoType} from "./types/user-info.type";
import {AuthInfoType} from "./types/auth-info.type";

export class Router {
    private profileNameElement: HTMLElement | null;
    readonly titlePageElement: HTMLElement | null;
    readonly contentPageElement: HTMLElement | null;
    private historyBackLink: string | null;
    private userName: string | null;
    readonly routes: RouteType[];

    constructor() {
        this.profileNameElement = null;
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.historyBackLink = null;
        this.userName = null;
        this.initEvents();
        this.routes = [
            {
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/pages/main.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new MainPage();
                },
                styles: [],
                scripts: ['chart.umd.js'],
                unload: () => {
                }
            },
            {
                route: '/login',
                title: 'Вход',
                filePathTemplate: '/templates/pages/auth/login.html',
                useLayout: null,
                load: () => {
                    new Login(this.openNewRoute.bind(this));
                },
                styles: [],
                scripts: [],
                unload: () => {
                }
            },
            {
                route: '/logout',
                useLayout: null,
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                },
                unload: () => {
                    this.userName = null;
                }
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/pages/auth/sign-up.html',
                useLayout: null,
                load: () => {
                    new SignUp(this.openNewRoute.bind(this));
                },
                styles: [],
                scripts: [],
                unload: () => {
                }
            },
            {
                route: '/404',
                title: '404',
                filePathTemplate: '/templates/pages/404.html',
                useLayout: null,
                load: () => {
                    new NotFoundError(this.historyBackLink);
                },
            },
            {
                route: '/balance',
                title: 'Баланс',
                filePathTemplate: '/templates/pages/balance/balance.html',
                useLayout: '/templates/layout.html',
                includes: ['/templates/includes/delete-modal.html'],
                load: () => {
                    new Balance();
                },
                styles: [],
                scripts: [],
                unload: () => {
                    this.removeIncludes();
                }
            },
            {
                route: '/categories/income',
                title: 'Категории доходов',
                filePathTemplate: '/templates/pages/categories/categories-list.html',
                useLayout: '/templates/layout.html',
                includes: ['/templates/includes/delete-modal.html'],
                load: () => {
                    new Categories('income');
                },
                styles: [],
                scripts: [],
                unload: () => {
                    this.removeIncludes();
                }
            },
            {
                route: '/categories/expense',
                title: 'Категории расходов',
                filePathTemplate: '/templates/pages/categories/categories-list.html',
                useLayout: '/templates/layout.html',
                includes: ['/templates/includes/delete-modal.html'],
                load: () => {
                    new Categories('expense');
                },
                styles: [],
                scripts: [],
                unload: () => {
                    this.removeIncludes();
                }
            },
            {
                route: '/categories/income/edit',
                title: 'Редактирование категории',
                filePathTemplate: '/templates/pages/categories/category.html',
                useLayout: '/templates/layout.html',
                includes: [],
                load: () => {
                    new Category(this.openNewRoute.bind(this), 'income', 'edit');
                },
                styles: [],
                scripts: [],
                unload: () => {
                }
            },
            {
                route: '/categories/income/create',
                title: 'Создание категории',
                filePathTemplate: '/templates/pages/categories/category.html',
                useLayout: '/templates/layout.html',
                includes: [],
                load: () => {
                    new Category(this.openNewRoute.bind(this), 'income', 'create');
                },
                styles: [],
                scripts: [],
                unload: () => {
                }
            },
            {
                route: '/categories/expense/edit',
                title: 'Редактирование категории',
                filePathTemplate: '/templates/pages/categories/category.html',
                useLayout: '/templates/layout.html',
                includes: [],
                load: () => {
                    new Category(this.openNewRoute.bind(this), 'expense', 'edit');
                },
                styles: [],
                scripts: [],
                unload: () => {
                }
            },
            {
                route: '/categories/expense/create',
                title: 'Создание категории',
                filePathTemplate: '/templates/pages/categories/category.html',
                useLayout: '/templates/layout.html',
                includes: [],
                load: () => {
                    new Category(this.openNewRoute.bind(this), 'expense', 'create');
                },
                styles: [],
                scripts: [],
                unload: () => {
                }
            },
            {
                route: '/balance/create',
                title: 'Создать операцию',
                filePathTemplate: '/templates/pages/balance/operation.html',
                useLayout: '/templates/layout.html',
                includes: [],
                load: () => {
                    new OperationCreate(this.openNewRoute.bind(this));
                },
                styles: [],
                scripts: [],
                unload: () => {
                }
            },
            {
                route: '/balance/edit',
                title: 'Редактировать операцию',
                filePathTemplate: '/templates/pages/balance/operation.html',
                useLayout: '/templates/layout.html',
                includes: [],
                load: () => {
                    new OperationEdit(this.openNewRoute.bind(this));
                },
                styles: [],
                scripts: [],
                unload: () => {
                }
            },
        ]
        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) && window.location.pathname !== '/sign-up') {
            if (this.routes) {
                this.openNewRoute('/login').then();
            } else {
                this.openNewRoute('/404').then();
            }
        }
    }

    private removeIncludes(): void {
        const includesElement: HTMLElement | null = document.getElementById('includes');
        includesElement ? includesElement.remove() : null;
    }

    private initEvents(): void {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this));
    }

    public async openNewRoute(url: string): Promise<void> {
        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) && url !== '/sign-up') {
            if (this.routes) {
                url = '/login';
            } else {
                url = '/404';
            }
        }
        const currentRoute: string = window.location.pathname;
        history.pushState(null, '', url);
        await this.activateRoute(null, currentRoute);
    };

    private async clickHandler(e: MouseEvent): Promise<void> {
        let element: HTMLElement | null = null;
        if (((e as MouseEvent).target as Element).nodeName === 'A') {
            element = e.target as HTMLLinkElement;
        } else if ((((e as MouseEvent).target as Element).parentNode as Element).nodeName === 'A') {
            element = (e.target as Element).parentNode as HTMLLinkElement;
        } else if (((((e as MouseEvent).target as Element).parentNode as Element).parentNode as Element).nodeName === 'A') {
            element = (((e as MouseEvent).target as Element).parentNode as Element).parentNode as HTMLLinkElement;
        }
        if (element) {
            e.preventDefault();
            const currentRoute = window.location.pathname;
            const url = (element as HTMLLinkElement).href.replace(window.location.origin, '');
            if (!url || (currentRoute === url.replace('#', '')) || url.startsWith('javascript:void(0)')) {
                return;
            }
            await this.openNewRoute(url);
        }
    };

    private async activateRoute(e: Event | null, oldRoute: string | null = null): Promise<void> {
        if (oldRoute) {
            const currentRoute: RouteType | undefined = this.routes.find(item => item.route === oldRoute);
            this.historyBackLink = oldRoute;
            if (currentRoute) {
                if (currentRoute.styles && currentRoute.styles.length > 0) {
                    currentRoute.styles.forEach(style => {
                        const styleElements = document.querySelector(`link[href='/css/${style}']`);
                        styleElements ? styleElements.remove() : null;
                    });
                }
                if (currentRoute.scripts && currentRoute.scripts.length > 0) {
                    currentRoute.scripts.forEach(script => {
                        const scriptElements = document.querySelector(`script[src='/js/${script}']`);
                        scriptElements ? scriptElements.remove() : null;
                    });
                }
                if (currentRoute.unload && typeof currentRoute.unload === 'function') {
                    currentRoute.unload();
                }
            }
        }
        const urlRoute: string = window.location.pathname;
        const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute);
        if (newRoute) {
            let contentBlock: HTMLElement | null = this.contentPageElement;
            if (newRoute.includes && newRoute.includes.length > 0) {
                const includesDiv: HTMLElement = document.createElement('div');
                includesDiv.id = 'includes';
                document.body.append(includesDiv);
                newRoute.includes.forEach(include => {
                    this.loadIncludes(include, includesDiv);
                });
            }
            if (newRoute.filePathTemplate && contentBlock) {
                if (newRoute.useLayout) {
                    contentBlock.innerHTML = await fetch(newRoute.useLayout).then(res => res.text());
                    contentBlock = document.getElementById('content-layout');
                    this.activateMenuItem(window.location.pathname);
                    this.profileNameElement = document.getElementById('profile-name');
                    if (!this.userName) {
                        let userInfo = AuthUtils.getAuthInfo(AuthUtils.userInfoTokenKey);
                        if (userInfo) {
                            const parsedUserInfo: UserInfoType = JSON.parse(userInfo as string);
                            if (parsedUserInfo.name) {
                                this.userName = `${parsedUserInfo.name} ${parsedUserInfo.lastName}`;
                            }
                        }
                    }
                    if (this.profileNameElement) {
                        this.profileNameElement.innerText = this.userName as string;
                    }
                    const balance = await BalanceService.getBalance();
                    const balanceElement: HTMLElement | null = document.getElementById('balance');
                    if (balance && balanceElement) {
                        balanceElement.innerText = `${parseInt(balance).toLocaleString()} $`;
                    }
                }
                contentBlock ? contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(res => res.text()) : null;
                document.body.removeAttribute('style');
            }
            if (newRoute.scripts && newRoute.scripts.length > 0) {
                for (const script of newRoute.scripts) {
                    await this.loadPageScript('/js/' + script);
                }
            }
            if (newRoute.title && this.titlePageElement) {
                this.titlePageElement.innerText = newRoute.title + ' | Lumincoin finance';
            }
            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }
        } else {
            console.log('Route not found');
            history.pushState(null, '', '/404');
            await this.activateRoute(null);
        }
    };

    private loadPageScript(src: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const script: HTMLScriptElement = document.createElement('script');
            script.src = src;
            script.onload = () => resolve('Script loaded: ' + src);
            script.onerror = () => reject(new Error('Script not loaded: ' + src));
            document.body.appendChild(script);
        });
    }

    private async loadIncludes(src: string, includesDiv: HTMLElement): Promise<void> {
        const srcHtml: string = await fetch(src).then(response => response.text());
        const srcNewDiv: HTMLElement = document.createElement('div');
        srcNewDiv.innerHTML = srcHtml;
        includesDiv.appendChild(srcNewDiv);
    };

    private activateMenuItem(route: string): void {
        const menuItem: NodeListOf<Element> = document.querySelectorAll('.sidebar .nav-link');
        menuItem.forEach((item: Element) => {
            const href = item.getAttribute('href');
            const cleanedHref: string | null = href ? href.replace(/\?.+/gm, '') : href;
            if (cleanedHref && route.includes(cleanedHref) && '/' !== cleanedHref || (route === '/' && cleanedHref === '/')) {
                item.classList.add('active');
            } else
                item.classList.remove('active');
        });
        const categoryButton: HTMLElement | null = document.getElementById('categories');
        const categoryListElement: HTMLElement | null = document.getElementById('category-collapse');
        if (categoryButton) {
            if (route.includes('categories')) {
                categoryButton.classList.add('active');
                categoryButton.classList.remove('collapsed');
                (categoryButton.parentElement as HTMLElement).classList.add('active');
                categoryButton.setAttribute('aria-expanded', 'true');
                categoryListElement ? categoryListElement.classList.add('show') : null;
            } else {
                categoryButton.classList.add('collapsed');
                (categoryButton.parentElement as HTMLElement).classList.remove('active');
                categoryButton.setAttribute('aria-expanded', 'false');
                categoryListElement ? categoryListElement.classList.remove('show') : null;
            }
        }
    }
}