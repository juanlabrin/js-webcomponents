const ddtTemplate = document.createElement('template');
ddtTemplate.innerHTML = `
<style>
/* Import libraries or define custom styles */
/* @import "/css/bootstrap.min.css"; */
/* @import "/css/all.css"; */

table { 
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    border: 1px solid #DDD;
}
thead tr {
    border-bottom: 1px solid rgb(224,224,224);
}
th, td {
    text-align: left;
    padding: 6px;
}
tr:nth-child(even) {
    background-color: rgb(224,224,224);
}
.d-none {
    display: none;
}
.alert {
    padding: 15px;
    background-color: #f44336;
    color: white;
    opacity: 0.8;
    transition: opacity 0.6s;
    margin-bottom: 15px;
    border-radius: 7px;
}  
.alert-success {background-color: #04AA6D;}
.alert-info {background-color: #2196F3;}
.alert-warning {background-color: #ff9800;}
.alert-danger {background-color: #f44336;}
.closebtn {
    margin-left: 15px;
    color: white;
    font-weight: bold;
    float: right;
    line-height: 20px;
    cursor: pointer;
    transition: 0.3s;
}
.closebtn:hover {
    color: black;
}
.sort-arrow {
    display: block;
    margin: 0 !important;
    padding: 0 !important;
    text-decoration: none;
    font-size: 12px;
    color: #000000;
    opacity: 0.2;
}
.sort-arrow:hover {
    opacity: 1;
    transition: opacity 0.5s;
}
.sort-arrow-active {
    opacity: 1;
}
.btn {
    border: none;
    padding: 5px;
    color: #FFFFFF;
    opacity: 0.8;
    cursor: pointer;
}
.btn:hover {
    opacity: 1;
    transition: opacity 0.5s;
}
.btn-info {
    background-color: #2196F3;
}
.btn-edit {
    background-color: #04AA6D;;
}
</style>
<div class="alert d-none">
    <span class="closebtn">&times;</span>
    <span id="alert-content"></span>
</div>
<table class="table table-sm table-striped w-100"></table>
`;

class DynamicDataTable extends HTMLElement {
    /**
     * TODO
     * 1. Hidden ID column - Done
     * 2. Add sort button on each column - Done
     * 3. Add search input box
     * 4. Pagination
     * 5. Image Column
     */
    constructor() {
        super();
        this._componentName = 'Dynamic Data Table 2.0';
        this._componentAuthor = 'Codigo Web SpA';
        this._componentVersion = '2.0.1';
        this._componentUrl = 'https://codigoweb.cl/web-components/dynamic-data-table';

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(ddtTemplate.content.cloneNode(true));

        this.$dynamicTable = this._shadowRoot.querySelector('table');
        this.$messageBox = this._shadowRoot.querySelector('.alert');
        this.$messageBoxContent = this._shadowRoot.querySelector('#alert-content');
        this.$messageBoxBtnClose = this._shadowRoot.querySelector('.closebtn');

        this.$messageBoxBtnClose.addEventListener('click', this._messageBoxClose.bind(this));

        this.$data = null;
        this.$columns = [];
        this.$showId = true;
        this.$route = 'default';        
    }

    _detObjectType(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }

    _sortData(type, column, data) {
        if (type === 'asc') {
            data.sort((a, b) => a[column] > b[column]);
        } else {
            data.sort((a, b) => a[column] < b[column]);
        }
        this._drawTable(data);
    }

    _actionButtons(id) {
        let actionButtons = document.createElement('div');

        let btnEdit = document.createElement('button');
        btnEdit.classList.add('btn', 'btn-edit');
        btnEdit.setAttribute('value', `${this.$route}/${id}/edit`);
        btnEdit.textContent = 'Edit';
        btnEdit.addEventListener('click', function (e) { window.location = this.value; });

        let btnInfo = document.createElement('button');
        btnInfo.classList.add('btn', 'btn-info');
        btnInfo.setAttribute('value', `${this.$route}/${id}/info`);
        btnInfo.textContent = 'Info';
        btnInfo.addEventListener('click', function (e) { window.location = this.value; });

        actionButtons.appendChild(btnEdit);
        actionButtons.appendChild(btnInfo);

        return actionButtons;
    }

    _columnHead(name, id) {
        // Up arrow &#9650;
        // Down arrow &#9660;
        // let tHead = document.createElement('th');
        let thContent = document.createElement('div');
        let columnName = document.createElement('div');

        let sortButtons = document.createElement('div');
        let btnSortAsc = document.createElement('a');
        let btnSortDesc = document.createElement('a');

        thContent.style.display = 'flex';
        columnName.style.padding = '5px';
        columnName.style.fontWeight = 'bold';
        sortButtons.style.position = 'relative';

        btnSortAsc.style.position = 'relative';
        btnSortAsc.style.top = '2px';

        btnSortDesc.style.position = 'relative';
        btnSortDesc.style.bottom = '2px';

        btnSortAsc.classList.add('sort-arrow');
        btnSortDesc.classList.add('sort-arrow');

        columnName.textContent = name.toUpperCase();

        btnSortAsc.rel = id;
        btnSortDesc.rel = id;

        btnSortAsc.href = '#';
        btnSortDesc.href = '#';

        btnSortAsc.innerHTML = '&#9650;';
        btnSortDesc.innerHTML = '&#9660;';

        btnSortAsc.addEventListener('click', (e) => {            
            e.preventDefault();            
            let sortId = (this._detObjectType(this.$data[0]) === 'array') ? id : this.$columns[id];
            this._sortData('asc', sortId, this.$data);
        });

        btnSortDesc.addEventListener('click', (e) => {
            e.preventDefault();
            let sortId = (this._detObjectType(this.$data[0]) === 'array') ? id : this.$columns[id];
            this._sortData('desc', sortId, this.$data);
        });

        sortButtons.appendChild(btnSortAsc);
        sortButtons.appendChild(btnSortDesc);

        thContent.appendChild(columnName);
        thContent.appendChild(sortButtons);
        // tHead.appendChild(thContent);

        return thContent;

    }

