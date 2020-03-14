const _ = require('../../node_modules/lodash/lodash');
const jutil = require('../../node_modules/swtc-lib/cjs').Remote.utils;
var BigNumber = require('../../node_modules/bignumber.js/bignumber.js');
var fixed = 10;




// 获取交易
exports.getReceiveTransaction = async function (address,ledger,number) {
    return new Promise(async function (resolve, reject) {
    // trueWallet: "jKsToDYhqR8J8ApYucgbKcrh5C7eCHa2ed",
    // trueSecret: "shCsg6mxsiAprKPZXLoJBJx4Woa8c",
    var remote = sails.remote;

    if (Utils.isNil(remote) || !remote.isConnected()) {
        await JTServer.connect();
        remote = sails.remote;
    }

    if (Utils.isNil(remote) || !remote.isConnected()) {
        return resolve(null);
    }
    
    let options = {
        account: address,
        limit: number ,

    }       
    options.ledger_min = ledger || readBlockNumber(jt_last_index) ;
    
    let req = remote.requestAccountTx(options);
    let ret = await req.submitPromise();
    //writeBlockNumber(jt_last_index,ret.ledger_index_max);
    //console.log(ret);
    console.log("from ",ret.ledger_index_min," to ",ret.ledger_index_max);
    resolve(ret)

 });
}

//获取sequence
exports.getSequence = async function (address) {
    return new Promise(async function (resolve, reject) {
        try {
            var remote = sails.remote;

            if (Utils.isNil(remote) || !remote.isConnected()) {
                await JTServer.connect();
                remote = sails.remote;
            }

            if (Utils.isNil(remote) || !remote.isConnected()) {
                return resolve(null);
            }

            var options = {
                account: address,
                type: 'trust'
            };
            var req = remote.requestAccountInfo(options);
            var ret = await req.submitPromise();
            console.log("seq",req,ret)
            return resolve(ret.account_data.Sequence);

        } catch (err) {
            remote.disconnect();
            sails.remote = null;
            sails.log.error(new Date().toISOString(), __filename + ":", err, address);
            if(err === CONST.ERROR_WALLET_NOT_ACTIVE) {
                return resolve(err);
            }
            return resolve(null)
        }
    });
};


//获取余额
exports.getBalance = async function (address) {
    var n = 0;
    var ret = null;
    while (n < CONST.JT_RECONNECT_TIMES) {
        ret = await _balance(address);
        if (ret) {
            break;
        }
        n++;
    }
    return ret;
};


//获取account_info
exports.getAccount = async function (address) {
    var n = 0;
    var ret = null;
    while (n < CONST.JT_RECONNECT_TIMES) {
        ret = await _accountInfo(address);
        if (ret) {
            break;
        }
        n++;
    }
    return ret;
};

//提交签名内容
exports.signSubmit = async function (signTx) {
    var n = 0;
    var ret = null;
    while (n < CONST.JT_RECONNECT_TIMES) {
        ret = await _submit(signTx);
        if (ret) {
            break;
        }
        n++;
    }
    return ret;
};

//获取用户挂单列表
exports.getOrderList = async function (address) {
    var n = 0;
    var ret = null;
    while (n < CONST.JT_RECONNECT_TIMES) {
        ret = await _orders(address);
        if (ret) {
            break;
        }
        n++;
    }
    return ret;
};

//获取交易记录
exports.getTransactionList = async function (address, ledger, sequence) {
    var n = 0;
    var ret = null;
    while (n < CONST.JT_RECONNECT_TIMES) {
        ret = await _trans(address, ledger, sequence);
        if (ret) {
            break;
        }
        n++;
    }
    return ret;
};

//获取交易详情
exports.getTransactionDetail = async function (hash) {
    var n = 0;
    var ret = null;
    while (n < CONST.JT_RECONNECT_TIMES) {
        ret = await _transDetail(hash);
        if (ret) {
            break;
        }
        n++;
    }
    return ret;
};


