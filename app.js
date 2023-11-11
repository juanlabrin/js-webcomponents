const express = require('express');
const path = require('path');
const logger = require('morgan');

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

itemSchema.pre('save', function(next){
    if(this.barcode == undefined){
        this.barcode = this.sku.toUpperCase();
    }
    next();
});

let invoiceSchema = new mongoose.Schema({
    invoiceId: { type: Number }
});

let postSchema = new mongoose.Schema({
    title: { type: String }
});

let taskSchema = new mongoose.Schema({
    initDate: { type: String }
});

let userSchema = new mongoose.Schema({
    role: { type: String }
});

let Item = mongoose.model('items', itemSchema);
let Invoice = mongoose.model('invoices', invoiceSchema);
let Post = mongoose.model('posts', postSchema, 'post');
let Task = mongoose.model('tasks', taskSchema);
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

app.get('/dynamic-data-table/lab', (req, res, next) => {
    res.render('dynamic-data-table-lab', { title: 'Dynamic Data Table {lab}' });
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
    let invoices = await Invoice.find({});
    res.json({ success: true, invoices: invoices });
});

app.get('/posts/list', async (req, res, next) => {
    let posts = await Post.find({}, 'title hashtags views category');
    res.json({ posts });
});

app.get('/tasks/list', async (req, res, next) => {
    let tasks = await Task.find({}, 'title hashtags views category');
    res.json({ success: true, tasks: tasks });
});

app.get('/users/list', async (req, res, next) => {
    let users = await User.find({ role: 1 });
    res.json({ users });
});

app.listen(port, () => {
    console.log(`App Listen on: http://localhost:${port}`);
});