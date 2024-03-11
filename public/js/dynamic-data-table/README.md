<h2>Basic setup and use.</h2>
<p>The component needs a JSON data source, either in a file or from a database or API, the data may or may not be formatted.</p>
<p>You must create a tag in the file that will contain the component named:</p>

```html
<dynamic-data-table>
```
<p>It has only one required attribute 'data-source'.

```html
<dynamic-data-table data-source="/path/to-data-source">
```
</p>
<p>You can define the configuration and the columns definitions, like this:</p>

```html
<!-->Include the component<-->
<script>type='module', src='/js/dynamic-data-table/dynamic-data-table-2024.class.js'</script>
```

```javascript
//- Set the component
const ddt = document.getElementById('ddt');
var ddtParams = {
    showSorting: true,
    sortByColumn: 3,
    showCaption: true,
    showPagination: true,
    showSearching: true,
    showActions: true
};

//- Define columns (data/type/name)
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