"use strict";
const template = document.createElement('template');
template.innerHTML = `
<style>
@import "/css/all.css";
@import "/css/bootstrap.min.css";

* { font-size: 12px; }

.task-title {
    padding: 5px 3px 3px 5px;
    background-color: #FFF;
    border-style: solid;
    border-width: 1px;
    border-radius: 5px;
}

.btn-action{
    padding: 3px;
    background: none;
    font-size: 1.25rem;
    color: #4B2197;
}

.btn-action:hover {
    opacity: 0.7;
    transition: opacity .15s ease-in-out;
}

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

.progress-bar-text {
    position: absolute;
    text-align: center;
    width: 100%;
    color: #AAA;
    font-size: .75rem;
    font-weight: bold;
    bottom: 0.01rem;
}
</style>
<div>
    <div class="card mb-3">
        <div class="card-header">
            <h5>Filter</h5>
        </div>
        <div class="card-body">            
            <div class="filter-box-content"></div>
        </div>        
    </div>
    <div class="alert alert-primary">Dynamic Tasks Table Messages</div>
    <table class="table table-sm table-striped w-100"></table>
</div>
`;
class DynamicTasksTable extends HTMLElement {

    constructor() {
        super();

        this._componentName = 'Dynamic Tasks Table';
        this._componentAuthor = 'Codigo Web SpA';
        this._componentVersion = '1.0.1';
        this._componentUrl = 'https://codigoweb.cl/web-components/dynamic-task-table-class';

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$dynamicTable = this._shadowRoot.querySelector('table');
        this.$messageBox = this._shadowRoot.querySelector('.alert');
        this.$filterBox = this._shadowRoot.querySelector('.filter-box-content');

        this.$sortType = 'asc';

        this.$columns = [];
        this.$filterby = [];
        this.$showId = false;
    }

    _sortData(type, column, data) {
        if (type === 'asc') {
            if (typeof data[0][column] === 'number') {
                data.sort((a, b) => {
                    return (a[column] === null) - (b[column] === null) || (a[column] - b[column]);
                });
            } else {
                data.sort((a, b) => {
                    return (a[column] === null) - (b[column] === null) || ('' + a[column]).localeCompare(b[column]);
                });
            }
            this.$sortType = 'desc';
        }
        if (type === 'desc') {
            if (typeof data[0][column] === 'number') {
                data.sort((a, b) => {
                    return (b[column] === null) - (a[column] === null) || (b[column] - a[column]);
                });
            } else {
                data.sort((a, b) => {
                    return (b[column] === null) - (a[column] === null) || ('' + b[column]).localeCompare(a[column]);
                });
            }
            this.$sortType = 'asc';
        }

        this._drawTable(data);

    }

    _messageBoxClose() {
        this.$messageBox.innerHTML = '';
        this.$messageBox.classList.add('d-none');
    }

    _messageBoxAutoClose() {
        setTimeout(() => {
            this.$messageBox.innerHTML = '';
            this.$messageBox.classList.add('d-none');
        }, 5000);
    }

    _formatDate(format = null, string) {
        let isoString = new Date(string).toISOString().split('T')[0];
        return isoString;
    }

