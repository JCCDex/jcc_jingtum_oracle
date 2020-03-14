const jlib = require("../node_modules/@swtc/lib/cjs");
var Remote = jlib.Remote;
var remote = new Remote({server: 'ws://snmec391023b509.jccdex.cn:5020'})
const a = {
    secret: 'spvySgsM4GtQJ4Smn8oB4ZPWVdzYV',
    address: 'jUrxVYh2ggyFDLpsajzS3Kn97A2BRV1ExK'
  };
const a1 = {
    secret: 'ssBJJUvRmGtPz6jjWvnBhQkFuST93',
    address: 'jwJRBK8VycKzV3zK8DpB7h6q4dvMVGty3'
  };
const a2 = {
    secret: 'sn4XDiaSgRbe6zNmcmUcmdTgqou1A',
    address: 'j9DeMYibu41jMMqUszhR3VsANesnwxF4wW'
  };

let to = 'jKsToDYhqR8J8ApYucgbKcrh5C7eCHa2ed'
const log_json = object => console.log(JSON.stringify(object, '', 2))

// 创建支付交易
let tx = remote.buildPaymentTx({ account: a.address, to, amount: remote.makeAmount(1) })
tx.addMemo('multisigned payment test');
//console.log("tx-json",remote.makeAmount(1) ,tx);
let str = lstx.tx_json.replace(/[\r\n]/g,"");
console.log(str);
/**
remote.connectPromise()
    .then( async () => {
		// 设置sequence
		await tx._setSequencePromise()
		console.log(`需要设置足够的燃料支持多签交易tx.setFee()`)
		tx.setFee(20000)  // 燃料
		log_json(tx.tx_json)
        tx = tx.multiSigning(a1)
		log_json(tx.tx_json)
		// tx.tx_json 需要依次传递给不同的多签方
		let tx_json = tx.tx_json
		// 然后重组成tx
		let tx2 = remote.buildMultisignedTx(tx_json)
        tx2.multiSigning(a2)
		log_json(tx2.tx_json)
        tx2.multiSigned()
		log_json(tx2.tx_json)
		let result = await tx2.submitPromise() // multisign submit does not need any secret
		console.log(result)
		log_json(result.tx_json)
		remote.disconnect()
    })
    .catch(console.error)

 */