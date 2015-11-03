var mongoose=require('mongoose');
var Schema=mongoose.Schema;

// I don't understand how why the Trade model doesn't have a stock associated to itself, rather than in the portfolio model. Trade without the stock doesn't make any sense and should be here.

var tradeSchema = new Schema({
  date: {type: Date, required: true},
  price: {type: Number, required: true},
  number: {type: Number, required: true},
  type: {type: String, required: true, enum: ['BUY', 'SELL'], uppercase: true},
  versionKey: false
});

module.exports = mongoose.model('Trade', tradeSchema);
