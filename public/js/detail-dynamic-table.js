const template = document.createElement('template');
template.innerHTML = `
    <style>
    .w-100{
        width: 100%;
    }
    .text-center{
        text-align: center;
    }
    .text-right{
        text-align: right;
    }
    .p-0{
        padding: 0;
    }
    table {
        border-collapse: collapse;
        border-spacing: 0;
        border: 1px solid #ddd;
        font-size: 1.25rem;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2
    }
    tr:hover {
        background-color: #ddd;
    }
    th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #4CAF50;
        color: white;
    }
    td>a{
        padding: 5px;
    }
    tfoot td, tfoot td input{
        text-align: right;
    }
    input[type=text], input[type=number], select, textarea{
        display: block;
        width: 100%;
        padding: .75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        resize: vertical;
        font-weight: 700;
    }
    input[readonly]{
        background-color: #d3d3d3;
    }
    .icon{
        height: 15px;
    }
    </style>
    <table class="w-100"></table>
    <!-- <button type="button">Add/Remove Row Test</button> -->
`;

class DetailDynamicTable extends HTMLElement {

    constructor() {
        super();
        this._componentName = 'Detail Dynamic Table';
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$dynamicTable = this._shadowRoot.querySelector('table');
        // this.$addRowButton = this._shadowRoot.querySelector('button');

        this.$editIcon = `<img class="icon" src="./svg/edit-solid.svg" />`;
        this.$delIcon = `<img class="icon" src="./svg/times-solid.svg" />`;

        this.$settings = [];
    }

    _drawTable() {

        this.$dynamicTable.innerHTML = '';
        this.$data = JSON.parse(this.data);
        var cols = Object.keys(this.$data[0]);
        var grossTotal = 0;

        this.$data.forEach((element, key) => {

            grossTotal += parseInt(element['total']);

            var row = this.$dynamicTable.insertRow(key);

            cols.forEach((name, key, cols) => {

                if (isNaN(element[name])){
                    row.insertCell(key).innerHTML = element[name];
                } else {
                    row.insertCell(key).outerHTML = '<td class="text-right">' + Intl.NumberFormat().format(element[name]) + '</td>';
                }                

                if (Object.is(cols.length - 1, key)) {
                    row.insertCell(key + 1).outerHTML = `<td class="text-center p-0"><a class="delete" href="${element._id}/delete">${this.$delIcon}</a></td>`;
                }

            });

        });

        var head = this.$dynamicTable.createTHead().insertRow(0);
        cols.forEach((name, key, cols) => {
            head.insertCell(key).outerHTML = '<th>' + name.toUpperCase() + '</th>';
            if (Object.is(cols.length - 1, key)) {
                head.insertCell(key + 1).outerHTML = '<th></th>';
            }
        });

        this.$deleteLinks = this.$dynamicTable.querySelectorAll('.delete');
        this.$deleteLinks.forEach(element => {
            element.addEventListener('click', item => {
                item.preventDefault();
                this._removeRow(element.getAttribute('href'));
            });
        });

        if (this.$settings.length > 0 && this.$settings[0].totals) {
            var footer = this.$dynamicTable.createTFoot();
            var footRow;
            footRow = footer.insertRow(0);
            footRow.insertCell(0).outerHTML = '<td colspan="4"><b>Gross Total</b></td>';
            footRow.insertCell(1).outerHTML = `<td colspan="2"><input type="text" id="gross-total" value="${Intl.NumberFormat().format(grossTotal)}" readonly /></td>`;

            footRow = footer.insertRow(1);
            footRow.insertCell(0).outerHTML = `<td colspan="4"><b>Tax(${this.$settings[0].tax}%)</b></td>`;
            footRow.insertCell(1).outerHTML = `<td colspan="2"><input type="text" id="tax" value="${Intl.NumberFormat().format(Math.ceil(grossTotal*(this.$settings[0].tax/100)))}" readonly></td>`;

            footRow = footer.insertRow(2);
            footRow.insertCell(0).outerHTML = '<td colspan="4"><b>Net Total</b></td>';
            footRow.insertCell(1).outerHTML = `<td colspan="2"><input type="text" id="net-total" value="${Intl.NumberFormat().format(Math.ceil(grossTotal + (grossTotal * (this.$settings[0].tax / 100))))}" readonly></td>`;
        }

    }

