class BaseWebcomponent extends HTMLElement {
    constructor() {
        super();

        this.$textColor = "white";
        this.$backgroundColor = "red"
        this.$padding = "10px";
    }

    _drawDiv() {
        let div = document.createElement('div');
        div.style.backgroundColor = this.$backgroundColor;
        div.style.color = this.$textColor;
        div.style.padding = this.$padding;
        div.textContent = "Base Webcomponent"
        this.appendChild(div);
    }

    _setOptions(options) {
        console.log(options);
        this.$backgroundColor = options.background;
        this.$textColor = options.color;
        this.$padding = options.padding;
    }

    get settings() {
        return this.getAttribute('settings');
    }

    set settings(options) {
        this.setAttribute('settings', options);
    }

    connectedCallback() {
        if (this.hasAttribute('settings')) {
            this._setOptions(JSON.parse(this.settings));
        }
        this._drawDiv();
    }
}

window.customElements.define('base-webcomponent', BaseWebcomponent);