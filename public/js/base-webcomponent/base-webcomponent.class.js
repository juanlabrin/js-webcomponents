class BaseWebcomponent extends HTMLElement {
    connectedCallback(){
        this.innerHTML = "Base Webcomponent";
    }
}

window.customElements.define('base-webcomponent', BaseWebcomponent);