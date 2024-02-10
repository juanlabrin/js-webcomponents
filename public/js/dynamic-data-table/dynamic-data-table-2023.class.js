const template = document.createElement('template');
template.innerHTML = `
<style>
/* @import "/css/ddt-styles.css"; */
@import "/css/bootstrap.min.css";
* { font-size: 12px; }
@media (min-width: 380px) {
    .ddt-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-top: 0.25rem;
        padding-bottom: 1rem;
        gap: 1rem;
    }
    .rows-per-page {
        width: 100px;
    }
    .search-box {
        width: 200px;
    }
}
@media (min-width: 767px) {
    .rows-per-page {
        width: auto;
    }
    .search-box {
        width: auto;
    }
}
</style>
<div class="ddt-wrap">
    <div class="ddt-header">
        <div class="rows-per-page input-group d-none">
            <span class="input-group-text">Rows</span>
            <select class="form-control" dir="rtl">
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>
        <div class="search-box"></div>
    </div>
    <div class="table-responsive">
        <table class="table table-sm table-striped"></table>
    </div>    
</div>
`;
class DynamicDataTable extends HTMLElement {
    constructor() {
        super();

        this._componentName = "Dynamic Data Table";
        this._componentVersion = "1.0.23";
        this._componentAuthor = "CodigoWeb Solutions";
        this._componentUrl = "https://codigoweb.cl/webcomponents/dynamic-data-table/1.0.23/";

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$rowsPerPageBox = this._shadowRoot.querySelector('.rows-per-page');
        this.$setRowsPerPage = this._shadowRoot.querySelector('.rows-per-page select');
        this.$searchBox = this._shadowRoot.querySelector('.search-box');
        this.$dynamicTable = this._shadowRoot.querySelector('table');

        this.$setRowsPerPage.addEventListener('change', this._setRowsPerPage.bind(this));

        this.$data;
        this.$columns = [];
        this.$defColumns = [];

        this.$showId = false;
        this.$showCaption = false;
        this.$tableCaption;

        this.$showPagination = false;
        this.$rowsPerPage = 10;

        this.$showSorting = false;
        this.$sortByColumn = 0;
        this.$sortType = 'asc';

        this.$showSearching = false;
        this.$searchQuery = '';
    }

    setOptions(options) {
        if (options) {
            Object.keys(options).forEach(o => {
                this['$' + o] = options[o];
            });
        }
    }

    refresh() {
        this._loadData(this.dataSource);
    }

    _setRowsPerPage(e) {
        this.$rowsPerPage = parseInt(e.target.value);
        this.refresh();
    }

    _sortData(type, column, data) {
        if (type === 'asc') {
            if (typeof data[0][column] === 'number') {
                data.sort((a, b) => a[column] - b[column]);
            } else {
                data.sort((a, b) => a[column].localeCompare(b[column]));
            }
            this.$sortType = "desc";
        }
        if (type === 'desc') {
            if (typeof data[0][column] === 'number') {
                data.sort((a, b) => b[column] - a[column]);
            } else {
                data.sort((a, b) => b[column].localeCompare(a[column]));
            }
            this.$sortType = "asc";
        }
        return data;
    }

    _searchData(query) {
        //- let result = this.$data.filter((row) => row.description.match(new RegExp(query)));
        //- console.log(query, this.$data);
        let result = this.$data.filter((row) => Object.keys(row).some(key => row[key].toString().toLowerCase().includes(query.toString().toLowerCase())));
        return result;
    }