function _process_balance(data) {
    // var swt_value = new Number(data.native.account_data.Balance) / 1000000.0;
    var swt_value = new BigNumber(data.native.account_data.Balance).dividedBy(1000000.0).toFixed(fixed);
    var freeze0 = sails.config.freezed.reserved + (data.lines.lines.length + data.orders.offers.length) * sails.config.freezed.each_freezed;
    var _data = [
        {
            value: swt_value,
            currency: CONST.CURRENCY_BASE,
            issuer: '',
            freezed: freeze0 + ''
        }
    ];
    for (var i = 0; i < data.lines.lines.length; ++i) {
        var item = data.lines.lines[i];
        var tmpBal = {
            value: item.balance,
            currency: item.currency,
            issuer: item.account,
            freezed: '0'
        };
        //var freezed = 0;
        var freezed = new BigNumber(0);
        data.orders.offers.forEach(function (off) {
            var taker_gets = jutil.parseAmount(off.taker_gets);
            if (taker_gets.currency === _data[i].currency && taker_gets.issuer === _data[i].issuer && taker_gets.currency === 'SWT') {
                //var tmpFreezed = parseFloat(_data[i].freezed) + parseFloat(taker_gets.value);
                var tmpFreezed = new BigNumber(_data[i].freezed).plus(taker_gets.value);
                //_data[i].freezed = tmpFreezed + '';
                _data[i].freezed = tmpFreezed.toFixed(fixed);
            } else if (taker_gets.currency === tmpBal.currency && taker_gets.issuer === tmpBal.issuer) {
                //freezed += parseFloat(taker_gets.value);
                freezed = freezed.plus(taker_gets.value);
            }
        });
        // tmpBal.freezed = parseFloat(tmpBal.freezed) + freezed;
        // tmpBal.freezed = tmpBal.freezed.toFixed(6) + '';

        tmpBal.freezed = freezed.plus(tmpBal.freezed);
        tmpBal.freezed = tmpBal.freezed.toFixed(fixed);

        _data.push(tmpBal);
    }
    return _data;
}

async function _balance(address) {
    return new Promise(async function (resolve, reject) {
        try {
            var remote = sails.remote;

            if (Utils.isNil(remote) || !remote.isConnected()) {
                await JTServer.connect();
                remote = sails.remote;
            }

            if (Utils.isNil(remote) || !remote.isConnected()) {
                return resolve(null);
            }

            var options = {
                account: address,
                type: 'trust'
            };

            async.parallel({
                native: async function (callback) {
                    try {
                        var req1 = remote.requestAccountInfo(options);
                        var ret = await req1.submitPromise();
                        callback(null, ret)
                    } catch (err) {
                        callback(err)
                    }
                    
                },
                lines: async function (callback) {
                    try {
                        var req2 = remote.requestAccountRelations(options);
                        var ret = await req2.submitPromise();
                        callback(null, ret)
                    } catch (err) {
                        callback(err)
                    }
                },
                orders: async function (callback) {
                    try {
                        var req3 = remote.requestAccountOffers(options);
                        var ret = await req3.submitPromise();
                        callback(null, ret)
                    } catch (err) {
                        callback(err)
                    } 
                }

            }, function (err, results) {
                if (err) {
                    sails.log.error(new Date().toISOString(), __filename + ":" + __line, err, address);
                    if(err === CONST.ERROR_WALLET_NOT_ACTIVE) {
                        return resolve(err);
                    }
                    return resolve(null);
                }
                return resolve(_process_balance(results));
            });
        } catch (err) {
            remote.disconnect();
            sails.remote = null;
            sails.log.error(new Date().toISOString(), __filename + ":" + __line, err, address);
            if(err === CONST.ERROR_WALLET_NOT_ACTIVE) {
                return resolve(err);
            }
            return resolve(null)
        }
    });
}

async function _sequence(address) {
    return new Promise(async function (resolve, reject) {
        try {
            var remote = sails.remote;

            if (Utils.isNil(remote) || !remote.isConnected()) {
                await JTServer.connect();
                remote = sails.remote;
            }

            if (Utils.isNil(remote) || !remote.isConnected()) {
                return resolve(null);
            }

            var options = {
                account: address,
                type: 'trust'
            };
            var req = remote.requestAccountInfo(options);
            var ret = await req.submitPromise();

            return resolve(ret.account_data.Sequence);

        } catch (err) {
            remote.disconnect();
            sails.remote = null;
            sails.log.error(new Date().toISOString(), __filename + ":" + __line, err, address);
            if(err === CONST.ERROR_WALLET_NOT_ACTIVE) {
                return resolve(err);
            }
            return resolve(null)
        }
    });
}

async function _accountInfo(address) {
    return new Promise(async function (resolve, reject) {
        try {
            var remote = sails.remote;

            if (Utils.isNil(remote) || !remote.isConnected()) {
                await JTServer.connect();
                remote = sails.remote;
            }

            if (Utils.isNil(remote) || !remote.isConnected()) {
                return resolve(null);
            }

            var options = {
                account: address,
                type: 'trust'
            };
            var req = remote.requestAccountInfo(options);
            var ret = await req.submitPromise();
            ret.status = 0;
            return resolve(ret);

        } catch (err) {
            remote.disconnect();
            sails.remote = null;
            sails.log.error(new Date().toISOString(), __filename + ":" + __line, err, address);
            if(err === CONST.ERROR_WALLET_NOT_ACTIVE) {
                return resolve(err);
            }
            return resolve(null)
        }
    });
}

