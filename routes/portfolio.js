var Portfolio = require('../models/portfolio');
var Stock = require('../models/stock');
var Trade = require('../models/trade');
var express = require('express');
var router = express.Router();

function getPortfolio (req, res, holdings) {
  Portfolio.find(function(err, portfolio) {
    var result = {}
    
    if (err) {
      return res.send(err);
    }

    var stock_dict = {};
    var all_trades = [];
    Stock.find(function(err, stock) {
      if (err) {
        return res.send(err);
      }
      for (var i = 0; i < stock.length; i++) {
        stock_dict[stock[i]._id] = stock[i].stock;
      };

      for (var i = 0 ; i < portfolio.length; i++) {
        if (!result[stock_dict[portfolio[i].stock]])
          result[stock_dict[portfolio[i].stock]] = []
        result[stock_dict[portfolio[i].stock]].push(portfolio[i].trade);
        all_trades.push(portfolio[i].trade);
      };

      var all_trades2 = {};
      function getTrades (i, callback) {
        if (i < all_trades.length) {
          Trade.findOne({'_id':all_trades[i]}, function(err, trade) {
            if (err) {
              return res.send(err);
            }
            all_trades2[all_trades[i]] = trade;
            getTrades(i+1, callback);
            // console.log(i,all_trades[i],trade);
          });
        } else {
          callback();
        }
      }

      getTrades(0, function () {
        for (i in result) {
          var new_trade_list = []
          var buys = 0, sells = 0, amount = 0;
          for (var j = 0; j < result[i].length; j++) {
            var current_trade = all_trades2[result[i][j]]
            if (holdings) {
              if(current_trade['type'] == 'BUY') {
                buys += current_trade['number']
                amount += (current_trade['number']*current_trade['price'])
              }
              else {
                sells += current_trade['number']
              }
            } else {
              new_trade_list.push(current_trade);
            }
          }
          if (holdings) {
            var hold = {};
            hold['amount'] = amount/buys;
            hold['number'] = buys - sells;
            result[i] = hold;
          }
          else {
            result[i] = new_trade_list;
          }

        }
        return res.json(result);
      });
    });
  });
}

router.route('/').get(function(req, res) {
  return getPortfolio(req,res);
});

router.route('/holdings').get(function(req, res) {
  return getPortfolio(req,res,holdings=true);
});

router.route('/returns').get(function(req, res) {
});

router.route('/addTrade').post(function(req, res) {

  var stock = req.query.stock;
  var type = req.query.type;
  var price = req.query.price;
  var number = req.query.number;
  var date = req.query.date;
  if (!date)
    date = Date.now()
  var trade = new Trade({type:type, price: price, date:date, number: number});
  Stock.findOne({ stock: stock}, function(err2, result2) {
    if (err2) {
      return res.send(err2);
    }
    var stock_id = result2._id;

    trade.save(function(err, result) {
      if (err) {
        return res.send(err);
      }
      var portfolio = new Portfolio({stock: stock_id, trade: result.id});
      portfolio.save(function (err3, result3) {
        if (err3) {
          return res.send(err3);
        }
        return res.send({ message: 'Portfolio Added', data: result3.id });
      })
    });
  });
});

router.route('/updateTrade').post(function(req, res) {
  var id = req.query.id;
  if (!id)
    return res.send({message: 'ID needed'});
  updateQuery = {}
  var stock = req.query.stock;
  if (stock) updateQuery['stock'] = stock;
  var type = req.query.type;
  if (type) updateQuery['type'] = type;
  var price = req.query.price;
  if (price) updateQuery['price'] = price;
  var number = req.query.number;
  if (number) updateQuery['number'] = number;
  var date = req.query.date;
  if (date) updateQuery['date'] = date;
  Trade.update({'_id':id},updateQuery,{},function (err,result) {
    if (err) {
      return res.send(err);
    }
    return res.send({message: 'Trade updated', data: id});
  })
});

router.route('/removeTrade').post(function(req, res) {
  var id = req.query.id;
  if (!id)
    return res.send({message: 'ID needed'});
  Trade.find({ 'id':id }).remove( function  (err, result) {
    if (err) {
      return res.send(err);
    }
    Portfolio.find({ 'trade':id }).remove( function  (err, result) {
      if (err) {
        return res.send(err);
      }
      res.send({message: 'Trade deleted'});
    });
  });
});


module.exports = router;
