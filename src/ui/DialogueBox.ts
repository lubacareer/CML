import type { DialogueDisplayContent } from '../systems/DialogueSystem';

export class DialogueBox {
    private readonly root: HTMLElement;
    private readonly speakerElement: HTMLElement;
    private readonly lineElement: HTMLElement;
    private readonly progressElement: HTMLElement;
    private content?: DialogueDisplayContent;
    private lineIndex = 0;

    constructor(parent: HTMLElement) {
        this.root = document.createElement('section');
        this.root.className = 'dialogue-box';
        this.root.setAttribute('data-testid', 'dialogue-box');
        this.root.setAttribute('aria-live', 'polite');
        this.root.hidden = true;

        this.speakerElement = document.createElement('div');
        this.speakerElement.className = 'dialogue-box__speaker';

        this.lineElement = document.createElement('p');
        this.lineElement.className = 'dialogue-box__line';

        this.progressElement = document.createElement('div');
        this.progressElement.className = 'dialogue-box__progress';

        this.root.append(this.speakerElement, this.lineElement, this.progressElement);
        this.root.addEventListener('click', this.handleClick);
        document.addEventListener('keydown', this.handleKeyDown);
        parent.append(this.root);
    }

    show(content: DialogueDisplayContent) {
        this.content = content;
        this.lineIndex = 0;
        this.root.hidden = false;
        this.render();
    }

    advance() {
        if (!this.content || this.root.hidden) {
            return;
        }

        if (this.lineIndex < this.content.lines.length - 1) {
            this.lineIndex += 1;
            this.render();
            return;
        }

        this.close();
    }

    close() {
        this.root.hidden = true;
    }

    isOpen() {
        return !this.root.hidden;
    }

    destroy() {
        this.root.removeEventListener('click', this.handleClick);
        document.removeEventListener('keydown', this.handleKeyDown);
        this.root.remove();
    }

    private render() {
        if (!this.content) {
            return;
        }

        this.speakerElement.textContent = this.content.speaker;
        this.lineElement.textContent = this.content.lines[this.lineIndex] ?? '';
        this.progressElement.textContent = `${this.lineIndex + 1}/${this.content.lines.length}`;
    }

    private handleClick = () => {
        this.advance();
    };

    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            this.close();
            return;
        }

        if (event.code === 'Space' && this.isOpen()) {
            event.preventDefault();
            this.advance();
        }
    };
}
