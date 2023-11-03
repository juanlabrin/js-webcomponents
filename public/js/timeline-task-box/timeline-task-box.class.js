const template = document.createElement('template');
const divBox = document.createElement('div');
const tableTimeline = document.createElement('table');
divWrap.appendChild(tableTimeline);
template.appendChild(divBox);

class TimelineTaskBox extends HTMLElement {
    constructor() {
        super();
        // Set copyright info

        // Create and attach shadow root, append template content
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('timeline-task-box', TimelineTaskBox);