<h2>Dynamic Tasks Table - JavaScript Web Component</h2>
<h3>Basic setup and use.</h3>
<p>The component needs a JSON data source, either in a file or from a database or API, the data need to be formatted and with a rquired fields.</p>
<p>You must create a tag in the file that will contain the component named:</p>

```html
<dynamic-tasks-table>
```
<p>It has three required attributes 'dataUrl', 'columns' and 'filterby'.

```html
<dynamic-tasks-table id="dtt" dataUrl="/path-to/data-source.json" columns='["_id", "title", "initDate", "limitDate", "percent", "priority", "status"]' filterby='["title", "initDate", "percent", "status"]'>
```
</p>
<p>You can set the component like this:</p>

```html
<!-- Include the component -->
<script type='module', src='/js/dynamic-data-table/dynamic-tasks-table-2024.class.js'></script>
```