    _actionButtons(id) {
        let actionButtons = document.createElement('div');
        actionButtons.classList.add('btn-group');
        actionButtons.setAttribute('role', 'group');

        let btnEdit = document.createElement('button');
        btnEdit.classList.add('btn', 'btn-action', 'tooltip-dtt');
        btnEdit.setAttribute('value', `/tasks/${id}/update`);
        btnEdit.innerHTML = '<i class="far fa-edit"></i><span class="tooltip-text">Edit Task</span>';
        btnEdit.addEventListener('click', function (e) { window.location = this.value; });

        let btnProject = document.createElement('button');
        btnProject.classList.add('btn', 'btn-action', 'tooltip-dtt');
        btnProject.setAttribute('value', `/tasks/${id}/add-to-project`);
        btnProject.innerHTML = '<i class="fas fa-cogs"></i><span class="tooltip-text">Add to Project</span>';
        btnProject.addEventListener('click', function (e) { modalInputTaskId.value = id; modalAddTaskToProject.show(); /* window.location = this.value; */ });

        let btnEmployee = document.createElement('button');
        btnEmployee.classList.add('btn', 'btn-action', 'tooltip-dtt');
        btnEmployee.setAttribute('value', `/tasks/${id}/add-employee`);
        btnEmployee.innerHTML = '<i class="fas fa-user-cog"></i><span class="tooltip-text">Add Employee</span>';
        btnEmployee.addEventListener('click', function (e) { window.location = this.value; });

        let btnDelete = document.createElement('button');
        btnDelete.classList.add('btn', 'btn-action', 'tooltip-dtt');
        btnDelete.setAttribute('value', `/tasks/${id}/delete`);
        btnDelete.innerHTML = '<i class="fas fa-trash"></i><span class="tooltip-text">Delete</span>';
        btnDelete.addEventListener('click', (e) => {
            fetch(btnDelete.value)
                .then((resp) => resp.json())
                .then((json) => {
                    console.log(json);
                    if (json.success) {
                        this.refresh();
                    }
                });
        });

        actionButtons.appendChild(btnEdit);
        actionButtons.appendChild(btnProject);
        actionButtons.appendChild(btnEmployee);
        actionButtons.appendChild(btnDelete);

        return actionButtons;
    }

