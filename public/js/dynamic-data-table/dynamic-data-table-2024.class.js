const template = document.createElement('template');
template.innerHTML = `
<style>
    @import "/css/bootstrap.min.css";
    @import "/fonts/bootstrap-icons.min.css";
    * { font-size: 12px; }
    table { width: 100%; }
    table th { text-align: center !important; }
    .sort-active { opacity: 0.5; }
    .sort-active:hover { opacity: 1; }
    .header-wrap, .pages-wrap { display: flex; flex-direction: row; align-items: center; }
    .header-wrap { margin-bottom: 1.25rem; gap: 1rem; }
    .header-search, .pages-info { flex: 1 1 0px; }
    .rows-option-group { flex: 0 1 20%; }
    .pages-container { display: flex; gap: 0.15rem; justify-content: end; flex: 1 1 0px; }
</style>
<div class="ddt-wrap">
    <div class="dtt-header">
        <div class="header-wrap"></div>
    </div>
    <div class="dtt-body">
        <table class="dtt-table table table-sm table-striped"></table>
    </div>
    <div class="dtt-footer"></div>
</div>
`;
class DynamicDataTable extends HTMLElement {

    //- Private Attibutes
    #dynamicTable;
    #header;
    #footer;
    #data;
    #tableCaption;
    #sortType = 1;

    #actualPage = 1;
    #pagesPerPage = 5;
    #pageInit;
    #pageLimit;

    #rowsPerPage = 10;
    #rowInit = 0;
    #rowLimit;

    //- Public Attributes
    $columnsDef = [];
    $params;

    constructor() {
        super();

        this._componentName = "Dynamic Data Table";
        this._componentVersion = "1.0.24";
        this._componentAuthor = "CodigoWeb Solutions";
        this._componentUrl = "https://codigoweb.cl/webcomponents/dynamic-data-table/1.0.24/";

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        //- Component Objects
        this.#dynamicTable = this._shadowRoot.querySelector('table');
        this.#header = this._shadowRoot.querySelector('.dtt-header');
        this.#footer = this._shadowRoot.querySelector('.dtt-footer');

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

    $_refresh() {
        this.#_loadData(this.dataSource);
    }

    #_searchData(query) {
        function notNUll(value){
            //- console.log(value);
            if(value && value !== null){
                return value.toString().toLowerCase().includes(query.toString().toLowerCase());
            }
        }
        return this.#data.filter((row) => Object.keys(row).some((key) => notNUll(row[key])));
    }

