// 创建所需要的交易备份

const JingchangWallet = require("jcc_wallet/lib").JingchangWallet;
var UUID = require('uuid');
const jlib = require("@swtc/lib");
var Remote = jlib.Remote;
var remote = new Remote({server: 'ws://snteb67f78daddb.jccdex.cn:5020'})
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
var memo = 'multisigned payment test' ;


var tx = remote.buildPaymentTx({ account: a.address, to, amount: remote.makeAmount(1) })
tx.addMemo(memo);



//构建备注
function buildMemo(tx_json,Signer){

		let memo = '"tx_json":' + JSON.stringify(tx_json) + '|"Signer":' + JSON.stringify(Signer);
    return memo;

}		

//

// 将备注分段打包
function cutMemo(str){
  //console.log("cutMemo:",str,str.substring(0,190))
	let len = 190
	let start = 0;
	let end = 0;
	let arr = [];
  for ( i = 0;i < 100; i++ ) {
		start = i * len ;
    end = (i + 1) * len;
		arr[i] = str.substring(start ,end)
		if ( arr[i] == ''){
			break;
		}

	}
	arr.pop();
	let newArr = [];
	let uuid = UUID.v1();
	 uuid = uuid.replace(/-/g, "");
	 uuid = uuid.substring(0,32)
  for ( i = 0 ,l = arr.length ; i < l ; i++){
  newArr[i] = "sign_for|" + uuid + "|" + i + "|" + l + "|" + arr[i]
	}
	//console.log("arr",newArr);
	return newArr ;

}

//

function send(memo) {
  return new Promise(async function(resolve, reject) {
		let tx_a1 = null ;

			tx_a1 = remote.buildPaymentTx({ account: a1.address, to, amount: remote.makeAmount(0.00001) });
			tx_a1.addMemo(memo);

			let response = await tx_a1.submitPromise(a1.secret);
			console.log(memo,response);
      resolve(response);
		
  });
}
async function main(){
  console.log("main");
	let tx = await createTx('multisigned payment test');
	console.log("test",tx.tx_json);
	let s = buildMemo(tx.tx_json,"testest");
	console.log(s);
 
};
//main();
//console.log("111111");

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
		let signer = tx_json.Signers[0].Signer
		delete tx_json.Signers ;
		let message = buildMemo(tx_json,signer);
		
		// 加密备注
		let keypair = JingchangWallet.deriveKeyPair(a.secret);
		
		let encode = await JingchangWallet.encryptWithPublicKey(message, keypair.publicKey);
		let decode = await JingchangWallet.decryptWithPrivateKey(encode, keypair.privateKey);
		//console.log(JSON.stringify(encode));
		let memos = cutMemo(JSON.stringify(encode));
		console.log(memos)
   for ( i = 0 ,l = memos.length; i < l; i++ ){
		 console.log(i,l);
	 	await send(memos[i]);
	 }


		//console.log(keypair,message,encode,decode);
		// 然后重组成tx
		//let tx2 = remote.buildMultisignedTx(tx_json)
    //    tx2.multiSigning(a2)
		//log_json(tx2.tx_json)
    //    tx2.multiSigned()
		//log_json(tx2.tx_json)
		//let result = await tx2.submitPromise() // multisign submit does not need any secret
		//console.log(result)
		//log_json(result.tx_json)
		//remote.disconnect()
    })
    .catch(console.error)
//let str = lstx.tx_json.replace(/[\r\n]/g,"");
//console.log(str);
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