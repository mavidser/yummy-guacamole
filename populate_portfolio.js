var mongoose = require('mongoose');
var dbName = 'smallcaseDB';
var connectionString = 'mongodb://localhost:27017/' + dbName;
mongoose.connect(connectionString);

var Stock = require('./models/stock');

var stock = new Stock({'stock':'AIRTEL'});
stock.save();
var stock = new Stock({'stock':'HDFCBANK'});
stock.save();
var stock = new Stock({'stock':'RELIANCE'});
stock.save();
var stock = new Stock({'stock':'SBI'});
stock.save();
