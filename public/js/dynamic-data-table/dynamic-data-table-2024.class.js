const template = document.createElement('template');
template.innerHTML = `
<style>
    @import "/css/bootstrap.min.css";
    *{ font-size: 12px; }
    table { width: 100%; }
    table th { text-align: center !important; }
</style>
<div class="ddt-wrap">
    <div class="dtt-header">DTT Header</div>
    <div class="dtt-body">
        <table class="dtt-table table table-sm table-striped"></table>
    </div>
    <div class="dtt-footer">DTT Footer</div>
</div>
`;
class DynamicDataTable extends HTMLElement {

    constructor() {
        super();

        this._componentName = "Dynamic Data Table";
        this._componentVersion = "1.0.24";
        this._componentAuthor = "CodigoWeb Solutions";
        this._componentUrl = "https://codigoweb.cl/webcomponents/dynamic-data-table/1.0.24/";

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        //- Dynamic Table Obj
        this.$dynamicTable = this._shadowRoot.querySelector('table');

        //- Attributes
        this.$columnsDef = [];
        this.$params;

        //- Variables
        this.$data;
        this.$tableCaption;

    }

    get settings() {
        return this.getAttribute('settings');
    }

    get columnsDef() {
        return this.getAttribute('columns-def');
    }

    get dataSource() {
        return this.getAttribute('data-source');
    }

    static get observedAttributes() {
        return ['columns-def', 'data-source']
    }

    async #_getData(url) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    #_actionsButtons(id){
        let actionButtons = document.createElement('div');
        actionButtons.classList.add('btn-group');
        actionButtons.setAttribute('role', 'group');

        //- Info Button
        let btnInfo = document.createElement('button');
        btnInfo.textContent = 'info';
        btnInfo.addEventListener('click', function (e) { console.log(id) });

        //- Edit Button
        let btnEdit = document.createElement('button');
        btnEdit.textContent = 'edit';
        btnEdit.addEventListener('click', function (e) { console.log(id) });

        //- Delete Button
        let btnDelete = document.createElement('button');
        btnDelete.textContent = 'Delete';
        btnDelete.addEventListener('click', function (e) { console.log(id) });

        actionButtons.appendChild(btnInfo);
        actionButtons.appendChild(btnEdit);
        actionButtons.appendChild(btnDelete);

        return actionButtons;
    }

    #_formatDate(date) {
        function addZero(int) {
            if (int < 10) {
                return '0' + int;
            } else {
                return int;
            }
        }
        let utcDate = `${date.getUTCFullYear()}-${addZero(parseInt(date.getUTCMonth() + 1))}-${addZero(parseInt(date.getUTCDate()))}`
        return utcDate;
    }

    #_formatType(type, value) {
        if (typeof value != type) {
            if (type === 'date') {
                value = new Date(value);
            }
            if (type === 'currency') {
                value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            }
            if (type === 'string') {
                value = value.toString();
            }
            if (type === 'number') {
                const num = +value;
                if (!isNaN(num) && isFinite(num)) {
                    value = num;
                }
            }
            // console.log(type, value);
        }
        return value;
    }

    #_formatData() {
        let formatedData = [];
        for (const row of this.$data) {
            let object = {};
            for (const colDef of this.$columnsDef) {
                object[colDef.data] = this.#_formatType(colDef.type, row[colDef.data]);
            }
            formatedData.push(object);
        }
        this.$data = formatedData;
    }

    #_drawTable() {

        if (this.$columnsDef.length > 0) {
            this.#_formatData();
        }

        console.log(this.$params);
        console.log(this.$data);

        // Clear Table Content
        this.$dynamicTable.innerHTML = '';
        // Draw Table Content
        for (const index in this.$data) {

            let row = this.$dynamicTable.insertRow(index);

            if (this.$columnsDef.length > 0) {
                for (const column of this.$columnsDef) {

                    let cell = row.insertCell();

                    if (column.type === 'date') {
                        cell.textContent = this.#_formatDate(this.$data[index][column.data]);
                    } else {
                        cell.textContent = this.$data[index][column.data];
                    }

                    if (column.type === 'currency') {
                        this.$dynamicTable.rows[row.rowIndex].cells[cell.cellIndex].style.textAlign = 'right';
                    } else {
                        this.$dynamicTable.rows[row.rowIndex].cells[cell.cellIndex].style.textAlign = 'center';
                    }

                    if (column.hasOwnProperty('render')) {
                        if (column.render.hasOwnProperty('show')) {
                            this.$dynamicTable.rows[row.rowIndex].cells[cell.cellIndex].style.display = 'none';
                        };
                    };

                }
            } else {
                for (const key in this.$data[index]) {
                    row.insertCell().textContent = this.$data[index][key];
                }
            }

            if(this.$params.hasOwnProperty('showActions')){
                if(this.$params.showActions){
                    row.insertCell().appendChild(this.#_actionsButtons(this.$data[index]['_id']));
                }
            }

        }

        // Add Columns Headers to Table
        const tHead = this.$dynamicTable.createTHead().insertRow(0);
        if (this.$columnsDef.length > 0) {
            for (const column of this.$columnsDef) {

                let cell = tHead.insertCell();

                if (column.hasOwnProperty('render')) {
                    if (column.render.hasOwnProperty('show')) {
                        cell.outerHTML = `<th style="display: none;">${column.name.toUpperCase()}</th>`;
                    };
                }

                cell.outerHTML = `<th>${column.name.toUpperCase()}</th>`;

            }
        } else {
            for (const key in this.$data[0]) {
                tHead.insertCell().outerHTML = `<th>${key.toUpperCase()}</th>`;
            }
        }

    }

    async #_loadData(url) {
        let result = await this.#_getData(url);
        if (Object.keys(result).length > 1) {
            if (result.success == true) {
                this.$data = result[Object.keys(result)[1]];
                this.$tableCaption = Object.keys(result)[1];
                this.#_drawTable();
            } else {
                this.$dynamicTable.insertRow().insertCell().textContent = 'Not data loaded!';
            }
        } else if (result[Object.keys(result)[0]].length > 0) {
            this.$data = result[Object.keys(result)[0]];
            this.$tableCaption = Object.keys(result)[0];
            this.#_drawTable();
        } else {
            this.$dynamicTable.insertRow().insertCell().textContent = 'Not data loaded!';
        }
    }

    connectedCallback() {
        //- console.log(`${this._componentName} - ${this._componentVersion} connected!`);
        if (this.hasAttribute('settings')) {
            this.$params = JSON.parse(this.settings);
        }
    }

    attributeChangedCallback(name) {
        //- console.log(`Attribute ${name} was changed!`);
        if (name === 'data-source') {
            this.#_loadData(this.dataSource);
        }
        if (name === 'columns-def') {
            ;
            this.$columnsDef = (JSON.parse(this.columnsDef));
        }
    }
}

customElements.define('dynamic-data-table', DynamicDataTable);