    _drawPagination(currentPage) {

        let tFoot = this.$dynamicTable.createTFoot().insertRow(0);
        let pages = Math.ceil(this.$data.length / this.$rowsPerPage);
        let pagesContainer = document.createElement('div');

        let pagesPerPage = 10;
        let limitPage = currentPage + pagesPerPage;

        if ((currentPage + pagesPerPage) >= pages) {
            // console.table([{ "currentPage": currentPage, "limitPage": limitPage, "rowsPerPage": this.$rowsPerPage, "pages": pages, "dataLength": this.$data.length }]);

            let i = ((pages - pagesPerPage) < 0) ? 0 : (pages - pagesPerPage);

            for (i; i < pages; i++) {

                let pageLink = document.createElement('button');

                pageLink.id = i;
                pageLink.textContent = i + 1;
                pageLink.classList.add('btn', 'btn-sm', 'btn-primary');

                if (i === currentPage) {
                    pageLink.classList.add('active');
                }

                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this._drawTable(parseInt(pageLink.id));
                });

                pagesContainer.appendChild(pageLink);

            }

        } else {

            for (let i = 0; i < pages; i++) {
                if (i >= currentPage && i < limitPage) {

                    let pageLink = document.createElement('button');

                    pageLink.id = i;
                    pageLink.textContent = i + 1;
                    pageLink.classList.add('btn', 'btn-sm', 'btn-primary');

                    if (i === currentPage) {
                        pageLink.classList.add('active');
                    }

                    if (i === limitPage - 1 && limitPage < pages) {
                        pageLink.textContent = '...';
                    }

                    pageLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this._drawTable(parseInt(pageLink.id));
                    });

                    pagesContainer.appendChild(pageLink);
                }
            }
        }

        if (currentPage > 0 && pages >= limitPage) {
            //- console.log(currentPage, pages, limitPage);
            let prevPage = document.createElement('button');
            prevPage.innerHTML = '&#10094;';
            prevPage.id = currentPage - 1;
            prevPage.classList.add('btn', 'btn-sm', 'btn-secondary');
            prevPage.addEventListener('click', (e) => {
                e.preventDefault();
                this._drawTable(parseInt(prevPage.id));
            });
            pagesContainer.prepend(prevPage);
        }

        if (currentPage < (pages - 1) && pages > limitPage) {
            let nextPage = document.createElement('button');
            nextPage.innerHTML = '&#10095;';
            nextPage.id = currentPage + 1;
            nextPage.classList.add('btn', 'btn-sm', 'btn-secondary');
            nextPage.addEventListener('click', (e) => {
                e.preventDefault();
                this._drawTable(parseInt(nextPage.id));
            });
            pagesContainer.append(nextPage);
        }

        if (this.$columns.length > 0) {
            tFoot.insertCell().colSpan = this.$columns.length;
        } else {
            tFoot.insertCell().colSpan = this.$data[0].length;
        }

        pagesContainer.id = "pages-container";
        pagesContainer.style.display = 'flex';
        pagesContainer.style.flexDirection = 'row';
        pagesContainer.style.justifyContent = 'center';
        pagesContainer.style.gap = '0.25rem';
        pagesContainer.style.paddingTop = '1rem';
        pagesContainer.style.paddingBottom = '1rem';

        tFoot.cells[0].appendChild(pagesContainer);
    }

    _drawSortingIcons(tHead) {
        if (tHead.childNodes.length > 0) {
            tHead.childNodes.forEach((object, index) => {

                let icon = document.createElement('i');
                // icon.innerHTML = '&#x21c5;';
                icon.innerHTML = '&#x296E;';
                icon.style.opacity = '0.5';
                icon.style.cursor = 'pointer';
                icon.style.marginLeft = '5px';

                if (index === this.$sortByColumn) {
                    icon.style.opacity = '1';
                }

                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    // console.log(index);
                    this.$sortByColumn = index;
                    this._drawTable()
                });

                object.appendChild(icon);
            });
        }
    }

    _drawSorting(tHead) {
        if (tHead.childNodes.length > 0) {

            tHead.childNodes.forEach((object, index) => {

                let thContent = document.createElement('div');
                let columnName = document.createElement('div');

                let sortBtn = document.createElement('button');
                let iconAsc = document.createElement('span');
                let iconDesc = document.createElement('span');

                iconAsc.innerHTML = '&#8639;';
                iconDesc.innerHTML = '&#8642;';

                iconAsc.classList.add('sort-btn-icon');
                iconDesc.classList.add('sort-btn-icon');

                if (index == this.$sortByColumn) {
                    if (this.$sortType === 'asc') {
                        iconAsc.classList.add('active');
                    }
                    if (this.$sortType === 'desc') {
                        iconDesc.classList.add('active');
                    }
                }

                sortBtn.appendChild(iconAsc);
                sortBtn.appendChild(iconDesc);

                columnName.textContent = object.textContent;

                object.innerHTML = '';

                columnName.classList.add('column-name');

                sortBtn.id = index;
                sortBtn.classList.add('sort-btn');

                if (index == this.$sortByColumn) {
                    sortBtn.classList.add('sorted');
                    sortBtn.classList.add(this.$sortType);
                }

                sortBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (sortBtn.classList.contains('sorted') && sortBtn.classList.contains('asc')) {
                        this.$sortType = 'desc';
                    } else {
                        this.$sortType = 'asc';
                    }
                    this.$sortByColumn = sortBtn.id;
                    this._drawTable()
                });

                thContent.appendChild(columnName);
                thContent.appendChild(sortBtn);
                thContent.classList.add('sorting');
                object.appendChild(thContent);

            });

        }
    }

    _drawSearching() {
        // console.log('Show searching');
        this.$searchBox.innerHTML = '';
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
            console.log(inputQuery.value);
            this.$data = this._searchData(inputQuery.value);
            this._drawTable();
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
            this.refresh();
        });

        searchBox.appendChild(inputQuery);
        searchBox.appendChild(btnSearch);
        searchBox.appendChild(btnRefresh);
        this.$searchBox.appendChild(searchBox);
    }

    _drawTable(page = 0) {

        if(this.$defColumns.length > 0){
            for (const col of this.$defColumns){
                console.log(col.data);
            }
        }

        if (this.$columns.length == 0) {
            for (const key in this.$data[0]) {
                this.$columns.push(key);
            }
        }

        if (this.$showSearching) {
            this._drawSearching();
        }

        //- TODO: Fix bug with colums less than 3
        if (this.$showSorting) {
            this.$data = this._sortData(this.$sortType, this.$columns[this.$sortByColumn], this.$data);
        }

        if (this.$showPagination) {
            this.$rowsPerPageBox.classList.remove('d-none');
            this.$dynamicTable.innerHTML = '';
            let startIndex = page * this.$rowsPerPage;
            let limitIndex = startIndex + this.$rowsPerPage;

            for (startIndex; startIndex <= limitIndex - 1; startIndex++) {

                if (startIndex >= this.$data.length) {
                    break;
                }

                let row = this.$dynamicTable.insertRow();

                if (this.$columns.length > 0) {
                    for (const column of this.$columns) {
                        row.insertCell().textContent = this.$data[startIndex][column];
                    }
                } else {
                    for (const key in this.$data[startIndex]) {
                        row.insertCell().textContent = this.$data[startIndex][key];
                    }
                }
            }

        } else {

            this.$dynamicTable.innerHTML = '';

            for (const index in this.$data) {
                let row = this.$dynamicTable.insertRow(index);
                if (this.$columns.length > 0) {
                    for (const column of this.$columns) {
                        row.insertCell().textContent = this.$data[index][column];
                    }
                } else {
                    for (const key in this.$data[index]) {
                        row.insertCell().textContent = this.$data[index][key];
                    }
                }
            }

        }

        const tHead = this.$dynamicTable.createTHead().insertRow(0);

        if (this.$columns.length > 0) {
            for (const column of this.$columns) {
                tHead.insertCell().outerHTML = `<th>${column.toUpperCase()}</th>`;
            }
        } else {
            for (const key in this.$data[0]) {
                tHead.insertCell().outerHTML = `<th>${key.toUpperCase()}</th>`;
            }
        }

        if (!this.$showId) {
            for (let i = 0; i < this.$dynamicTable.rows.length; i++) {
                this.$dynamicTable.rows[i].cells[0].style.display = 'none';
            }
        }

        if (this.$tableCaption != undefined && this.$showCaption) {
            let caption = document.createElement('caption');
            caption.textContent = this.$tableCaption.toUpperCase();
            this.$dynamicTable.appendChild(caption);
        }

        if (this.$showPagination) {
            this._drawPagination(page);
        }

        if (this.$showSorting) {
            // this._drawSorting(tHead);
            this._drawSortingIcons(tHead);
        }
    }

    async _getData(url) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    async _loadData(url) {
        let result = await this._getData(url);
        if (Object.keys(result).length > 1) {
            if (result.success == true) {
                this.$data = result[Object.keys(result)[1]];
                this.$tableCaption = Object.keys(result)[1];
                this._drawTable();
            } else {
                this.$dynamicTable.insertRow().insertCell().textContent = 'Not data loaded!';
            }
        } else if (result[Object.keys(result)[0]].length > 0) {
            this.$data = result[Object.keys(result)[0]];
            this.$tableCaption = Object.keys(result)[0];
            this._drawTable();
        } else {
            this.$dynamicTable.insertRow().insertCell().textContent = 'Not data loaded!';
        }
    }

    get dataSource() {
        return this.getAttribute('data-source');
    }

    set dataSource(url) {
        this.setAttribute('data-source', url);
    }

    get settings() {
        return this.getAttribute('settings');
    }

    set settings(args) {
        this.setAttribute('settings', args);
    }

    static get observedAttributes() {
        return ['data-source', 'settings'];
    }

    connectedCallback() {
        console.log(`${this._componentName} - ${this._componentVersion} connected!`);
        // if (this.hasAttribute('data-source')) {
        //     this._loadData(this.dataSource);
        // }
        // if (this.hasAttribute('settings')) {
        //     this.setOptions(JSON.parse(this.settings));
        // }
    }

    attributeChangedCallback(name) {
        if (name === 'data-source') {
            this._loadData(this.dataSource);
        }
        if (name === 'settings') {
            this.setOptions(JSON.parse(this.settings));
        }        
    }
}

customElements.define('dynamic-data-table', DynamicDataTable);