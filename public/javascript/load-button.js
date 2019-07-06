const template = document.createElement('template');
template.innerHTML = `
    <style>
    button {
        width: 100%;
        background-color: #2196f3;
        color: white;
        padding: 12px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        float: right;
    }
    .loader{
        border: 16px solid #f3f3f3;
        border-radius: 50%;
        border-top: 16px solid #3498db;
        width: 120px;
        height: 120px;
        -webkit-animation: spin 2s linear infinite; /* Safari */
        animation: spin 2s linear infinite;
    }
    .d-none{
        display: none;
    }
    /* Safari */
    @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
    }
    @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
    }
    </style>
    <button type="button">Load file/data</button>
    <div class="loader d-none"></div>`;

class loadButton extends HTMLElement{

    constructor(){
        super();
        // Always call super first in constructor
        this._componentName = 'Load Button';
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$loadButton = this._shadowRoot.querySelector('button');
        this.$loader = this._shadowRoot.querySelector('.loader');

    }

    static get observedAttributes(){
        return ['url'];
    }

    get url(){
        return this.getAttribute('url');
    }

    set url(newUrl){
        this.setAttribute('url', newUrl);
    }

    _loadData(){
        this.$loadButton.classList.add('d-none');
        this.$loader.classList.remove('d-none');

        fetch(this.url)
        .then(res=>{
            return res.json();
        })
        .then(json=>{
            console.log(json);
            this.$loader.classList.add('d-none');
            this.$loadButton.classList.remove('d-none');
        }).catch(function(err){
            console.error(err);
        });
    }

    connectedCallback() {
        console.log(this._componentName+' connected!');
        // console.log('Url: ' + this.url);
        this.$loadButton.addEventListener('click', this._loadData.bind(this));
    }

    disconnectedCallback() {
        console.log('disconnected!');
    }

    attributeChangedCallback(name) {
        console.log(`Attribute: ${name} changed!`);
    }

    adoptedCallback() {
        console.log('adopted!');
    }
    
}

window.customElements.define('load-button', loadButton);
