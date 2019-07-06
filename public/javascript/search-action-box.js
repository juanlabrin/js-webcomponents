const template = document.createElement('template');
template.innerHTML = `
<style>

    :host{
        display: block;
        font-family: sans-serif;
        font-size: 12px;
    }

    input[type=text], input[type=number], select, textarea{
        display: block;
        width: 100%;
        padding: .75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        resize: vertical;
    }

    button {
        width: 100%;
        background-color: #4CAF50;
        color: white;
        padding: 12px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        float: right;
    }

    .card{
        width: 100%;
        border-radius: 0.25rem;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s;
    }

    .card:hover {
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    }

    .card-header {
        padding: 2px 16px;
        background-color: #EEEEEE;
        border-bottom: 1px solid #CCCCCC;
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
    }

    .card-header h3 {
        font-size: 1.25rem;
    }

    .card-body {
        display: grid;
        grid-gap: 0.75rem;
        padding: 0.75rem;
    }

    .item-1 {
        grid-column: 1 / span 2;
        grid-row: 1;
    }
    .item-2 {
        grid-column: 3 / span 2;
        grid-row: 1;
    }
    .item-3 {
        grid-column: 1 / span 4;
        grid-row: 2;
    }
    .item-4 {
        grid-row: 3;
    }
    .item-5 {
        grid-row: 3;
    }
    .item-6 {
        grid-row: 3;
    }
    .item-7 {
        grid-row: 3;
    }

    .input-group{
        display: flex;
    }

    .input-group>span{
        padding: 0.75rem;
        background-color: #CCCCCC;
        background-color: #e9ecef;
        border: 1px solid #ced4da;
        border-radius: .25rem;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .input-group>input[type=number]{
        max-width: 100px;
        border-right: none;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .input-barcode{
        background-color: #f0f8ff;
    }

    .input-autocomplete{
        background-color: #ffffe0;
    }

    .input-display{
        background-color: #d3d3d3;
    }

    .info{
        max-width: 100%;
        border-radius: 0.45rem;
        padding: 0.75rem;        
    }

    .info.info-success{
        background-color: #4caf506b;
        border: 1px solid #CCCCCC;
    }

    .info.info-danger{
        background-color: #f4433673;
        border: 1px solid #f44336;
    }

    .d-none{
        display: none;
    }
    
</style>
<div class="card">
    <div class="card-header">
        <h3>Search / Action Box</h3>
    </div>
    <div class="card-body">
           
        <div class="item-1"><input type="text" class="input-barcode" id="barcode-search" placeholder="Barcode Search" /></div>            
        <div class="item-2">
            <input type="text" class="input-autocomplete" id="autocomplete-search" list="products-list" placeholder="Autocomplete Search" />
            <datalist id="products-list"></datalist>
        </div>
        <div class="item-3"><div class="info d-none">Dynamic Message...</div></div>
        <div class="item-4"><input class="input-display" type="text" id="product-display" placeholder="Product Display" readonly /></div>
        <div class="item-5">
            <div class="input-group">
                <input type="number" id="product-value" min="1" value="1" /><span>Value</span>
            </div>
        </div>
        <div class="item-6">
            <div class="input-group">
                <input type="number" id="product-qty" min="1" value="1" /><span>Qty</span></div>
            </div>
        <div class="item-7"><button id="btn-addto">Add to Order</button></div>

    </div>
</div>
`;

class SearchActionBox extends HTMLElement {

