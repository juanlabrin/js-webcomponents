<h2>Dynamic Data Table - JavaScript Web Component</h2>
<h3>Basic setup and use.</h3>
<p>The component needs a JSON data source, either in a file or from a database or API, the data may or may not be formatted.</p>
<p>You must create a tag in the file that will contain the component named:</p>

```html
<dynamic-data-table>
```
<p>It has only one required attribute 'data-source'.

```html
<dynamic-data-table id="ddt" data-source="/path-to/data-source.json">
```
</p>
<p>You can define the configuration and the columns definitions, like this:</p>

```html
<!-- Include the component -->
<script type='module' src='/js/dynamic-data-table/dynamic-data-table-2024.class.js'></script>
```

```javascript
//- Set the component
const ddt = document.getElementById('ddt');

//- You can include or not the parameters, if you do not include them the component will assign them their default values (false or true).
var ddtParams = {
    showSorting: true,
    sortByColumn: 3,
    showCaption: true,
    showPagination: true,
    showSearching: true,
    showActions: true,
    btnActionUrl: '/items/'
};

//- Define columns (data/type/name/render{show, sort})
var ddtColDef = [
    {data:"_id", type:"string", name:"id", render: {show: false, sort: false}}, //- Required for actions buttons (name:"id")
    {data:"number", type:"number", name:"numero", render: {sort: true}},
    {data:"date", type:"date", name:"fecha"}, 
    {data:"total", type:"currency", name:"total"},
    {data:"tax", type:"string", name:"iva"}, 
    {data:"taxAmount", type:"currency", name:"monto iva"},
    {data:"totalWithTax", type:"currency", name:"total general"},           
    {data:"status", type:"string", name:"estado"}
];

var ddtDataSource = "/invoices/list";

//- Initializes the component
ddt.setAttribute('settings', JSON.stringify(ddtParams));
ddt.setAttribute('columns-def', JSON.stringify(ddtColDef));
ddt.setAttribute('data-source', ddtDataSource);
```
<h4>Notes:</h4>
<ul>
<li><strong>dynamic-data-table-2023.class.js</strong> is completely functional</li>
<li><strong>dynamic-data-table-2024.class.js</strong> is under development and improvement</li>
<li>in the folder previous-versions there are previous versions also functional.</li>
<li><strong>The component uses Bootstrap as a CSS library for its visual formatting, but you can use your own library or add your own CSS rules.</strong></li>
</ul>