    #_sortData(type, column) {
        if (type == 1) {
            if (typeof this.#data[0][column] === 'number') {
                this.#data.sort((a, b) => {
                    if(a[column] === null && b[column] === null) return 0;
                    if(a[column] === null) return 1;
                    if(b[column] === null) return -1;
                    return a[column] - b[column];
                });
            } else {
                this.#data.sort((a, b) => {
                    if(a[column] === null && b[column] === null) return 0;
                    if(a[column] === null) return 1;
                    if(b[column] === null) return -1;
                    return a[column].localeCompare(b[column]);
                });
            }
            this.#sortType = -1;
        }

        if (type == -1) {
            if (typeof this.#data[0][column] === 'number') {
                this.#data.sort((a, b) => {
                    if(a[column] === null && b[column] === null) return 0;
                    if(b[column] === null) return 1;
                    if(a[column] === null) return -1;
                    return b[column] - a[column];
                });
            } else {
                this.#data.sort((a, b) => {
                    if(a[column] === null && b[column] === null) return 0;
                    if(b[column] === null) return 1;
                    if(a[column] === null) return -1;
                    return b[column].localeCompare(a[column]);
                });
            }
            this.#sortType = 1;
        }
    }

    #_sortButton(column) {
        let active = (this.$columnsDef.length > 0) ? this.$columnsDef[this.$params.sortByColumn].data : '_id';
        let i = document.createElement('i');

        (column === active) ? i.classList.add('bi', 'bi-arrow-down-up', 'sort-active') : i.classList.add('bi', 'bi-arrow-down-up');
        i.style.marginLeft = '3px';
        i.style.cursor = 'pointer';

        i.addEventListener('click', () => {
            //- TODO Fix When Columnsdef is zero
            this.$params.sortByColumn = this.$columnsDef.findIndex(element => element.data === column);
            this.#_sortData(this.#sortType, this.$columnsDef[this.$params.sortByColumn].data);
            this.#_drawTable();
        });

        return i;
    }

    #_actionsButtons(id) {
        let actionButtons = document.createElement('div');
        actionButtons.classList.add('btn-group', 'float-end');
        actionButtons.setAttribute('role', 'group');

        //- Info Button
        let btnInfo = document.createElement('button');
        btnInfo.classList.add('btn', 'btn-sm', 'btn-primary');
        btnInfo.innerHTML = '<i class="bi bi-info-square"></i>';
        btnInfo.addEventListener('click', (e) => { 
            //- console.log(id);
            window.location = `${this.$params.btnActionUrl}${id}/info`;
        });

        //- Edit Button
        let btnEdit = document.createElement('button');
        btnEdit.classList.add('btn', 'btn-sm', 'btn-success');
        btnEdit.innerHTML = '<i class="bi bi-pencil-square"></i>';
        btnEdit.addEventListener('click', (e) => {
            //- TODO Dynamic message
            if (window.confirm('Do you really want to EDIT this row?')) {
                //- console.log(id);
                window.location = `${this.$params.btnActionUrl}${id}/edit`;
            }
        });

        //- Delete Button
        let btnDelete = document.createElement('button');
        btnDelete.classList.add('btn', 'btn-sm', 'btn-danger');
        btnDelete.innerHTML = '<i class="bi bi-x-circle"></i>';
        btnDelete.addEventListener('click', (e) => {
            //- TODO Dynamic message
            if (window.confirm('Do you really want to DELETE this row?')) {
                //- console.log(id);
                window.location = `${this.$params.btnActionUrl}${id}/delete`;
            }
        });

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
        //- console.log(type, value);
        if (value == null){
            return value;
        }
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
        }
        return value;
    }

    #_formatData() {
        let formatedData = [];
        for (const row of this.#data) {
            let object = {};
            for (const colDef of this.$columnsDef) {
                object[colDef.data] = this.#_formatType(colDef.type, row[colDef.data]);
            }
            formatedData.push(object);
        }
        return formatedData;
    }

    #_drawSearching() {
        //- console.log('Show searching');
        //- this.$searchBox.innerHTML = '';
        let searchBox = document.createElement('div');
        let inputQuery = document.createElement('input');
        let btnSearch = document.createElement('button');
        let btnRefresh = document.createElement('button');

        searchBox.classList.add('input-group');
        inputQuery.classList.add('form-control');

        btnSearch.classList.add('btn', 'btn-primary');
        btnSearch.textContent = 'Search';

        btnSearch.addEventListener('click', (e) => {
            e.preventDefault(e);

            if (inputQuery.value === '') {
                alert('Please fill the search input.');
                inputQuery.focus();
                return;
            }

            let result = this.#_searchData(inputQuery.value);

            console.log(inputQuery.value, result);
            this.#data = result;
            this.#_drawTable();
        });

        btnRefresh.classList.add('btn', 'btn-secondary');
        btnRefresh.innerHTML = '&#10227;';
        btnRefresh.style.paddingLeft = '0.55rem';
        btnRefresh.style.paddingRight = '0.55rem';
        btnRefresh.style.paddingTop = '0';
        btnRefresh.style.paddingBottom = '0';
        btnRefresh.style.fontWeight = '500';
        btnRefresh.style.fontSize = '1.75rem';
        btnRefresh.style.lineHeight = '0';

        btnRefresh.addEventListener('click', (e) => {
            e.preventDefault(e);
            this.$_refresh();
        });

        searchBox.appendChild(inputQuery);
        searchBox.appendChild(btnSearch);
        searchBox.appendChild(btnRefresh);
        this.#header.querySelector('.header-wrap').appendChild(searchBox);
    }

    #_drawTable() {

        let tableData = this.#data;
        this.#rowLimit = this.#data.length - 1;

        if (this.$columnsDef.length > 0) {
            tableData = this.#_formatData();
        }

        // Clear Table Content
        this.#dynamicTable.innerHTML = '';

        if (this.$params != undefined && this.$params.hasOwnProperty('showPagination')) {
            if (this.$params.showPagination) {
                this.#_drawPagination();
            }
        }

        if (this.$params != undefined && this.$params.hasOwnProperty('showSearching')) {
            if (this.$params.showSearching){
                this.#_drawSearching();
            }
        }

        // Draw Table Content
        for (let index = this.#rowInit; index <= this.#rowLimit; index++) {

            let row = this.#dynamicTable.insertRow();

            if (this.$columnsDef.length > 0) {
                for (const column of this.$columnsDef) {

                    let cell = row.insertCell();

                    if (column.type === 'date') {
                        cell.textContent = this.#_formatDate(tableData[index][column.data]);
                    } else {
                        cell.textContent = tableData[index][column.data];
                    }

                    if (column.type === 'currency') {
                        this.#dynamicTable.rows[row.rowIndex].cells[cell.cellIndex].style.textAlign = 'right';
                    } else {
                        this.#dynamicTable.rows[row.rowIndex].cells[cell.cellIndex].style.textAlign = 'center';
                    }

                    if (column.hasOwnProperty('render')) {
                        if (column.render.hasOwnProperty('show')) {
                            this.#dynamicTable.rows[row.rowIndex].cells[cell.cellIndex].style.display = 'none';
                        };
                    };

                }
            } else {
                for (const key in tableData[index]) {
                    row.insertCell().textContent = tableData[index][key];
                }
            }

            if (this.$params != undefined && this.$params.hasOwnProperty('showActions')) {
                if (this.$params.showActions) {
                    row.insertCell().appendChild(this.#_actionsButtons(tableData[index]['_id']));
                }
            }
        }

        // Add Columns Headers to Table
        const trHead = this.#dynamicTable.createTHead().insertRow(0);

        if (this.$columnsDef.length > 0) {
            for (const column of this.$columnsDef) {
                let th = document.createElement('th');
                th.textContent = column.name.toUpperCase();
                if (column.hasOwnProperty('render')) {
                    if (column.render.hasOwnProperty('show')) {
                        th.classList.add('d-none');
                    }
                }
                if (this.$params.hasOwnProperty('showSorting')) {
                    if (this.$params.showSorting) {
                        let sortIcon = this.#_sortButton(column.data);
                        th.appendChild(sortIcon);
                    }
                }
                trHead.appendChild(th);
            }
            if (this.$params.hasOwnProperty('showActions')) {
                if (this.$params.showActions) {
                    let th = document.createElement('th');
                    trHead.appendChild(th);
                }
            }
        } else {
            for (const key in tableData[0]) {
                let th = document.createElement('th');
                th.textContent = key.toUpperCase();
                if (this.$params != undefined && this.$params.hasOwnProperty('showSorting')) {
                    if (this.$params.showSorting) {
                        let sortIcon = this.#_sortButton(key);
                        th.appendChild(sortIcon);
                    }
                }
                trHead.appendChild(th);
            }
        }

    }

    #_drawPagination() {
        this.#footer.innerHTML = '';
        let pagesWrap = document.createElement('div');

        let pagesInfo = document.createElement('div');
        let pagesContainer = document.createElement('div');

        let pages = (this.#data.length >= this.#rowsPerPage) ? Math.ceil(this.#data.length / this.#rowsPerPage) : 1;
        (this.#actualPage < 1) ? this.#actualPage = 1 : (this.#actualPage > pages) ? pages : this.#actualPage;

        this.#pageInit = (pages <= this.#pagesPerPage) ? 1 : (this.#actualPage <= Math.floor(this.#pagesPerPage / 2)) ? 1 : ((this.#actualPage + (Math.ceil(this.#pagesPerPage / 2) - 1)) >= pages) ? pages - this.#pagesPerPage + 1 : this.#actualPage - Math.floor(this.#pagesPerPage / 2);

        this.#pageLimit = (pages <= this.#pagesPerPage) ? pages : (this.#actualPage <= Math.floor(this.#pagesPerPage / 2)) ? this.#pagesPerPage : ((this.#actualPage + (Math.ceil(this.#pagesPerPage / 2) - 1)) >= pages) ? pages : this.#actualPage + (Math.ceil(this.#pagesPerPage / 2) - 1);

        let drawPages = Array.from(Array((this.#pageLimit + 1) - this.#pageInit).keys()).map(i => this.#pageInit + i);

        this.#rowInit = (this.#actualPage == 1) ? 0 : (this.#actualPage * this.#rowsPerPage) - this.#rowsPerPage;

        if(pages > 1){
            this.#rowLimit = (this.#actualPage == 1) ? this.#rowsPerPage - 1 : (((this.#actualPage * this.#rowsPerPage) - 1) >= this.#data.length) ? this.#data.length - 1 : ((this.#actualPage * this.#rowsPerPage) - 1);
        }
        
        for (const page of drawPages) {
            let btn = document.createElement('button');
            btn.classList.add('btn', 'btn-sm');
            (this.#actualPage == page) ? btn.classList.add('btn-secondary') : btn.classList.add('btn-primary');
            btn.textContent = page;
            btn.addEventListener('click', (e) => {
                this.#actualPage = page;
                this.#_drawTable();
            });

            pagesContainer.appendChild(btn);
        }

        //- Next button
        if (drawPages[this.#pagesPerPage - 1] < pages) {
            let btn = document.createElement('button');
            btn.classList.add('btn', 'btn-sm', 'btn-light');
            btn.textContent = ">>";
            btn.addEventListener('click', (e) => {
                this.#actualPage = this.#actualPage + 1;
                this.#_drawTable();
            });
            pagesContainer.append(btn);
        }

        //- Prev button
        if (this.#actualPage > 1) {
            let btn = document.createElement('button');
            btn.classList.add('btn', 'btn-sm', 'btn-light');
            btn.textContent = "<<";
            btn.addEventListener('click', (e) => {
                this.#actualPage = this.#actualPage - 1;
                this.#_drawTable();
            });
            pagesContainer.prepend(btn);
        }

        pagesInfo.innerHTML = `<span>Total registros: ${this.#data.length} - Total paginas: ${pages}`;

        pagesInfo.classList.add('pages-info');
        pagesContainer.classList.add('pages-container');
        pagesWrap.classList.add('pages-wrap');

        pagesWrap.appendChild(pagesInfo);
        pagesWrap.appendChild(pagesContainer);

        this.#footer.appendChild(pagesWrap);

        //- Add Select Pages Per Row Element        
        let headerWrap = this.#header.querySelector('.header-wrap');
        headerWrap.innerHTML = '';

        let rowsOptionGroup = document.createElement('div');
        let rowsOptionText = document.createElement('div');
        let pagesPerRowEl = document.createElement('select');
        let rowsOpions = [10, 15, 30, 50, 100];

        for (const rows of rowsOpions) {
            let option = document.createElement('option');
            option.value = rows;
            option.textContent = rows;
            if (rows == this.#rowsPerPage) {
                option.selected = true;
            }
            pagesPerRowEl.appendChild(option);
        }
        pagesPerRowEl.addEventListener('change', () => {
            //- console.log(pagesPerRowEl.value);
            this.#rowsPerPage = parseInt(pagesPerRowEl.value);
            this.#_drawTable();
        });

        pagesPerRowEl.dir = 'rtl';
        pagesPerRowEl.classList.add('form-control');
        pagesPerRowEl.style.width = 'auto';
        rowsOptionText.textContent = "Registros por página";
        rowsOptionText.classList.add('input-group-text');
        rowsOptionGroup.classList.add('input-group', 'rows-option-group');

        rowsOptionGroup.appendChild(rowsOptionText);
        rowsOptionGroup.appendChild(pagesPerRowEl);
        headerWrap.appendChild(rowsOptionGroup);

    }

    async #_loadData(url) {
        let result = await this.#_getData(url);

        //- console.log(result);

        if (Object.keys(result).length > 1) {

            if (result.success == true) {
                this.#data = result[Object.keys(result)[1]];
                this.#tableCaption = Object.keys(result)[1];

                if (this.$params != undefined && (this.$params.hasOwnProperty('showSorting') || this.$params.hasOwnProperty('sortByColumn'))) {
                    if (this.$columnsDef.length > 0) {
                        this.#_sortData(this.#sortType, this.$columnsDef[this.$params.sortByColumn].data);
                    }
                }

                this.#_drawTable();

            } else {
                this.#dynamicTable.insertRow().insertCell().textContent = 'Not data loaded!';
            }

        } else if (result[Object.keys(result)[0]].length > 0) {

            this.#data = result[Object.keys(result)[0]];
            this.#tableCaption = Object.keys(result)[0];

            if (this.$params != undefined && (this.$params.hasOwnProperty('showSorting') || this.$params.hasOwnProperty('sortByColumn'))) {
                if (this.$columnsDef.length > 0) {
                    this.#_sortData(this.#sortType, this.$columnsDef[this.$params.sortByColumn].data);
                } else {
                    //- console.log(this.$columnsDef, Object.keys(this.#data[0]));
                    for(const col of Object.keys(this.#data[0])){
                        this.$columnsDef.push({
                            data: col,
                            type: (isNaN(this.#data[0][col])) ? 'string' : 'number', //- Determine data type
                            name: col
                        });
                    }
                    this.#_sortData(this.#sortType, this.$columnsDef[0].data);
                    //- console.log(this.$columnsDef);
                }
            }

            this.#_drawTable();

        } else {

            this.#dynamicTable.insertRow().insertCell().textContent = 'Not data loaded!';

        }
    }

    connectedCallback() {
        console.log('Component Connected!');
        if (this.hasAttribute('settings')) {
            this.$params = JSON.parse(this.settings);
        }
    }

    attributeChangedCallback(name) {
        console.log('Component Attribute Changed!');
        if (name === 'data-source') {
            this.#_loadData(this.dataSource);
        }
        if (name === 'columns-def') {
            this.$columnsDef = (JSON.parse(this.columnsDef));
        }
    }
}

customElements.define('dynamic-data-table', DynamicDataTable);