    constructor() {
        // Always call super first in constructor
        super();
        this._componentName = 'Search Action Box';
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        // Declare objects inside Components
        this.$inputBarcodeSearch = this._shadowRoot.getElementById('barcode-search');
        this.$inputAutocompleteSearch = this._shadowRoot.getElementById('autocomplete-search');
        this.$productsDataList = this._shadowRoot.getElementById('products-list');
        this.$inputProductDisplay = this._shadowRoot.getElementById('product-display');

        this.$messageDisplay = this._shadowRoot.querySelector('.info');

        this.$inputProductValue = this._shadowRoot.getElementById('product-value');
        this.$inputProductQty = this._shadowRoot.getElementById('product-qty');

        this.$buttonAddTo = this._shadowRoot.getElementById('btn-addto');

        this.$inputBarcodeSearch.addEventListener('keyup', this._barcodeSearch.bind(this));
        this.$inputAutocompleteSearch.addEventListener('keyup', this._autocompleteSearch.bind(this));
        this.$inputAutocompleteSearch.addEventListener('change', this._termSearch.bind(this));

        this.$buttonAddTo.addEventListener('click', this._addTo.bind(this));

    }

    _message(message, type, display = false){

        if(display){
            this.$messageDisplay.classList = '';
            this.$messageDisplay.classList.add('info');
            this.$messageDisplay.classList.add(type);
            this.$messageDisplay.innerHTML = message;
        } else {
            this.$messageDisplay.classList = '';
            this.$messageDisplay.classList.add('info');
            this.$messageDisplay.classList.add('d-none');
            this.$messageDisplay.innerHTML = '';
        }

    }

    _ajax(code, type){

        let productDisplay = this.$inputProductDisplay;
        let productValue = this.$inputProductValue;
        let productQty = this.$inputProductQty;
        let messageDisplay = (message, type, display) => this._message(message, type, display);

        fetch('/' + code + '/' + type)
            .then(function (res) {
                return res.json();
            })
            .then(function (json) {
                if (json.success) {
                    messageDisplay(null, null, false);
                    productDisplay.value = json.product.name;
                    productValue.value = json.product.price;
                } else {
                    let message = 'Barcode: ' + code + ', Not found! Please try again...';
                    messageDisplay(message, 'info-danger', true);
                    productDisplay.value = '';
                    productValue.value = 1;
                    productQty.value = 1;
                }
                // console.log(JSON.stringify(json));
            }).catch(function(error){
                console.error(error);
            });

    }

    _barcodeSearch(e){
        if(this.$inputBarcodeSearch.value.length > 0){
            if(e.keyCode === 13){
                // Implement AJAX Call
                let barcode = this.$inputBarcodeSearch.value;
                let type = 'barcode-search';
                this._ajax(barcode, type);
                this.$inputBarcodeSearch.value = '';
            }
        }
    }

    _autocompleteSearch(e){
        if(this.$inputAutocompleteSearch.value.length > 2){
            let term = this.$inputAutocompleteSearch.value;
            let productsList = this.$productsDataList;
            // Implement AJAX Call
            fetch('/'+term+'/term-search')
                .then(function(res){
                    return res.json();
                })
                .then(function(json){
                    productsList.innerHTML = '';
                    json.forEach(element => {
                        let option = document.createElement('option');
                        option.value = element.value;
                        option.text = element.label;
                        productsList.appendChild(option);
                    });
                });
        }
    }

    _termSearch(e){

        let code = this.$inputAutocompleteSearch.value;
        let type = 'barcode-search';

        this._ajax(code, type);

        this.$inputAutocompleteSearch.value = '';
        this.$productsDataList.innerHTML = '';

    }

    _addTo(e){
        e.preventDefault();
        if (this.$inputProductDisplay.value.length > 0){
            //Implement Add to Order
            alert(this.$inputProductDisplay.value + ' - ' + this.$inputProductValue.value + ' - ' + this.$inputProductQty.value);
            this.$inputProductDisplay.value = '';
            this.$inputProductValue.value = 1;
            this.$inputProductQty.value = 1;
        } else {
            this._message('You must does a search!', 'info-success', true);
        }        
    }

    connectedCallback(){
        console.log(this._componentName+' connected!');
    }

    disconnectedCallback(){
        console.log('disconnected!');
    }

    attributeChangedCallback(){
        console.log(`Attribute: ${name} changed!`);
    }

    adoptedCallback(){
        console.log('adopted!');
    }
}

customElements.define('search-action-box', SearchActionBox);