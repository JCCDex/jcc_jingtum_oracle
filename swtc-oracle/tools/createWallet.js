var jlib = require('../node_modules/@swtc/lib/cjs');
var Wallet = jlib.Wallet;
//方式一
var w1 = Wallet.generate();

console.log(w1);
//方式二
//var w2 = Wallet.fromSecret('ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C');
//console.log(w2);