    _formatCell(type, data) {

        let divContainer = document.createElement('div');

        if (type === 'title') {

            let enterEventFired = false;
            let blurEventFired = false;

            divContainer.classList.add('task-title', 'wrap-text', 'text-left');
            divContainer.style.borderColor = data['taskColor'];
            divContainer.textContent = data[type];

            divContainer.addEventListener('click', (e) => {
                console.log(divContainer.textContent);
                let range = document.createRange();
                let selection = window.getSelection();

                divContainer.contentEditable = true;

                range.selectNodeContents(divContainer);
                selection.removeAllRanges();
                selection.addRange(range);

                enterEventFired = false;
                blurEventFired = false;
            });

            divContainer.addEventListener('blur', (e) => {
                if (!blurEventFired) {
                    divContainer.contentEditable = false;
                    console.log('Save the task on blur ' + data['_id']);
                    this._sendData('/tasks/update', { _id: data['_id'], title: divContainer.textContent });
                    blurEventFired = true;
                    enterEventFired = false;
                }
            });

            divContainer.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !enterEventFired) {
                    divContainer.contentEditable = false;
                    console.log('Save the task on blur ' + data['_id']);
                    this._sendData('/tasks/update', { _id: data['_id'], title: divContainer.textContent });
                    blurEventFired = true;
                    enterEventFired = false;
                }
            });

        }

        if (type === 'initDate' || type === 'limitDate') {
            let dateInput = document.createElement('input');
            let btnSave = document.createElement('button');

            dateInput.classList.add('form-control', type);
            dateInput.type = 'date';
            dateInput.value = (data[type]) ? this._formatDate(null, data[type]) : '';

            btnSave.classList.add('btn', 'btn-action', 'tooltip-dtt', 'd-none');
            btnSave.style.marginLeft = '3px';
            btnSave.innerHTML = '<i class="fas fa-save"></i><span class="tooltip-text">Save</span>';

            let currentDate = dateInput.value;

            dateInput.addEventListener('change', (e) => {

                console.log(currentDate);
                if (type === 'limitDate') {
                    if (new Date(dateInput.value) < new Date(data['initDate'])) {
                        console.log(new Date(dateInput.value), ' less than ', new Date(data['initDate']));
                        alert('Limit date cannot be less than Init date');
                        dateInput.value = currentDate;
                        return;
                    }
                }

                if (type === 'initDate' && !!data['limitDate']) {
                    console.log(data['limitDate']);
                    if (new Date(dateInput.value) > new Date(data['limitDate'])) {
                        console.log(new Date(dateInput.value), ' higher than ', new Date(data['limitDate']));
                        alert('Init date cannot be higher than Limit date');
                        dateInput.value = currentDate;
                        return;
                    }
                }

                currentDate = dateInput.value;
                btnSave.classList.remove('d-none');

            });

            btnSave.addEventListener('click', (e) => {
                this._sendData('/tasks/update', { _id: data['_id'], [type]: dateInput.value });
            });

            divContainer.classList.add('input-group');
            divContainer.appendChild(dateInput);
            divContainer.appendChild(btnSave);
        }

        if (type === 'percent') {
            let enterEventFired = false;
            let blurEventFired = false;

            let divPercentContainer = document.createElement('div');
            let divPercentBar = document.createElement('div');
            let divPercentText = document.createElement('span');

            divPercentBar.classList.add('progress-bar', 'progress-bar-striped', 'bg-info');
            divPercentBar.style.width = `${data[type]}%`;

            divPercentText.classList.add('progress-bar-text');
            divPercentText.style.color = (parseInt(data[type]) >= 50) ? '#FFF' : '#AAA';
            divPercentText.style.cursor = 'pointer';
            divPercentText.textContent = `${data[type]}%`;

            divPercentText.addEventListener('click', (e) => {
                console.log(divPercentText.textContent);
                let range = document.createRange();
                let selection = window.getSelection();

                divPercentText.contentEditable = true;

                range.selectNodeContents(divPercentText);
                selection.removeAllRanges();
                selection.addRange(range);

                enterEventFired = false;
                blurEventFired = false;
            });

            divPercentText.addEventListener('blur', (e) => {
                if (!blurEventFired) {
                    divPercentText.contentEditable = false;
                    console.log('Save the percent on blur ' + data['_id']);
                    this._sendData('/tasks/update', { _id: data['_id'], percent: divPercentText.textContent });
                    blurEventFired = true;
                    enterEventFired = false;
                }
            });

            divPercentText.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !enterEventFired) {
                    divPercentText.contentEditable = false;
                    console.log('Save the percent on blur ' + data['_id']);
                    this._sendData('/tasks/update', { _id: data['_id'], percent: divPercentText.textContent });
                    blurEventFired = true;
                    enterEventFired = false;
                }
            });

            divPercentContainer.classList.add('progress');
            divPercentContainer.style.minWidth = '150px';
            divPercentContainer.style.position = 'relative';
            divPercentContainer.appendChild(divPercentBar);
            divPercentContainer.appendChild(divPercentText);
            divContainer.style.paddingTop = '10px';
            divContainer.appendChild(divPercentContainer);
        }

        if (type === 'priority') {
            let setPriority = document.createElement('select');
            let options = ['NOT SET', 'LOW', 'NORMAL', 'HIGH'];

            for (const o of options) {
                let option = document.createElement('option');
                option.value = o;
                option.textContent = o;
                setPriority.appendChild(option);
            }

            setPriority.value = data[type];
            setPriority.classList.add('form-control');

            setPriority.addEventListener('change', (e) => {
                this._sendData('/tasks/update', { _id: data['_id'], [type]: setPriority.value });
            });

            divContainer.appendChild(setPriority);
        }

        if (type === 'status') {
            let setStatus = document.createElement('select');
            let options = ['NOT SET', 'CREATED', 'IN PROCESS', 'ON HOLD', 'COMPLETED', 'NEED INTERVENTION', 'CANCELLED'];

            for (const o of options) {
                let option = document.createElement('option');
                option.value = o;
                option.textContent = o;
                setStatus.appendChild(option);
            }

            setStatus.value = data[type];
            setStatus.classList.add('form-control');

            setStatus.addEventListener('change', (e) => {
                this._sendData('/tasks/update', { _id: data['_id'], [type]: setStatus.value });
            });

            divContainer.appendChild(setStatus);
        }

        return divContainer;
    }

    _drawFilterHeader() {

        let col = 12 / this.$filterby.length;
        let divRow = document.createElement('div');
        let btnFilter = document.createElement('button');
        let btnClear = document.createElement('button');
        let options = ['NOT SET', 'CREATED', 'IN PROCESS', 'ON HOLD', 'COMPLETED', 'NEED INTERVENTION', 'CANCELLED'];

        btnFilter.classList.add('btn', 'btn-primary');
        btnFilter.innerHTML = '<i class="fa-solid fa-filter"></i> Filter';

        btnClear.classList.add('btn', 'btn-secondary');
        btnClear.innerHTML = '<i class="fa-solid fa-refresh"></i> Reset';

        btnFilter.addEventListener('click', async (e) => {
            let title = this._shadowRoot.querySelector('#filter-title-text').value;
            let initDate = this._shadowRoot.querySelector('#filter-init-date').value;
            let percent = this._shadowRoot.querySelector('#filter-percent').value;
            let status = this._shadowRoot.querySelector('#filter-select-status').value;
            let color = this._shadowRoot.querySelector('#filter-title-color').value;

            console.log('Set filter', title, initDate, percent, status, color);

            let options = {
                method: 'post',
                body: JSON.stringify({ title: title, initDate: initDate, percent: percent, status: status, color: color }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            let resp = await fetch('/tasks/filter-tasks', options);
            let json = await resp.json();
            console.log(json);
            if (json.success) {
                this._drawTable(json.data);
            }
        });

        btnClear.addEventListener('click', (e) => {
            this.refresh();
        });

        this.$filterby.forEach(c => {
            let divColumn = document.createElement('div');
            let inputGroup = document.createElement('div');

            divColumn.classList.add('col-md-' + col);

            if (c === 'title') {
                let inputTitle = document.createElement('input');
                let inputColor = document.createElement('input');
                let inputLabel = document.createElement('span');

                inputTitle.classList.add('form-control');
                inputColor.classList.add('form-control');
                inputLabel.classList.add('input-group-text');

                inputLabel.textContent = c.toUpperCase();
                inputColor.type = 'color';
                inputColor.value = '#007bff';
                inputColor.style.maxWidth = '35px';
                inputColor.style.maxHeight = '30px';
                inputTitle.id = 'filter-title-text';
                inputColor.id = 'filter-title-color';

                inputGroup.classList.add('input-group');
                inputGroup.appendChild(inputLabel);
                inputGroup.appendChild(inputTitle);
                inputGroup.appendChild(inputColor);
                divColumn.appendChild(inputGroup);
            }

            if (c === 'initDate') {
                let inputDate = document.createElement('input');
                let inputLabel = document.createElement('span');

                inputDate.classList.add('form-control');
                inputLabel.classList.add('input-group-text');

                inputLabel.textContent = c.toUpperCase();
                inputDate.type = 'date';
                inputDate.id = 'filter-init-date'

                inputGroup.classList.add('input-group');
                inputGroup.appendChild(inputLabel);
                inputGroup.appendChild(inputDate);
                divColumn.appendChild(inputGroup);
            }

            if (c === 'percent') {
                let inputPercent = document.createElement('input');
                let inputLabel = document.createElement('span');

                inputPercent.classList.add('form-control');
                inputLabel.classList.add('input-group-text');

                inputLabel.textContent = c.toUpperCase();
                inputPercent.type = 'number';
                inputPercent.max = 100;
                inputPercent.min = 0;
                inputPercent.placeholder = 100;
                inputPercent.id = 'filter-percent';

                inputGroup.classList.add('input-group');
                inputGroup.appendChild(inputLabel);
                inputGroup.appendChild(inputPercent);
                divColumn.appendChild(inputGroup);
            }

            if (c === 'status') {
                let selectStatus = document.createElement('select');
                let inputLabel = document.createElement('span');

                selectStatus.classList.add('form-control');
                inputLabel.classList.add('input-group-text');

                inputLabel.textContent = c.toUpperCase();

                for (const o of options) {
                    let option = document.createElement('option');
                    option.value = o;
                    option.textContent = o;
                    selectStatus.appendChild(option);
                }

                selectStatus.value = '';

                selectStatus.id = 'filter-select-status';

                inputGroup.classList.add('input-group');
                inputGroup.appendChild(inputLabel);
                inputGroup.appendChild(selectStatus);
                inputGroup.appendChild(btnFilter);
                inputGroup.appendChild(btnClear);
                divColumn.appendChild(inputGroup);
            }

            divRow.appendChild(divColumn);
        });

        divRow.classList.add('row');
        this.$filterBox.appendChild(divRow);
    }

    _drawTable(data) {
        //- console.log(data);
        this.$filterBox.innerHTML = '';
        this.$dynamicTable.innerHTML = '';

        this._drawFilterHeader();

        for (const key in data) {
            let row = this.$dynamicTable.insertRow(key);
            for (const column of this.$columns) {
                row.insertCell().appendChild(this._formatCell(column, data[key]));
            }
            row.insertCell().appendChild(this._actionButtons(data[key][this.$columns[0]]));
        }

        const head = this.$dynamicTable.createTHead().insertRow(0);

        for (const column of this.$columns) {
            let divHead = document.createElement('div');
            let strong = document.createElement('strong');

            let icon = document.createElement('i');
            icon.innerHTML = '&#x21c5;';
            icon.style.cursor = 'pointer';
            icon.style.marginLeft = '5px';

            strong.textContent = column.toUpperCase();

            icon.addEventListener('click', (e) => {
                e.preventDefault();
                this._sortData(this.$sortType, column, data);
            });

            divHead.appendChild(strong);
            divHead.appendChild(icon);
            head.insertCell().appendChild(divHead);
            // head.insertCell().innerHTML = `<strong>${column.toUpperCase()}</strong>`;
        }

        let actionTH = document.createElement('strong');
        actionTH.textContent = 'ACTIONS';
        head.insertCell(this.$columns.length).prepend(actionTH);

        // head.insertCell(this.$columns.length).outerHTML = '<th>ACTIONS</th>';

        if (!this.$showId) {
            for (let i = 0; i < this.$dynamicTable.rows.length; i++) {
                this.$dynamicTable.rows[i].cells[0].classList.add('d-none');
            }
        }
    }

    _loadData(url, showMessageBox = true) {
        //- console.log(url);
        fetch(url)
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then(json => {
                //- console.log(json);
                if (json.success) {
                    this._drawTable(json.data);
                    if (showMessageBox) {
                        this.$messageBox.innerHTML = json.message;
                        this.$messageBox.classList.remove('d-none');
                    }

                } else {
                    if (showMessageBox) {
                        this.$messageBox.innerHTML = json.message;
                        this.$messageBox.classList.remove('d-none');
                    }
                }
                this._messageBoxAutoClose();
            });
    }

    _sendData(url, data) {
        let options = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        fetch(url, options)
            .then(res => {
                return res.json();
            })
            .then(json => {
                if (json.success) {
                    console.log(json);
                    this.refresh(false);
                    this.$messageBox.innerHTML = json.message;
                    this.$messageBox.classList.remove('d-none');
                } else {
                    this.$messageBox.innerHTML = json.message;
                    this.$messageBox.classList.remove('d-none');
                }
            });
    }

    refresh(showMessageBox) {
        this._loadData(this.dataUrl, showMessageBox);
    }

    setMessage(message) {
        this.$messageBox.innerHTML = message;
        this.$messageBox.classList.remove('d-none');
        this._messageBoxAutoClose();
    }

    connectedCallback() {
        // console.log(this._componentName + ' connected!');
        if (this.hasAttribute('dataUrl')) {
            this._loadData(this.dataUrl);
        }
        if (this.hasAttribute('columns')) {
            this.$columns = JSON.parse(this.columns);
            // console.log(this.$columns);
        }
        if (this.hasAttribute('filterby')) {
            this.$filterby = JSON.parse(this.filterby);
            // console.log(this.$filterby);
        }
    }

    // Getters and Setters of attributes
    get dataUrl() {
        return this.getAttribute('dataUrl');
    }
    set dataUrl(newDataUrl) {
        this.setAttribute('dataUrl', newDataUrl);
    }
    get columns() {
        return this.getAttribute('columns');
    }
    set columns(newColumns) {
        this.setAttribute('columns', newColumns);
    }
    get filterby() {
        return this.getAttribute('filterby');
    }
    set filterby(newFilterby) {
        this.setAttribute('filterby', newColumns);
    }

    // Attributes orbserver
    static get observedAttributes() {
        return ['dataUrl'];
    }

    attributeChangedCallback(name) {
        // console.log(`Attribute: ${name} changed!`);
        if (this.dataUrl.length > 0) {
            this._drawTable();
        }
    }

}

customElements.define('dynamic-tasks-table', DynamicTasksTable);