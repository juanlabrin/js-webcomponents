const template = document.createElement('template');
template.innerHTML = `
    <style>
    .w-100{
        width: 100%;
    }
    .text-center{
        text-align: center;
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
    .icon{
        height: 16px;
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
        this.$delIcon = `<img class="icon" src="./svg/trash-solid.svg" />`;
    }

    _drawTable() {

        this.$dynamicTable.innerHTML = '';
        this.$data = JSON.parse(this.data);
        var cols = Object.keys(this.$data[0]);

        this.$data.forEach((element, key) => {

            var row = this.$dynamicTable.insertRow(key);
            cols.forEach((name, key, cols) => {
                row.insertCell(key).innerHTML = element[name];
                if (Object.is(cols.length - 1, key)) {
                    row.insertCell(key + 1).outerHTML = `<td class="text-center"><a href="${element._id}/edit">${this.$editIcon}</a><a class="delete" href="${element._id}/delete">${this.$delIcon}</a></td>`;
                }
            });

        });

        var head = this.$dynamicTable.createTHead().insertRow(0);
        cols.forEach((name, key, cols) => {
            head.insertCell(key).outerHTML = '<th>' + name.toUpperCase() + '</th>';
            if (Object.is(cols.length - 1, key)) {
                head.insertCell(key + 1).outerHTML = '<th class="text-center">ACTION</th>';
            }
        });

        this.$deleteLinks = this.$dynamicTable.querySelectorAll('.delete');
        this.$deleteLinks.forEach(element => {
            element.addEventListener('click', item => {
                item.preventDefault();
                this._removeRow(element.getAttribute('href'));
            });
        });

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
        var head = this.$dynamicTable.createTHead().insertRow(0);
        head.insertCell(0).outerHTML = '<th>_ID</th>';
        head.insertCell(1).outerHTML = '<th>PRODUCT</th>';
        head.insertCell(2).outerHTML = '<th>PRICE</th>';
        head.insertCell(3).outerHTML = '<th>QTY</th>';
        head.insertCell(4).outerHTML = '<th>TOTAL</th>';
        head.insertCell(5).outerHTML = '<th>ACTION</th>';

    }

    connectedCallback() {
        console.log(this._componentName + ' connected!');
        // this.$addRowButton.addEventListener('click', this._removeRow.bind(this));
        this._drawInitialSchema();
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