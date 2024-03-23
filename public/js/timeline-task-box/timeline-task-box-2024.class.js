const template = document.createElement('template');
template.innerHTML = `
<style>
@import "/css/timeline-task-box.css";
</style>
<div class="wrap">
    <div class="timeline-header">
        <h5 class="timeline-month-name">{Month Name}</h5>
        <select class="weeks-with-tasks">{Week Range}</select>
    </div>
    <div class="timeline-container">
        <div class="arrow prev-day">prev</div>
        <div class="timeline-grid">
            <div class="week-grid"></div>
            <div class="tasks-grid"></div>
        </div>
        <div class="arrow next-day">next</div>
    </div>
</div>
`;
class TimelineTaskBox extends HTMLElement {
    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$prevDay = this._shadowRoot.querySelector(".prev-day");
        this.$nextDay = this._shadowRoot.querySelector(".next-day");

        this.$monthName = this._shadowRoot.querySelector(".timeline-month-name");
        this.$weeksWithTasks = this._shadowRoot.querySelector(".weeks-with-tasks");
        this.$weekGrid = this._shadowRoot.querySelector(".week-grid");
        this.$tasksGrid = this._shadowRoot.querySelector(".tasks-grid");

        this.$months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.$days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        this.$drawOptionWeeks = true;
        this.$date = new Date();
        this.$data = [];
    }

    async _sendData(url, data) {
        let options = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        // console.log(options);
        const response = await fetch(url, options);
        const json = await response.json();
        return json;
    }

    async _getData(url) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
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

    _drawModal(task){
        // console.log(task);
        let options = ['NOT SET', 'CREATED', 'IN PROCESS', 'ON HOLD', 'COMPLETED', 'NEED INTERVENTION', 'CANCELLED'];
        
        let modal = document.createElement('div');
        let modalContent = document.createElement('div');
        let taskEditBox = document.createElement('div');
        
        let modalTitle = document.createElement('h5');
        let btnEdit = document.createElement('button');

        let inputDivId = document.createElement('input');
        let inputDivTitle = document.createElement('input');
        let inputDivStatus = document.createElement('select');
        let inputDivInitDate = document.createElement('input');
        let inputDivLimitDate = document.createElement('input');

        for (const o of options) {
            let option = document.createElement('option');
            option.value = o;
            option.textContent = o;
            inputDivStatus.appendChild(option);
        }

        inputDivId.value = task._id;
        inputDivTitle.value = task.title;
        inputDivStatus.value = task.status;
        inputDivInitDate.value = task.initDate.split('T')[0];
        inputDivLimitDate.value = (task.limitDate != null)?task.limitDate.split('T')[0]:task.initDate.split('T')[0];

        inputDivId.type = 'hidden';
        inputDivInitDate.type = 'date';
        inputDivLimitDate.type = 'date';

        inputDivTitle.style.gridColumn = '1/5';

        modalTitle.textContent = 'Edit Task';
        btnEdit.textContent = 'Save';

        btnEdit.addEventListener('click', async (e) => {
            console.log(inputDivId.value);
            let set = {
                title: inputDivTitle.value,
                status: inputDivStatus.value,
                initDate: inputDivInitDate.value,
                limitDate: inputDivLimitDate.value
            }
            let response = await this._sendData('/tasks/update', { _id: inputDivId.value, set: set });
            if(response.success){
                this.refresh();
                modal.remove();
            }
        });

        taskEditBox.appendChild(modalTitle);
        taskEditBox.appendChild(inputDivId);
        taskEditBox.appendChild(inputDivTitle);
        taskEditBox.appendChild(inputDivStatus);
        taskEditBox.appendChild(inputDivInitDate);
        taskEditBox.appendChild(inputDivLimitDate);

        btnEdit.classList.add('timeline-modal-btn-edit');
        taskEditBox.classList.add('timeline-modal-task-edit-box');
        modalContent.classList.add('timeline-modal-content');
        modal.classList.add('timeline-modal');

        taskEditBox.appendChild(btnEdit);
        modalContent.appendChild(taskEditBox);
        modal.appendChild(modalContent);        
        document.getElementsByTagName('body')[0].appendChild(modal);

        window.addEventListener('click', (e) => {
            if(e.target === modal){
                modal.remove();
            }
        });
    }

    _drawTimeline(tasks, week) {
        // console.log(tasks, week);

        this.$weekGrid.innerHTML = '';
        this.$tasksGrid.innerHTML = '';

        week.forEach(d => {
            let day = document.createElement('div');
            day.classList.add('day');
            day.textContent = `${this.$days[d.getUTCDay()]}, ${d.getUTCDate()}`;
            this.$weekGrid.appendChild(day);
        });

        if (tasks.length > 0) {
            tasks.forEach(t => {
                let task = document.createElement('div');
                let taskTitle = document.createElement('span');
                let taskStatus = document.createElement('span');

                task.classList.add('task');
                task.style.gridColumnStart = t.lineStart;
                task.style.gridColumnEnd = t.lineEnd;
                task.style.backgroundColor = t.task.taskColor;


                taskStatus.classList.add('status-badge');
                (t.task.status === 'CREATED') ? taskStatus.classList.add('status-badge-created') : '';
                (t.task.status === 'COMPLETED') ? taskStatus.classList.add('status-badge-completed') : '';
                (t.task.status === 'IN PROCESS') ? taskStatus.classList.add('status-badge-inprocess') : '';
                (t.task.status === 'NOT SET') ? taskStatus.classList.add('status-badge-notset') : '';

                taskTitle.textContent = t.task.title;
                taskStatus.textContent = t.task.status;

                task.addEventListener('click', (e) => { this._drawModal(t.task); });

                task.appendChild(taskTitle);
                task.appendChild(taskStatus);
                this.$tasksGrid.append(task);
            });
        } else {
            let task = document.createElement('div');
            let taskTitle = document.createElement('span');
            let taskStatus = document.createElement('span');

            task.classList.add('task');
            task.style.gridColumnStart = 1;
            task.style.gridColumnEnd = 8;

            taskTitle.textContent = "Test";
            taskStatus.textContent = "Test";

            task.appendChild(taskTitle);
            task.appendChild(taskStatus);
            this.$tasksGrid.append(task);
        }


    }

    _setPrevNextArrows(currentWeek) {
        this.$prevDay.innerHTML = '';
        this.$nextDay.innerHTML = '';

        let prevDay = currentWeek[0].getTime() - (24 * 60 * 60 * 1000);
        let nextDay = currentWeek[6].getTime() + (24 * 60 * 60 * 1000);

        // console.log(new Date(prevDay), new Date(nextDay));

        let btnPrevDay = document.createElement('button');
        btnPrevDay.setAttribute('rel', prevDay);
        btnPrevDay.innerHTML = '&#x276E;';
        btnPrevDay.addEventListener('click', (e) => { this._proccesData(new Date(prevDay), this.$data); });
        this.$prevDay.appendChild(btnPrevDay);

        let btnNextDay = document.createElement('button');
        btnNextDay.setAttribute('rel', nextDay);
        btnNextDay.innerHTML = '&#x276F;';
        btnNextDay.addEventListener('click', (e) => { this._proccesData(new Date(nextDay), this.$data); });
        this.$nextDay.appendChild(btnNextDay);
    }

    _formatDate(string) {
        let date = new Date(string);
        function addZero(int) {
            if (int < 10) {
                return '0' + int;
            } else {
                return int;
            }
        }
        date = `${date.getUTCFullYear()}${addZero(parseInt(date.getUTCMonth() + 1))}${addZero(parseInt(date.getUTCDate()))}`
        return date;
    }

    _getWeeksWithTasks(dates){
        this.$weeksWithTasks.innerHTML = '';
        let weeksWithTasks = [];

        for(const date of dates){
            let week = this._getWeekDates(date);
            weeksWithTasks.push({ text: `Week[${week[0].getUTCDate()}/${(week[0].getUTCMonth() + 1)} - ${week[6].getUTCDate()}/${(week[6].getUTCMonth() + 1)}]`, date: date.split('T')[0] });
        }

        let filtered = weeksWithTasks.filter(function({text}){
            var key = `${text}`;
            return !this.has(key) && this.add(key);
        }, new Set);

        for(const week of filtered){
            let option = document.createElement('option');
            option.value = week.date;
            option.textContent = week.text;
            this.$weeksWithTasks.appendChild(option);
        }

        this.$weeksWithTasks.addEventListener('change', (e) => {
            e.preventDefault();
            this._proccesData(new Date(this.$weeksWithTasks.value), this.$data);
        });

        this.$drawOptionWeeks = false;
    }

    _proccesData(date, data) {
        let currentWeek = this._getWeekDates(date);
        let tasksInCurrentWeek = [];

        let daysWithTasks = new Set();

        for (const task of data) {
            let indexStart = currentWeek.findIndex((date) => this._formatDate(date.toUTCString()) === this._formatDate(task.initDate));
            if (indexStart != -1) {
                indexStart = indexStart + 1;
                let indexEnd = indexStart + 1;
                if (task.limitDate != null) {
                    indexEnd = currentWeek.findIndex((date) => this._formatDate(date.toUTCString()) === this._formatDate(task.limitDate));
                    if (indexEnd != -1) {
                        indexEnd = indexEnd + 2;
                    }
                }
                tasksInCurrentWeek.push({ lineStart: indexStart, lineEnd: indexEnd, task: task });
            }
            daysWithTasks.add(task.initDate);
        }

        if(this.$drawOptionWeeks){
            this._getWeeksWithTasks(daysWithTasks);
        }        

        this._drawTimeline(tasksInCurrentWeek, currentWeek);
        this._setPrevNextArrows(currentWeek);
        this.$monthName.textContent = this.$months[new Date(date).getUTCMonth()];
    }

    async _loadData(dataSource) {
        let response = await this._getData(dataSource);
        if (response.success) {
            ;
            this.$data = response.data;
            this._proccesData(this.$date, this.$data);
        }
    }

    get dataSource() {
        return this.getAttribute('data-source');
    }

    set dataSource(dataSource) {
        this.setAttribute('data-source', dataSource);
    }

    refresh() {
        this._loadData(this.dataSource);
    }

    connectedCallback() {
        console.log('Timeline Task Box Connected!');
        if (this.hasAttribute('data-source')) {
            this._loadData(this.dataSource);
        }
    }

}

customElements.define('timeline-task-box', TimelineTaskBox);