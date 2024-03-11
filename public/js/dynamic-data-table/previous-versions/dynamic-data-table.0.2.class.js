const template = document.createElement('template');
template.innerHTML = `
<style>
/* Import libraries or define custom styles */
@import "/css/bootstrap.min.css";
@import "/css/all.css";
.tooltip-dtt {
    position: relative;
    display: inline-block;
}
  
.tooltip-dtt .tooltip-text {
    visibility: hidden;
    width: 75px;
    background-color: #f5f7f9;
    color: #4B2197;
    text-align: center;
    border: 1px solid #4B2197;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 50%;
    margin-left: -40px;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.6rem;
    font-weight: bold;
}
  
.tooltip-dtt .tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #4B2197 transparent transparent transparent;
}
  
.tooltip-dtt:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
}
</style>
<div class="card mb-3">
    <div class="card-body">
        <h5>Filter By</h5>
        <div class="filter-box-content"></div>
    </div>        
</div>
<div class="alert alert-info d-none">
    <span id="alert-content"></span>
</div>
<table class="table table-sm table-striped w-100"></table>
`;

class DynamicDataTable extends HTMLElement {
    /**
     * TODO
     * 1. Hidden ID column - DONE
     * 2. Add sort button on each column
     * 3. Add search input box
     * 4. Pagination
     */
    constructor() {
        super();
        this._componentName = 'Dynamic Data Table 2.0';
        this._componentAuthor = 'Codigo Web SpA';
        this._componentVersion = '2.0.1';
        this._componentUrl = 'https://codigoweb.cl/web-components/dynamic-data-table';

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$dynamicTable = this._shadowRoot.querySelector('table');
        this.$messageBox = this._shadowRoot.querySelector('.alert');
        this.$messageBoxContent = this._shadowRoot.querySelector('#alert-content');
        this.$filterBox = this._shadowRoot.querySelector('.filter-box-content');

        this.$columns = [];
        this.$filterby = [];
        this.$showId = false;
        this.$formatCell = false;
        this.$route = 'default';
    }

    _messageBoxClose() {
        this.$messageBoxContent.innerHTML = '';
        this.$messageBox.classList.add('d-none');
    }

    _messageBoxAutoClose() {
        setTimeout(() => {
            this.$messageBoxContent.innerHTML = '';
            this.$messageBox.classList.add('d-none');
        }, 5000);
    }

    _drawFilterHeader(){
        return;
    }

    _formatCell(type, data){
        // console.log(type, data);
        let divContainer = document.createElement('div');
        divContainer.textContent = data[type];
        return divContainer;
    }

    _actionButtons(id){
        // console.log(id);
        let actionButtons = document.createElement('div');
        actionButtons.classList.add('btn-group');
        actionButtons.setAttribute('role', 'group');

        let btnEdit = document.createElement('button');
        btnEdit.classList.add('btn', 'btn-action', 'tooltip-dtt');
        btnEdit.setAttribute('value', `/${this.$route}/${id}/update`);
        btnEdit.innerHTML = '<i class="far fa-edit"></i><span class="tooltip-text">Edit</span>';
        btnEdit.addEventListener('click', function (e) { window.location = this.value; });

        let btnInfo = document.createElement('button');
        btnInfo.classList.add('btn', 'btn-action', 'tooltip-dtt');
        btnInfo.setAttribute('value', `/${this.$route}/${id}/info`);
        btnInfo.innerHTML = '<i class="fa-solid fa-circle-info"></i><span class="tooltip-text">Info</span>';
        btnInfo.addEventListener('click', function (e) { window.location = this.value; });

        let btnDelete = document.createElement('button');
        btnDelete.classList.add('btn', 'btn-action', 'tooltip-dtt');
        btnDelete.setAttribute('value', `/${this.$route}/${id}/delete`);
        btnDelete.innerHTML = '<i class="fas fa-trash"></i><span class="tooltip-text">Delete</span>';
        btnDelete.addEventListener('click', (e) => { 
            fetch(btnDelete.value)
            .then((resp) => resp.json() )
            .then((json) => { 
                // console.log(json);
                if(json.success){ 
                    this.refresh();
                }
            });
        });

        actionButtons.appendChild(btnEdit);
        actionButtons.appendChild(btnInfo);
        actionButtons.appendChild(btnDelete);

        return actionButtons;
    }

    _drawTable (data) {
        // console.log(data);
        this.$filterBox.innerHTML = '';
        this.$dynamicTable.innerHTML = '';

        this._drawFilterHeader();

        for (const key in data) {
            let row = this.$dynamicTable.insertRow(key);
            if(this.$formatCell){
                for (const column of this.$columns) {
                    row.insertCell().appendChild(this._formatCell(column, data[key]));
                }
            } else {
                for (const index in this.$columns) {
                    row.insertCell().textContent = data[key][index];
                }
            }

            if(this.$formatCell){
                row.insertCell().appendChild(this._actionButtons(data[key][this.$columns[0]]));
            } else {
                row.insertCell().appendChild(this._actionButtons(data[key][0]));
            }          
        }

        const head = this.$dynamicTable.createTHead().insertRow(0);

        for (const column of this.$columns) {
            head.insertCell().innerHTML = `<strong>${column.toUpperCase()}</strong>`;
        }

        head.insertCell(this.$columns.length).outerHTML = '<th>ACTIONS</th>';

        if (!this.$showId) {
            for (let i = 0; i < this.$dynamicTable.rows.length; i++) {
                this.$dynamicTable.rows[i].cells[0].classList.add('d-none');
            }
        }
    }

    _loadData(url) {
        fetch(url)
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then(json => {
                console.log(json);
                if (json.success) {
                    this._drawTable(json.data);
                    this.setMessage(json.message);
                    // this.$messageBoxContent.innerHTML = json.message;
                    // this.$messageBox.classList.remove('d-none');
                } else {
                    this.setMessage(json.message);
                    // this.$messageBoxContent.innerHTML = json.message;
                    // this.$messageBox.classList.remove('d-none');
                }
                // this._messageBoxAutoClose();
            });
    }

    static get observedAttributes() {
        return ['route', 'data-url', 'columns'];
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

    setMessage(message){
        this.$messageBoxContent.innerHTML = message;
        this.$messageBox.classList.remove('d-none');
        this._messageBoxAutoClose();
    }

    refresh() {
        // console.log(this._componentName + ' refresh!')
        this._loadData(this.dataUrl);
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

}
customElements.define('dynamic-data-table', DynamicDataTable);