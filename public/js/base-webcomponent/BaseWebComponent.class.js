class BaseWebComponent extends HTMLElement {

    #privateField;
    $publicField;

    constructor() {
        super();
        this.$publicField = 10;
    }

    #privateMethod(arg){
        console.log('Private Method ' + arg);
    }

    $publicMethod(arg){
        console.log('Public Method ' + arg);
    }

    connectedCallback() {
        console.log('Base WebComponent Connected!');
        this.#privateField = 11;
        this.#privateMethod(this.#privateField);
    }
}

window.customElements.define('base-web-component', BaseWebComponent);