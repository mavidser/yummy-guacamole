var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var portfolioSchema = new Schema({
  stock: {type: mongoose.Schema.Types.ObjectId, required: true},
  trade: {type: mongoose.Schema.Types.ObjectId, required: true}
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
