"use strict";
const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" href="./css/rte-styles.css" />
<div class="rte">
    <div class="rte-header"></div>
    <div class="rte-body"></div>
    <div class="rte-footer"></div>
</div>
`;
class RichTextEditor extends HTMLElement {

    constructor() {
        super();
        this._componentName = "Rich Text Editor";
        this._componentVersion = "1.0.1";
        this._componentAuthor = "CodigoWeb Solutions";
        this._componentUrl = "https://codigoweb.cl/webcomponents/rich-text-editor/1.0.1/";

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$rte = this._shadowRoot.querySelector('.rte');
        this.$rteHeader = this._shadowRoot.querySelector('.rte-header');
        this.$rteBody = this._shadowRoot.querySelector('.rte-body');
        this.$rteFooter = this._shadowRoot.querySelector('.rte-footer');

        this.$editorArea = document.createElement('div');
    }

    _drawTextEditorArea() {
        this.$editorArea.setAttribute('contentEditable', true);
        this.$editorArea.classList.add('rte-editor-area');
        this.$rteBody.appendChild(this.$editorArea);
    }

    _drawToolsMenu() {
        const rteMenu = document.createElement('div');

        // Header Select Tool
        const headersSelect = document.createElement('select');
        const optionSelect = document.createElement('option');

        optionSelect.value = 'p';
        optionSelect.textContent = 'Paragraph'
        headersSelect.appendChild(optionSelect);

        for (let i = 1; i < 7; i++) {
            let option = document.createElement('option');
            option.value = `h${i}`;
            option.textContent = `H${i}`;
            headersSelect.appendChild(option);
        }

        headersSelect.addEventListener('change', (e) => {

            if (headersSelect.value != '') {
                // const selection = window.getSelection();
                // const range = selection.getRangeAt(0);

                // console.log(range.toString());

                // if (hasHtmlTag(range.toString())) {
                //     console.log(range.toString());
                // }

                // const header = document.createElement(headersSelect.value);
                // range.surroundContents(header);
                document.execCommand('formatBlock', false, headersSelect.value);
            }
        });

        rteMenu.appendChild(headersSelect);
        this.$rteHeader.appendChild(rteMenu);
    }

    connectedCallback() {
        console.log(`${this._componentName} - ${this._componentVersion} connected!`);
        this._drawTextEditorArea();
        this._drawToolsMenu();
    }
}
customElements.define('rich-text-editor', RichTextEditor);