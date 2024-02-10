const express = require('express');
const path = require('path');
const logger = require('morgan');
var bodyParser = require('body-parser');

const mongoose = require('mongoose');

const app = express();
const port = 3000;

const mongoDB = 'mongodb://localhost:27017/test';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', console.log.bind(console, 'Connection to MongoDB Succesfully!'));

app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/lab/')]);
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public/')));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/css', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/css'));
app.use('/js', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/js'));
app.use('/webfonts', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/webfonts'));

let itemSchema = new mongoose.Schema({
    sku: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    cost: { type: Number, min: 0, required: true },
    price: { type: Number, min: 0, required: true },
    stock: { type: Number, min: 0, default: 0 },
    barcode: { type: String, unique: true }
});

itemSchema.pre('save', function (next) {
    if (this.barcode == undefined) {
        this.barcode = this.sku.toUpperCase();
    }
    next();
});

let invoiceSchema = new mongoose.Schema({
    invoiceId: { type: Number },
    total: { type: Number },
    status: { type: String }
});

let orderSchema = new mongoose.Schema({
    date: { type: Date, required: true, default: Date.now() },
    doc: { type: mongoose.Schema.Types.ObjectId, refPath: 'docType', required: true },
    docType: { type: String, enum: ['invoices', 'purchases', 'workorders', 'shoppingcart'], required: true },
    tax: { type: Number },
    total: { type: Number },
    grandTotal: { type: Number }
})

let postSchema = new mongoose.Schema({
    title: { type: String }
});

let taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String },
    initDate: { type: Date },
    limitDate: { type: Date }
});

let projectSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 120 }
});

let userSchema = new mongoose.Schema({
    role: { type: String }
});

let Item = mongoose.model('items', itemSchema);
let Invoice = mongoose.model('invoices', invoiceSchema);
let Order = mongoose.model('orders', orderSchema);
let Post = mongoose.model('posts', postSchema, 'post');
let Task = mongoose.model('tasks', taskSchema);
let Project = mongoose.model('projects', projectSchema);
let User = mongoose.model('users', userSchema);

app.get('/', (req, res, next) => {
    res.render('index', { title: 'Vanilla Javascript - Webcomponents.' });
});

app.get('/test', (req, res, next) => {
    res.render('test', { title: 'Vanilla Javascript - Test Area.' });
});

app.get('/base-web-component', (req, res, next) => {
    res.render('bwc', { title: 'Base Webcomponent' });
});

app.get('/dynamic-data-table', (req, res, next) => {
    res.render('dynamic-data-table', { title: 'Dynamic Data Table' });
});

app.get('/lab/dynamic-data-table', (req, res, next) => {
    res.render('dynamic-data-table-lab', { title: 'Lab - Dynamic Data Table', source: '/items/list' });
});

app.get('/rich-text-editor', (req, res, next) => {
    res.render('rte', { title: 'Rich Text Editor' });
});

app.get('/timeline-task-box', (req, res, next) => {
    res.render('ttb', { title: 'Timeline Task Box' });
});

app.get('/item/create', async (req, res, next) => {
    let newItem = new Item({
        sku: 'test0002',
        barcode: '0000000002',
        description: 'Test 2 from js webcomponents',
        cost: 100,
        price: 200
    });
    let response = await newItem.save();
    res.json({ response });
});

app.get('/items/list', async (req, res, next) => {
    let items = await Item.find({});
    res.json({ items: items });
});

app.get('/invoices/list', async (req, res, next) => {
    let invoices = [];
    let data = await Order.find({ active: true, date: { $gte: new Date('2023-11-01') } }).populate('doc');
    //- let data = await Order.find({ active: true }).populate('doc');
    //- console.log(data[0]);
    for (const invoice of data) {
        invoices.push({
            _id: invoice._id,
            date: invoice.date.toISOString().split('T')[0],
            number: invoice.doc.invoiceId,
            total: Math.round(invoice.total),
            tax: invoice.tax,
            taxAmount: Math.round(invoice.doc.total - invoice.total),
            totalWithTax: invoice.doc.total,
            status: invoice.doc.status
        });
    }
    //- console.log(invoices[0]);
    res.json({ success: true, invoices: invoices });
});

app.get('/posts/list', async (req, res, next) => {
    let posts = await Post.find({}, 'title hashtags views category');
    res.json({ posts });
});

app.get('/tasks/list', async (req, res, next) => {
    let tasks = await Task.find({}, 'title initDate limitDate projectId taskColor status');
    res.json({ success: true, data: tasks });
});

app.post('/tasks/update', async (req, res, next) => {
    let updateTask = await Task.findByIdAndUpdate({ _id: req.body._id }, { $set: req.body.set });
    res.json({ success: true, data: updateTask });
});

app.get('/users/list', async (req, res, next) => {
    let users = await User.find({ role: 1 });
    res.json({ users });
});

app.listen(port, () => {
    console.log(`App Listen on: http://localhost:${port}`);
});