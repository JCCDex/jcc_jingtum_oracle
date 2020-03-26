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
	//	console.log(memos)
   for ( i = 0 ,l = memos.length; i < l; i++ ){
		 console.log(i,l);
		 //await send('sign_for|770de9506db511eabc95d76c165bc4cb|0|8|{"ciphertext":"9a9f0c2744dc061203be2c7b9708a7c11f7c09940d5e7ff6bafe3be2fe998861c411dd2b19520736d27626df20691c75ed430bd85320d15cdc65fcbac21dae209b87bd0c01411e5f4ac1e51a9d793edf6b407691da5184d');
		 /**
			* [
  'sign_for|770de9506db511eabc95d76c165bc4cb|0|8|{"ciphertext":"9a9f0c2744dc061203be2c7b9708a7c11f7c09940d5e7ff6bafe3be2fe998861c411dd2b19520736d27626df20691c75ed430bd85320d15cdc65fcbac21dae209b87bd0c01411e5f4ac1e51a9d793edf6b407691da5184d',
  'sign_for|770de9506db511eabc95d76c165bc4cb|1|8|37d7f693a481ec66a76bb04c88ea1feb87b1e4f4fdebe8d59631e4acf2c0f4246d424b36ae8ed93f9c50ce511be455692291d3b74d543c668c45f2ce503de6a2820861d31bc358ac06ddf18b7dea1d39b8c6d0c4270a3026b5fc1017420465',
  'sign_for|770de9506db511eabc95d76c165bc4cb|2|8|ec3d36cc714b31579ea36268ba37877ff45637323d42167388017e994b3cd53bd813477606dbe46f4fa2859aa79b44bca7f7841920d638754987495f0db626a38aa62bc21d49c38f4b052dfdaf3fd9e19a4fa617b1e0ac9d3c233bd2564fad',
  'sign_for|770de9506db511eabc95d76c165bc4cb|3|8|ac17ff5aa877a3f9bf3fab3fe8d8bb29d40dda653eaf27ba75e107ec93ec698b30cc7d6ac49861b17204e934ab2e1b01a7ca9316ebd5240ecf4ddf6ef140adb2c5aa5adb82d0651813cfb61d37862ed2fc9997bec9ad36333899566c2eecb4',
  'sign_for|770de9506db511eabc95d76c165bc4cb|4|8|af1635e8a60b81adace96ac22446a54d60c091db406ea683e4c4eb90b9cfafa4881b511b05b92951a32cd7fc4977639a308fb91f950636b966df0ac42ff3a543d94763c80e0759fa173f219a54d6c38632c7f02dc13a0c6ea44970027924c8',
  'sign_for|770de9506db511eabc95d76c165bc4cb|5|8|3588b24dd9df91a7c3dee3dd950a54e8c23931f650c1860f1f224a27e8d6683ad54ded081538a83848470857793ea38843374f2ff2f5196c71bf1ac801a4c2273f168dd4579818bb61cc65b783317734040042b75ec92a974752a7ebc65c8d',
  'sign_for|770de9506db511eabc95d76c165bc4cb|6|8|7c7b70474372a8ea454de23a0e0","ephemPublicKey":"04d5914cc4cc59a1f6f865be7a4500d48c8cb296877c5fb62c611078ce1b85f2d50616f94dd3d9f999868b9fbed1ae212ddd846e79d7371f76a0ec651310ddb2a6","iv":"47b3f',
  'sign_for|770de9506db511eabc95d76c165bc4cb|7|8|855bb2a6573306a1f8ea178d5b5","mac":"a97145f9ffdce97c29f3e5e143ee124432adbb8ea13878f94804fb311d65bf06"}'
]
		  */
	 }
    let m = [
			'sign_for|770de9506db511eabc95d76c165bc4cb|0|8|{"ciphertext":"9a9f0c2744dc061203be2c7b9708a7c11f7c09940d5e7ff6bafe3be2fe998861c411dd2b19520736d27626df20691c75ed430bd85320d15cdc65fcbac21dae209b87bd0c01411e5f4ac1e51a9d793edf6b407691da5184d',
			'sign_for|770de9506db511eabc95d76c165bc4cb|1|8|37d7f693a481ec66a76bb04c88ea1feb87b1e4f4fdebe8d59631e4acf2c0f4246d424b36ae8ed93f9c50ce511be455692291d3b74d543c668c45f2ce503de6a2820861d31bc358ac06ddf18b7dea1d39b8c6d0c4270a3026b5fc1017420465',
			'sign_for|770de9506db511eabc95d76c165bc4cb|2|8|ec3d36cc714b31579ea36268ba37877ff45637323d42167388017e994b3cd53bd813477606dbe46f4fa2859aa79b44bca7f7841920d638754987495f0db626a38aa62bc21d49c38f4b052dfdaf3fd9e19a4fa617b1e0ac9d3c233bd2564fad',
			'sign_for|770de9506db511eabc95d76c165bc4cb|3|8|ac17ff5aa877a3f9bf3fab3fe8d8bb29d40dda653eaf27ba75e107ec93ec698b30cc7d6ac49861b17204e934ab2e1b01a7ca9316ebd5240ecf4ddf6ef140adb2c5aa5adb82d0651813cfb61d37862ed2fc9997bec9ad36333899566c2eecb4',
			'sign_for|770de9506db511eabc95d76c165bc4cb|4|8|af1635e8a60b81adace96ac22446a54d60c091db406ea683e4c4eb90b9cfafa4881b511b05b92951a32cd7fc4977639a308fb91f950636b966df0ac42ff3a543d94763c80e0759fa173f219a54d6c38632c7f02dc13a0c6ea44970027924c8',
			'sign_for|770de9506db511eabc95d76c165bc4cb|5|8|3588b24dd9df91a7c3dee3dd950a54e8c23931f650c1860f1f224a27e8d6683ad54ded081538a83848470857793ea38843374f2ff2f5196c71bf1ac801a4c2273f168dd4579818bb61cc65b783317734040042b75ec92a974752a7ebc65c8d',
			'sign_for|770de9506db511eabc95d76c165bc4cb|6|8|7c7b70474372a8ea454de23a0e0","ephemPublicKey":"04d5914cc4cc59a1f6f865be7a4500d48c8cb296877c5fb62c611078ce1b85f2d50616f94dd3d9f999868b9fbed1ae212ddd846e79d7371f76a0ec651310ddb2a6","iv":"47b3f',
			'sign_for|770de9506db511eabc95d76c165bc4cb|7|8|855bb2a6573306a1f8ea178d5b5","mac":"a97145f9ffdce97c29f3e5e143ee124432adbb8ea13878f94804fb311d65bf06"}'
		]
		//await send(m[7]);

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