    _messageBoxClose() {
        this.$messageBox.style.opacity = '0';
        setTimeout(() => { 
            this.$messageBox.style.display = 'none'; 
            this.$messageBoxContent.innerHTML = '';
        }, 600);
    }

    _autoClose() {
        setTimeout(() => {
            this.$messageBox.style.opacity = '0';
            setTimeout(() => { 
                this.$messageBox.style.display = 'none'; 
                this.$messageBoxContent.innerHTML = '';
            }, 600);            
        }, 5000);
    }

    _drawTable(data) {
        // console.log(sortedColumn);
        this.$dynamicTable.innerHTML = '';

        for (const key in data) {
            let row = this.$dynamicTable.insertRow(key);
            if (this._detObjectType(data[key]) === 'array') {
                for (const k in this.$columns) {
                    // console.log(data[key][k]);
                    row.insertCell(k).innerHTML = data[key][k];
                }
                // row.insertCell().innerHTML = `<button>${data[key][0]}</button>`;
                row.insertCell().appendChild(this._actionButtons(data[key][0]));
            }
            if (this._detObjectType(data[key]) === 'object') {
                for (const k in this.$columns) {
                    // console.log(data[key][this.$columns[k]]);
                    row.insertCell(k).innerHTML = data[key][this.$columns[k]];
                }
                // row.insertCell().innerHTML = `<button>${data[key][this.$columns[0]]}</button>`;
                row.insertCell().appendChild(this._actionButtons(data[key][this.$columns[0]]));
            }
        }

        const head = this.$dynamicTable.createTHead().insertRow(0);

        this.$columns.forEach((column, i) => {
            // head.insertCell(i).outerHTML = '<th>' + column.toUpperCase() + '<a href="#">&#x21D5;</a></th>';
            head.insertCell(i).appendChild(this._columnHead(column, i));
        });

        head.insertCell(this.$columns.length).outerHTML = '<th>ACTIONS</th>';

        if (!this.$showId) {
            for (let i = 0; i < this.$dynamicTable.rows.length; i++) {
                this.$dynamicTable.rows[i].cells[0].classList.add('d-none');
            }
        }

    }

    _loadData(url) {
        /**
         * JSON format: { success: boolean, data: array, message: string }
         */
        fetch(url)
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then(json => {

                if (json.success === undefined) {
                    console.error('Incorrect JSON format.');
                    return;
                }

                if (json.success) {
                    this.$data = json.data;
                    this._drawTable(this.$data);
                    this.$messageBoxContent.innerHTML = `<span><b>Success!</b></span> ${json.message}`;
                    this.$messageBox.classList.add('alert-success');
                    this.$messageBox.classList.remove('d-none');
                    this._autoClose();
                } else {
                    console.error('Request fail.');
                    this.$messageBoxContent.innerHTML = `<span><b>Danger!</b></span> ${json.message}`;
                    this.$messageBox.classList.add('alert-danger');
                    this.$messageBox.classList.remove('d-none');
                    this._autoClose();
                }

            });
    }

    static get observedAttributes() {
        return ['route', 'data-url', 'columns', 'show-id'];
    }

    get showId() {
        return this.getAttribute('show-id');
    }

    set showId(newShowId) {
        this.setAttribute('show-id', newShowId);
    }

    get dataUrl() {
        return this.getAttribute('data-url');
    }

    set dataUrl(newDataUrl) {
        this.setAttribute('data-url', newDataUrl);
    }

    get columns() {
        return this.getAttribute('columns');
    }

    set columns(newColumns) {
        this.setAttribute('columns', newColumns);
    }

    get route() {
        return this.getAttribute('route');
    }

    set route(newRoute) {
        this.setAttribute('route', newRoute);
    }

    connectedCallback() {
        // console.log(this._componentName + ' connected!');
        if (this.hasAttribute('data-url')) {
            this._loadData(this.dataUrl);
        }
        if (this.hasAttribute('columns')) {
            this.$columns = JSON.parse(this.columns);
        }
        if (this.hasAttribute('route')) {
            this.$route = this.route;
        }
        if (this.hasAttribute('show-id')) {
            this.$showId = (this.showId === 'true');
        }
    }

    disconnectedCallback() {
        // console.log(this._componentName + 'removed from page.');
    }

    adoptedCallback() {
        // console.log(this._componentName + 'moved to new page.');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // console.log(`Attribute: ${name} changed!`);
    }

    refresh() {
        console.log(this._componentName + ' refresh!');
        // this.$dynamicTable.innerHTML = '';
        this._loadData(this.dataUrl);
    }

}
customElements.define('dynamic-data-table', DynamicDataTable);