    _addNewRow() {
        // test data
        var data = {
            "_id": "PRO0005",
            "product": "item5",
            "price": "10000",
            "qty": "1",
            "total": "10000"
        }

        this.$data.push(data);
        this.data = JSON.stringify(this.$data);
    }

    _removeRow(value) {

        value = value.replace('/delete', '');

        var object = JSON.parse(this.data);
        var index = object.findIndex(x => x._id === value);

        object.splice(index, 1);

        if (object.length == 0) {

            this.data = [];
            this._drawInitialSchema();
            
        } else {      

            this.data = JSON.stringify(object);

        }


    }

    _drawInitialSchema() {

        this.$dynamicTable.innerHTML = '';

        //set row
        var row = this.$dynamicTable.insertRow(0);
        row.insertCell(0).outerHTML = '<td colspan="6">Not data loaded!</td>';

        // set header
        if (this.$settings.length > 0 && this.$settings[0].header){
            console.log(this.$settings[0].header);
            var head = this.$dynamicTable.createTHead().insertRow(0);
            head.insertCell(0).outerHTML = '<th>_ID</th>';
            head.insertCell(1).outerHTML = '<th>PRODUCT</th>';
            head.insertCell(2).outerHTML = '<th>PRICE</th>';
            head.insertCell(3).outerHTML = '<th>QTY</th>';
            head.insertCell(4).outerHTML = '<th>TOTAL</th>';
            head.insertCell(5).outerHTML = '<th>ACTION</th>';
        }

        // ser footer
        if (this.$settings.length > 0 && this.$settings[0].totals) {
        var footer = this.$dynamicTable.createTFoot();
        var footRow;
        footRow = footer.insertRow(0);
        footRow.insertCell(0).outerHTML = '<td colspan="4"><b>Gross Total</b></td>';
        footRow.insertCell(1).outerHTML = '<td colspan="2"><input type="text" id="gross-total" value="0.00" readonly /></td>';

        footRow = footer.insertRow(1);
        footRow.insertCell(0).outerHTML = '<td colspan="4"><b>Tax(%)</b></td>';
        footRow.insertCell(1).outerHTML = '<td colspan="2"><input type="text" id="tax" value="0.00" readonly></td>';

        footRow = footer.insertRow(2);
        footRow.insertCell(0).outerHTML = '<td colspan="4"><b>Net Total</b></td>';
        footRow.insertCell(1).outerHTML = '<td colspan="2"><input type="text" id="net-total" value="0.00" readonly></td>';  
        }      

    }

    connectedCallback() {
        console.log(this._componentName + ' connected!');
        // this.$addRowButton.addEventListener('click', this._removeRow.bind(this));
        if(this.hasAttribute('settings')){
            this.$settings = JSON.parse(this.getAttribute('settings'));
        }

        if(this.hasAttribute('data')){
            if (this.data.length > 0) {
                this._drawTable();
            }
        } else {
            this.data = [];
            this._drawInitialSchema();
        }

        console.log(this.$settings);
        
    }

    get data() {
        return this.getAttribute('data');
    }

    set data(newData) {
        this.setAttribute('data', newData);
    }

    static get observedAttributes() {
        return ['data'];
    }

    attributeChangedCallback(name) {

        console.log(`Attribute: ${name} changed!`);
        // console.log(this.data.length);
        if (this.data.length > 0) {
            this._drawTable();
        }

    }

}

customElements.define('detail-dynamic-table', DetailDynamicTable);