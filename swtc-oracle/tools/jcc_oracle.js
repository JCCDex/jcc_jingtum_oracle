

var jlib = require('@swtc/lib');
const JingchangWallet = require("jcc_wallet/lib").JingchangWallet;
const Wallet = require('@swtc/lib').Wallet
var fs = require('fs');
var Remote = jlib.Remote;
var remote = new Remote({server: 'ws://swtcnode.jccdex.cn:5020', issuer: 'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'});

const a = {
    secret: 'spvySgsM4GtQJ4Smn8oB4ZPWVdzYV',
    address: 'jUrxVYh2ggyFDLpsajzS3Kn97A2BRV1ExK'
  };
arg = {
    
    limttokenA: {
        token: 'SWT',
        value: 0
    },
    limttokenB: {
        token: 'JJCC',
        value: 0
    },
    head: 'sign_for'
}
monitor_wallet = {
    address: "jKsToDYhqR8J8ApYucgbKcrh5C7eCHa2ed",
    secret: "shCsg6mxsiAprKPZXLoJBJx4Woa8c"
}

var data_dir = './data'
var encode_file = data_dir + '/encode_memos.json'
var tx_dir = data_dir + '/tx'

var readFile = function (fileName){
    return new Promise(function (resolve, reject){
      fs.readFile(fileName, function(error, data){
        if (error) reject(error);
        resolve(data);
      });
    });
};

var writeFile = function (fileName,str){
    return new Promise(function (resolve, reject){
      fs.writeFile(fileName, str,function(error){
        if (error) reject(error);
        
      });
    });
};
function isNil(obj) {
    if (typeof (obj) === "undefined" || obj == null || obj == {}) {
        return true
    }
    var tmp = String(obj);
    if (tmp.length === 0) {
        return true;
    }

    return false
};

function checkdata(encode){
    for (k = 0;k < encode.total ; k++){
        if(isNil(encode.data[k])){
            return false;
        }
      }
      return true;
};

// 检查交易内容
function checkTx(t){

 
 if( isNil(t) && isNil(t.Account) && isNil(t.Sequence) && isNil(t.Destination) ){
   console.log("交易内容不合法");
   return false ;
 }
 
 if(!Wallet.isValidAddress(t.Account) && !Wallet.isValidAddress(t.Destination)){
     console.log("地址不合法");
    return false ; 
 }
//console.log(t);
 return true ;
//console.log(txjson,Wallet.isValidAddress(t.Account) );

}

// 查询数组某个字典属性对应的值
function arrindexof(arr,arv,value){
    let num =0
    for ( n = 0, m = arr.length; n < m; n++){
        if( m == 0){
         console.log(m);
         num = m ;
         //break;
        }
        if( arr[n][arv]== value){
           // console.log("n",n);
           num = n;
            //break;
        }else{
            num = m ;
        }
    }
   return num;
}

// 存储解密后的交易内容
async function  txJsonHandle(tx){
  let txArr = tx.split('|');
  let txjson1 = JSON.parse("{"+txArr[0]+"}");
  txjson = txjson1.tx_json;
 if(!checkTx(txjson)){
     return false;
 }
//console.log(txArr[0],txArr);

// 读取对应Account的钱包地址的文件
  let f_path = tx_dir + "/" + txjson.Account
  let f_data = [];
  if (fs.existsSync(f_path)){
    let tempdata = await readFile(f_path); 
    f_data = JSON.parse(tempdata);
  }
  
  let num = arrindexof(f_data,"Sequence",txjson.Sequence);
  
  //console.log(num,f_data);
  if(isNil(f_data[num])){
    f_data[num] = {};
    f_data[num].tx_json = {};
  }
  
  let Signers = f_data[num].tx_json.Signers || [];
  Signers.push(JSON.parse("{"+txArr[1]+"}"));
  f_data[num].tx_json = txjson ;
  f_data[num].tx_json.Signers = Signers;
  f_data[num].Sequence = txjson.Sequence;
  console.log(f_data[num]);
  await writeFile(f_path,JSON.stringify(f_data));
} 

// 获取交易信息，解密备注信息
function getmemos(address,min){
    remote.connectPromise()
    .then(async () => {
    	    let options = {account: address,ledger_min: min};
    	    let req = remote.requestAccountTx(options);
            let response = await req.submitPromise()
            //console.log(response)
            let transactions = response.transactions;
            let l = transactions.length;
            if (l == 0){
                console.log("no transactions---");
                return false;
            }
            var encode_list1 = await readFile(encode_file);
            //console.log(encode_list1);
            var encode_list = JSON.parse(encode_list1);
            for (i = 0; i < l; i++){
                // 排除不符条件的交易
               if(transactions[i].type != 'received'){
                   console.log(transactions[i].type);
                   continue;
               }
               if(!transactions[i].amount.currency == arg.limttokenA.token && transactions[i].amount.value + 1 > 1 + arg.limttokenA.value ){
                   console.log(arg.limttokenB.token,i,transactions[i].amount);
                   continue;
               }
               if(!transactions[i].amount.currency == arg.limttokenB.token && transactions[i].amount.value + 1 > 1 + arg.limttokenB.value){
                   console.log(arg.limttokenB.token,i,transactions[i].amount);
                   continue;
               }
               let s = transactions[i].memos[0].MemoData.split("|");
               if(s[0] != arg.head){
                 continue; 
               }
                
               // 将交易备注按照转账地址和uuid分别存储起来

               /**
                * {address: transactions[i].counterparty,
                *  uuid: s[1],
                *  total: Number(s[2])],
                *  data:[] }
                */

               let num = 0;
               for ( n = 0, m = encode_list.length; n < m; n++){
                   if( m == 0){
                    console.log(l);
                    num = m ;
                    //break;
                   }
                   if(encode_list[n].address == transactions[i].counterparty && encode_list[n].uuid == s[1]){
                      // console.log("n",n);
                       num = n;
                       //break;
                   }else{
                       num = m ;
                   }
               }

               encode_list[num] = encode_list[num] || {};
               let tempdata = encode_list[num].data || [];
               tempdata[Number(s[2])] = s[4];
               
               encode_list[num].address = transactions[i].counterparty;
               encode_list[num].uuid = s[1];
               encode_list[num].total = s[3];
               encode_list[num].data = tempdata;

               //data[Number(s[2])] = s[4];
               //let temp = {total:s[3],data: data[Number(s[2])]}
               //console.log(i,s,transactions[i].counterparty,tempdata,encode_list,encode_list[num].data.length )
               if(checkdata(encode_list[num])){
                   let encodeString = encode_list[num].data.join('');
                   let keypair = JingchangWallet.deriveKeyPair(a.secret);
		
                   let encode = JSON.parse(encodeString);
                   let decode = await JingchangWallet.decryptWithPrivateKey(encode, keypair.privateKey);
                   //console.log(i,"jiqi",encodeString,decode);
                   txJsonHandle(decode);
                   console.log(encode_list);
                   encode_list.splice(num,1);
               }

            }
            console.log(encode_list);
            // 写入加密数据的保存文件
            await writeFile(encode_file,JSON.stringify(encode_list));
            remote.disconnect()
        }
    )
    .catch(console.error)
}

getmemos(monitor_wallet.address,15519787);