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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public/')));

let itemSchema = new mongoose.Schema({
    sku: { type: String }
});

let invoiceSchema = new mongoose.Schema({
    invoiceId: { type: Number }
});

let postSchema = new mongoose.Schema({
    title: { type: String }
});

let Item = mongoose.model('items', itemSchema);
let Invoice = mongoose.model('invoices', invoiceSchema);
let Post = mongoose.model('posts', postSchema, 'post');

app.get('/', (req, res, next) => {
    res.render('index', { title: 'Vanilla Javascript Webcomponents' });
});

app.get('/dynamic-data-table', (req, res, next) => {
    res.render('ddt');
});

app.get('/items/list', async (req, res, next) => {
    let items = await Item.find({});
    res.json({ items: items });
});

app.get('/invoices/list', async (req, res, next) => {
    let invoices = await Invoice.find({});
    res.json({ invoices: invoices });
});

app.get('/posts/list', async (req, res, next) => {
    let posts = await Post.find({});
    res.json({ posts: posts });
});

app.listen(port, () => {
    console.log(`App Listen on: http://localhost:${port}`);
});