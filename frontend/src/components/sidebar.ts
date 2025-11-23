'use strict';
declare let bootstrap: any;

(() => {
    const tooltipTriggerList: Array<HTMLElement> = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
})();
