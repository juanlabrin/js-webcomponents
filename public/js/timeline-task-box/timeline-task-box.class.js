const template = document.createElement('template');
template.innerHTML = `
<style>
.timeline-container {
    padding: 10px;
    border-radius: .25rem;
    border: 1px solid #ccc;
    width: 750px;
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
    min-width: 750px;
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
    background-color: rgb(0, 162, 255);
    opacity: .7;
    font-size: 10px;
    font-weight: 600;
    color: #fff;
}

</style>
    <div class="timeline-container">
        <div class="timeline-grid">
            <div class="week-grid"></div>
            <div class="tasks-grid"></div>
        </div>
    </div>
`;
class TimelineTaskBox extends HTMLElement {
    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$weekGrid = this._shadowRoot.querySelector(".week-grid");
        this.$tasksGrid = this._shadowRoot.querySelector(".tasks-grid");

        this.$days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        this.$date = new Date();
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

    _drawTimeline(tasks, week){
        console.log(tasks, week);

        week.forEach(d => {
            let day = document.createElement('div');
            day.classList.add('day');
            day.textContent = `${this.$days[d.getUTCDay()]}, ${d.getUTCDate()}`;
            this.$weekGrid.appendChild(day);
        });

        tasks.forEach(t => {
            let task = document.createElement('div');
            task.classList.add('task');
            task.textContent = t.title;
            this.$tasksGrid.append(task);
        });
        
    }

    async _loadData(dataSource) {
        let response = await this._getData(dataSource);
        if (response.success) {
            let currentWeek = this._getWeekDates(this.$date);
            let tasksInCurrentWeek = [];
            response.tasks.forEach(task => {
                // TODO get the index (like grid line to start task)
                if(currentWeek.find((date) => date.getUTCDate() == new Date(task.initDate).getUTCDate()) != undefined){
                    tasksInCurrentWeek.push(task);
                }
            });
            this._drawTimeline(tasksInCurrentWeek, currentWeek);
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