"use strict";
const template = document.createElement('template');
template.innerHTML = `
<table></table>
`;
class DynamicDataTable extends HTMLElement {
    constructor(){
        super();

        this._componentName = "Dynamic Data Table";
        this._componentVersion = "1.0.23";
        this._componentAuthor = "Codigoweb Solutions";
        this._componentUrl = "https://codigoweb.cl/webcomponents/dynamic-data-table/";

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    async _getData(url){
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    async loadData(url){
        let result = await this._getData(url);
        console.log(result);
    }

    get dataSource() {
        return this.getAttribute('data-source');
    }

    set dataSource(url) {
        this.setAttribute('data-source', url);
    }

    connectedCallback(){
        console.log(`${this._componentName} - ${this._componentVersion} connected!`);
        if(this.hasAttribute('data-source')){
            this.loadData(this.dataSource);
        }
    }
}

customElements.define('dynamic-data-table', DynamicDataTable);