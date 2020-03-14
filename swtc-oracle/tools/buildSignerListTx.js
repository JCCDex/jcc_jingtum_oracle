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

const log_json = object => console.log(JSON.stringify(object, '', 2))

//设置签名列表
const tx = remote.buildSignerListTx({
    account: a.address,
    threshold: 5,
    lists: [
        { account: a1.address, weight: 3 },
        { account: a2.address, weight: 3 },
    ]
})

remote.connectPromise()
    .then( async () => {
		await tx._setSequencePromise()
		log_json(tx.tx_json)
		console.log(`需要设置足够的燃料支持多签交易tx.setFee()`)
		tx.setFee(30000)  // 燃料
		log_json(tx.tx_json)
		let result = await tx.submitPromise(a.secret)
		console.log(result)
		log_json(result.tx_json)
		remote.disconnect()
    })
    .catch(console.error)