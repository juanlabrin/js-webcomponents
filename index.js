const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const moneyFormatter = require('./money-formatter');

const app = express();
const port = 3000;

const mongoDB = 'mongodb://localhost/demoMaestranza';
mongoose.connect(mongoDB, { useNewUrlParser: true, useCreateIndex: true });

mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', console.log.bind(console, 'Connection to MongoDB Succesfully!'));

var CategorySchema = new mongoose.Schema({

    name: { type: String, required: true },
    active: { type: Boolean, required: true, default: true }

}, { timestamps: true });


let ProductSchema = new mongoose.Schema({

    productType: { type: String, enum: ['PRODUCT', 'SERVICE'], required: true, default: 'PRODUCT' },
    sku: { type: String, required: true },
    barcode: { type: String },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
    details: {
        image: { type: String },
        manufacturer: { type: String },
        brand: { type: String },
        color: { type: String },
        size: { type: String },
        volume: { type: String },
        serviceType: { type: String, enum: ['N/A', 'OWN', 'THIRD'], default: 'N/A' },
        option1: { type: String }
    },
    stock_min: { type: Number, required: true, default: 0 },
    stock_max: { type: Number, default: null },
    description: { type: String },
    active: { type: Boolean, required: true, default: true },
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', require: true }

}, { timestamps: true });

let Category = mongoose.model('categories', CategorySchema);
let Product = mongoose.model('products', ProductSchema);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public/')));

app.get('/', (req, res) => {
    console.log(moneyFormatter.format(1000));
    console.log(moneyFormatter.locale(1000));
    res.render('index', { title: 'Welcome to components', message: 'Components Prototypes' });
});

app.get('/:sku/barcode-search', (req, res, next) => {
    Product.findOne({ sku: req.params.sku, active: true }, function (err, product) {
        if (err) console.error(err);
        console.log(product);
        if (product !== null) {
            res.send({ success: true, product: product });
        } else {
            res.send({ success: false });
        }
    }).populate('category', 'name');
});

app.get('/:term/term-search', (req, res, next) => { 
    Product.find({ name: { $regex: '.*' + req.params.term + '.*', $options: 'i' }, active: true }, function(err, products){
        if(err) console.error(err);
        let list = [];
        if(products.length > 0){
            products.forEach(p => {
                list.push({ label: p.name, value: p.barcode });
            });
            res.send(list);
        }        
    });
});

app.listen(port, () => {
    console.log(`Listen on port ${port}`);
});