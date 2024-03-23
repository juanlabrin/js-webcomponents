const template = document.createElement('template');
const divBox = document.createElement('div');
const tableTimeline = document.createElement('table');
divBox.id = 'ttb-container';
tableTimeline.id = 'ttb-table';
divBox.appendChild(tableTimeline);
template.appendChild(divBox);

class TimelineTaskBox extends HTMLElement {
    constructor() {
        super();
        // Set copyright info

        // Attach shadow root to class
        this._shadowRoot = this.attachShadow({ mode: 'open' });

        // Create link stylesheet and add to class
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/ttb-styles.css';
        this._shadowRoot.appendChild(link);

        // Get template content
        this._shadowRoot.appendChild(template.firstChild);

        // Instantiate objects
        this.$ttbContainer = this._shadowRoot.getElementById('ttb-container');
        this.$ttbTable = this._shadowRoot.getElementById('ttb-table');

        this.$date = new Date();
        this.$task = '';
        this.$weekDatesArray = [];
    }

    _getWeekDates(date) {
        let newDate = new Date(date);
        let weekDatesArray = [];

        let startOfWeek = newDate.setDate(newDate.getDate() - newDate.getDay());
        let endOfWeek = newDate.setDate(newDate.getDate() + (6 - newDate.getDay()));

        for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
            weekDatesArray.push(new Date(d));
        }

        return weekDatesArray;
    }

    _drawTable(weekDatesArray, taskDate, taskTitle) {
        console.log(typeof taskDate, taskDate.toUTCString());
        let tBody = document.createElement('tbody');
        let row = tBody.insertRow();
        let draggableDiv = document.createElement('div');

        let isDragging = false;
        let initialMouseX, initialMouseY, initialElementX, initialElementY;

        draggableDiv.classList.add('draggable');
        draggableDiv.textContent = `${taskDate.getUTCDate()}/${taskDate.getUTCMonth() + 1} - ${taskTitle}`;

        for (const date of weekDatesArray) {
            let cell = row.insertCell();
            cell.textContent = date.getUTCDate();
            if (date.getUTCDate() === taskDate.getUTCDate()) {
                cell.id = `actual-date`;
            }
        }

        this.$ttbTable.appendChild(tBody);
        this.$ttbContainer.appendChild(draggableDiv);

        let parentRec = this.$ttbContainer.getBoundingClientRect();
        let draggableRec = draggableDiv.getBoundingClientRect();
        let childRec = this.$ttbTable.querySelector('#actual-date').getBoundingClientRect();

        console.log('containerRec', parentRec);
        console.log('draggableRec', draggableRec);
        console.log('cellRec', childRec);

        draggableDiv.style.top = (childRec.top - parentRec.top) + 2;
        draggableDiv.style.left = Math.ceil(draggableRec.x + childRec.x);

        draggableDiv.addEventListener('mousedown', function (e) {
            isDragging = true;
            initialMouseX = e.clientX;
            initialMouseY = e.clientY;
            const elementRect = draggableDiv.getBoundingClientRect();
            initialElementX = elementRect.left - parentRec.left;
            initialElementY = elementRect.top - parentRec.top;
            console.log(initialMouseX, initialMouseY, initialElementX, initialElementY);
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            const deltaX = e.clientX - initialMouseX;
            const deltaY = e.clientY - initialMouseY;

            const newElementX = initialElementX + deltaX;
            const newElementY = initialElementY + deltaY;

            // const containerRect = parentRec.getBoundingClientRect();

            draggableDiv.style.left = newElementX + 'px';
            draggableDiv.style.top = newElementY + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        document.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        console.log('draggableRec new position', draggableDiv.getBoundingClientRect());
        // console.log(this.$ttbTable.getBoundingClientRect());
        // console.log(this.$ttbContainer.getBoundingClientRect());
    }

    get taskDate() {
        return new Date(this.getAttribute('task-date'));
    }

    set taskDate(url) {
        this.setAttribute('task-date', url);
    }

    get taskTitle() {
        return this.getAttribute('task-title');
    }

    set taskTitle(url) {
        this.setAttribute('task-title', url);
    }

    connectedCallback() {
        console.log('Timeline Task Box Connected!');

        if (this.hasAttribute('task-date')) {
            this.$date = this.taskDate;
            this.$weekDatesArray = this._getWeekDates(this.$date);
        } else {
            this.$weekDatesArray = this._getWeekDates(this.$date);
        }

        if (this.hasAttribute('task-title')) {
            this.$taskTitle = this.taskTitle;
        }

        if (this.$weekDatesArray.length > 0) {
            this._drawTable(this.$weekDatesArray, this.$date, this.$taskTitle);
        }
    }
}

customElements.define('timeline-task-box', TimelineTaskBox);