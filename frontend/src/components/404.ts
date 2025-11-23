export class NotFoundError {
    constructor(historyBackLink: string | null) {
        if (historyBackLink) {
            const historyBackElement: HTMLElement | null = document.getElementById('history-back');
            if (historyBackElement) {
                historyBackElement.style.display = 'block';
                (historyBackElement.children[0] as HTMLLinkElement).href = historyBackLink;
            }
        }
    }
}