const template = document.createElement('template');
template.innerHTML = `
<style>
.timeline-header {
    display: flex;
    justify-content: space-between;
}

.timeline-month-name {
    padding: 0.25rem;
    margin: 0;    
    font-size: 1.05rem;
    font-weight: 600;
    color: gray;
}

.weeks-with-tasks {
    display: block;
    font-size: .95rem;
    line-height: 1.5;
    appearance: auto;
    border: 1px solid lightgray;
    border-radius: 0.25rem;
    background-color: #fff;
    margin-bottom: 0.25rem;
    color: gray;
}

.timeline-container {
    display: flex;
    padding: 10px;
    border-radius: .25rem;
    border: 1px solid #ccc;
    width: auto;
}

.arrow {
    display: flex;
    padding: 5px;
    justify-content: center;
    align-items: center;
}

.arrow button {
    background: none;
    border: none;
    font-size: large;
    cursor: pointer;
    opacity: 0.5;
}

.arrow button:hover {
    opacity: 1;
}

.timeline-grid {
    display: grid;
    grid-template: "timeline-grid";
    place-content: unset;
    place-items: center;
    width: -moz-available;
    width: -webkit-fill-available;
    overflow: hidden;
}

.timeline-grid>* {
    grid-area: timeline-grid;
    min-width: -moz-available;
    min-width: -webkit-fill-available;
    min-height: 100%;
}

.week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr [week-day]);
    column-gap: 1px;
}

.day {
    display: flex;
    min-height: 5rem;
    border: 1px solid #ece3e3;
    background-color: #f9f9f9;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    color: rgb(139, 139, 137);            
}

.day span {
    display: inline-block;
    vertical-align: middle;
}

.tasks-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr [task-per-day]);
    grid-template-rows: auto;
    column-gap: 1px;
    row-gap: 1px;
}

.task {
    padding: 2px;
    border-radius: .25rem;
    /* background-color: rgb(0, 162, 255); */
    opacity: .7;
    font-size: 10px;
    font-weight: 600;
    text-align: initial;
    color: #fff;
}

.task .status-badge {
    float: inline-end;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    margin: 0.1rem;
    border-radius: 0.25rem;
    font-size: 0.6rem;
    font-weight: 700;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.12);
}

.status-badge-created {
    background-color: #0087ff;
}

.status-badge-completed {
    background-color: #08b703;
}

.status-badge-inprocess {
    background-color: #b7a303;
}

.status-badge-notset {
    background-color: #aaa;
}

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