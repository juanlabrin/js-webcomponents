const template = document.createElement('template');
template.innerHTML = `
    <style>
    :host{
        font-family: 'Nunito', sans-serif;
    }
    button {
        color: white;
        padding: 12px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    .loader{
        border: 16px solid #f3f3f3;
        border-radius: 50%;
        border-top: 16px solid #3498db;
        width: 100px;
        height: 100px;
        -webkit-animation: spin 2s linear infinite; /* Safari */
        animation: spin 2s linear infinite;
    }
    .d-none{
        display: none;
    }
    .danger{
        background-color: #f44336;
        -webkit-transition: 0.3s; /* Safari prior 6.1 */
        transition: 0.3s;
    }
    .success{
        background-color: #4caf50;
        -webkit-transition: 2s; /* Safari prior 6.1 */
        transition: 2s;
    }
    .initial{
        background-color: #2196f3;
        -webkit-transition: 2s; /* Safari prior 6.1 */
        transition: 2s;
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
    <button type="button" class="initial">Load file/data</button>
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

    _setInitialButtonStatus(){
        setTimeout(() => {
            this.$loadButton.classList.remove('success');
            this.$loadButton.classList.remove('danger');
            this.$loadButton.classList.add('initial');
            this.$loadButton.textContent = 'Load file/data!';
        }, 5000);
    }
    _loadData(){
        this.$loadButton.classList.add('d-none');
        this.$loader.classList.remove('d-none');

        setTimeout(() => {
            fetch(this.url)
                .then(function (res) {
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error('Network response was not ok.');
                })
                .then(json => {
                    console.log(json);
                    this.$linkedTo.setAttribute('data', JSON.stringify(json));
                    this.$loader.classList.add('d-none');
                    this.$loadButton.classList.remove('d-none');
                    this.$loadButton.classList.remove('initial');
                    this.$loadButton.classList.add('success');
                    this.$loadButton.textContent = 'Data loaded!';
                    this._setInitialButtonStatus();
                })
                .catch(error => {
                    console.error(error);
                    this.$loader.classList.add('d-none');
                    this.$loadButton.classList.remove('d-none');
                    this.$loadButton.classList.remove('initial');
                    this.$loadButton.classList.add('danger');
                    this.$loadButton.textContent = 'Network Error!';
                    this._setInitialButtonStatus();
                });
        }, 1000);
        
    }

    connectedCallback() {
        console.log(this._componentName+' connected!');        
        this.$loadButton.addEventListener('click', this._loadData.bind(this));

        this.$linkedTo = document.querySelector(this.getAttribute('link'));
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
