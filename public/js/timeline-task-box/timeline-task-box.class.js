const template = document.createElement('template');
template.innerHTML = `
<style>
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
    place-content: baseline;
    place-items: center;
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

</style>
    <div class="timeline-container">
        <div class="arrow prev-day">prev</div>
        <div class="timeline-grid">
            <div class="week-grid"></div>
            <div class="tasks-grid"></div>
        </div>
        <div class="arrow next-day">next</div>
    </div>
`;
class TimelineTaskBox extends HTMLElement {
    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$prevDay = this._shadowRoot.querySelector(".prev-day");
        this.$nextDay = this._shadowRoot.querySelector(".next-day");

        this.$weekGrid = this._shadowRoot.querySelector(".week-grid");
        this.$tasksGrid = this._shadowRoot.querySelector(".tasks-grid");

        this.$days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

        tasks.forEach(t => {
            let task = document.createElement('div');
            task.classList.add('task');
            task.style.gridColumnStart = t.lineStart;
            task.style.gridColumnEnd = t.lineEnd;
            task.style.backgroundColor = t.task.taskColor;
            task.textContent = t.task.title;
            this.$tasksGrid.append(task);
        });

    }

    _setPrevNextArrows(date, currentWeek){
        this.$prevDay.innerHTML = '';
        this.$nextDay.innerHTML = '';
        let currentDate = new Date(date);

        let prevDay = currentDate.setDate(currentWeek[0].getDate() - 1);
        let nextDay = currentDate.setDate(currentWeek[6].getDate() + 1);

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

        // console.log(new Date(prevDay), new Date(nextDay));
    }

    _proccesData(date, data) {
        let currentWeek = this._getWeekDates(date);
        let tasksInCurrentWeek = [];
        data.forEach(task => {
            let indexStart = currentWeek.findIndex((date) => date.getUTCDate() == new Date(task.initDate).getUTCDate());
            if (indexStart != -1) {
                indexStart = indexStart + 1;
                let indexEnd = indexStart + 1;
                if (task.limitDate != null) {
                    indexEnd = currentWeek.findIndex((date) => date.getUTCDate() == new Date(task.limitDate).getUTCDate())
                    if (indexEnd != -1) {
                        indexEnd = indexEnd + 2;
                    }
                }
                tasksInCurrentWeek.push({ lineStart: indexStart, lineEnd: indexEnd, task: task });
            }
        });
        this._drawTimeline(tasksInCurrentWeek, currentWeek);
        this._setPrevNextArrows(date, currentWeek);
    }

    async _loadData(dataSource) {
        let response = await this._getData(dataSource);
        if (response.success) {
            this.$data = response.tasks;
            this._proccesData(this.$date, this.$data);
        }
    }

    get dataSource() {
        return this.getAttribute('data-source');
    }

    set dataSource(dataSource) {
        this.setAttribute('data-source', dataSource);
    }

    connectedCallback() {
        console.log('Timeline Task Box Connected!');
        if (this.hasAttribute('data-source')) {
            this._loadData(this.dataSource);
        }
    }

}
customElements.define('timeline-task-box', TimelineTaskBox);