async function _submit(signTx) {
    return new Promise(async function (resolve, reject) {
        try {
            var remote = sails.remote;

            if (Utils.isNil(remote) || !remote.isConnected()) {
                await JTServer.connect();
                remote = sails.remote;
            }

            if (Utils.isNil(remote) || !remote.isConnected()) {
                return resolve(null);
            }

            var options = {
                blob: signTx
            };
            var req = remote.buildSignTx(options);
            var ret = await req.submitPromise();

            return resolve(ret);

        } catch (err) {
            remote.disconnect();
            sails.remote = null;
            sails.log.error(new Date().toISOString(), __filename + ":" + __line, err);
            if(err === CONST.ERROR_WALLET_NOT_ACTIVE) {
                return resolve(err);
            }
            return resolve(null)
        }
    });
}

function _process_order_list(orders) {
    var _results = [];
    for (var i = 0; i < orders.length; ++i) {
        var order = orders[i];
        var _order = {};
        _order.type = order.flags === 0x00020000
            ? 'sell'
            : 'buy';
        var base = (_order.type === 'sell'
            ? order.taker_gets
            : order.taker_pays);
        base = jutil.parseAmount(base);
        var counter = (_order.type === 'sell'
            ? order.taker_pays
            : order.taker_gets);
        counter = jutil.parseAmount(counter);
        _order.pair = base.currency + (base.issuer
            ? '+' + base.issuer
            : '') + '/' + counter.currency + (counter.issuer
                ? '+' + counter.issuer
                : '');
        //_order.price = (parseFloat(counter.value) / parseFloat(base.value)).toFixed(6);
        _order.price = new BigNumber(counter.value).dividedBy(base.value).toFixed(fixed);
        // _order.amount = parseFloat(base.value).toFixed(6);
        _order.amount = new BigNumber(base.value).toFixed(fixed);
        _order.sequence = order.seq;
        _results.push(_order);
    }
    return _results;
}

async function _orders(address) {
    return new Promise(async function (resolve, reject) {
        try {
            var remote = sails.remote;

            if (Utils.isNil(remote) || !remote.isConnected()) {
                await JTServer.connect();
                remote = sails.remote;
            }

            if (Utils.isNil(remote) || !remote.isConnected()) {
                return resolve(null);
            }

            var options = {
                account: address,
                ledger: 'closed'
            };

            var req = remote.requestAccountOffers(options);
            var ret = await req.submitPromise();

            return resolve(_process_order_list(ret.offers));

        } catch (err) {
            remote.disconnect();
            sails.remote = null;
            sails.log.error(new Date().toISOString(), __filename + ":" + __line, err, address);
            if(err === CONST.ERROR_WALLET_NOT_ACTIVE) {
                return resolve(err);
            }
            return resolve(null)
        }
    });
}

async function _trans(address, ledger, sequence) {
    return new Promise(async function (resolve, reject) {
        try {
            var remote = sails.remote;

            if (Utils.isNil(remote) || !remote.isConnected()) {
                await JTServer.connect();
                remote = sails.remote;
            }

            if (Utils.isNil(remote) || !remote.isConnected()) {
                return resolve(null);
            }
            var options = {
                account: address,
                limit: CONST.RESULTS_PER_PAGE,
            }

            if(!Utils.isNil(ledger)) {
                options.marker = {
                    ledger: ledger,
                    seq: sequence
                  };
            }

            var req = remote.requestAccountTx(options);
            var ret = await req.submitPromise();

            return resolve(ret);

        } catch (err) {
            remote.disconnect();
            sails.remote = null;
            sails.log.error(new Date().toISOString(), __filename + ":" + __line, err, address);
            if(err === CONST.ERROR_WALLET_NOT_ACTIVE) {
                return resolve(err);
            }
            return resolve(null)
        }
    });
}

async function _transDetail(hash) {
    return new Promise(async function (resolve, reject) {
        try {

            if(!jutil.isValidHash(hash)) {
                return resolve(null)
            }

            var remote = sails.remote;

            if (Utils.isNil(remote) || !remote.isConnected()) {
                await JTServer.connect();
                remote = sails.remote;
            }

            if (Utils.isNil(remote) || !remote.isConnected()) {
                return resolve(null);
            }
            var options = {
                hash: hash
            }

            var req = remote.requestTx(options);
            var ret = await req.submitPromise();

            return resolve(ret);

        } catch (err) {
            remote.disconnect();
            sails.remote = null;
            sails.log.error(new Date().toISOString(), __filename + ":" + __line, err, address);
            if(err === CONST.ERROR_WALLET_NOT_ACTIVE) {
                return resolve(err);
            }
            return resolve(null)
        }
    });
};