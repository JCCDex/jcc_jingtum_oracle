const Wallet = require('swtc-lib').Wallet;
module.exports = {


  friendlyName: 'test',


  description: 'test jingtum.',


  inputs: {

  },


  exits: {

  },


  fn: async function (inputs) {

    // All done.
    let address = sails.config.stm.wallet.address ;
    console.log(address);
    let limit_index = await Ledger_index.find({
      limit: 1,
      sort: 'createdAt DESC'
    });
    if (Utils.isNil(limit_index) ){
      limit_index = [{max_index: ""}];
      limit_index[0].max_index = sails.config.last_index ;
    }
    let _transactions = {};
    if (sails.config.test){
      let d = new Date().getTime();
      let testmemos = '"Type":"sign_for"|"tx_json":{"TransactionType":"Payment","Account":"jKsToDYhqR8J8ApYucgbKcrh5C7eCHa2ed","Destination":"jUYaanwMxMvCqmmZz6tyUtnMnmmwLaikbZ","Amount":41000000,"Sequence":323,"Fee":20,"SigningPubKey":""}|"Signer":{"Account":"jEiAtrX9qtT6jteSpPhLhZCy5PiZQ23jkh","SigningPubKey":"02AFAB78AF0D557D55822B8B6AB2F74B89B91B8FC5C3DF10D701B485AE90BD2622","TxnSignature":"3045022100E070733238F2786EAD2E61F126380F06CB2B29FB9593B8B17BB34A9080ABF14D022020AFF8F812C38F8B05E70D1AC24610D93CE58C532CF9DCD73D5C857CAF3596EC"}' ;
       _transactions = {
        account: 'jKsToDYhqR8J8ApYucgbKcrh5C7eCHa2ed',
        ledger_index_max: sails.config.last_index,
        ledger_index_min: 0,
        transactions: [
          {
            date: d,
            hash: '121612550EF1CF872AA9195B219FEC3AF810A70D971A3879955C6F4835B245A3',
            type: 'received',
            fee: '0.01',
            result: 'tesSUCCESS',
            memos: [
              {
                MemoData: testmemos
              }
            ],
            counterparty: 'jngGKZEvkKYbeXqajh4A9gbZvSuXonV2nc',
            amount: { value: '1', currency: 'SWT', issuer: '' },
            effects: [],
            balances: { SWT: 462.73312 },
            balancesPrev: { SWT: 461.73312 }
          }
          ]
        }
        console.log(_transactions);
    }else{
    //console.log(limit_index);
     _transactions = await ApiRequest.getReceiveTransaction(address,limit_index[0].max_index);
  }
    let update_last_index = await Ledger_index.updateOne({id:1}).set({max_index: _transactions.ledger_index_max});
    if (update_last_index){
      console.log("update last index",update_last_index.max_index);
    }else{
      update_last_index = await Ledger_index.create({max_index: _transactions.ledger_index_max}).fetch();
    }

    //console.log(_transactions,update_last_index);

   // 提取符合条件的交易备注返回备注 
   let tran_s = _transactions.transactions ;
   //console.log(_transactions,"transactions",tran_s[0]);
   var trans = [];
   if (!Utils.isNil(tran_s)){
    let ins = {}
    let amount = sails.config.amount ;
    for (i = 0,l = tran_s.length; i < l ;i++){
      if (tran_s[i].type == 'received' ){
 
      ins = {} ;
      ins.date =  tran_s[i].date ;
      ins.hash =  tran_s[i].hash ;
      ins.type =  tran_s[i].type ;
      ins.result =  tran_s[i].result ;
      ins.memos =  tran_s[i].memos[0].MemoData ;
      ins.counterparty =  tran_s[i].counterparty ;
      ins.amount_value =  Number(tran_s[i].amount.value) ;
      ins.amount_currency =  tran_s[i].amount.currency ;
      ins.amount_issuer =  tran_s[i].amount.issuer ;
      //console.log("insupdate",ins,tran_s[i].memos);
      await Transactions_list.create(ins)
      //console.log(i);
 
      }
    }
     let last_time = limit_index[0].last_date || 0 ;
     trans = await Transactions_list.find({
       where: {or: amount ,
       'date': { '>=': last_time } },
       sort: 'date DESC'
     });
     //console.log(trans);
     if ( !Utils.isNil(trans)){
       await Ledger_index.update({max_index: _transactions.ledger_index_max}).set({'last_date':trans[0].date});

       // todo 解密memos 
       
       // 插入memos_list
       var ar1 = {};
       var ar2 = {};
       for(i = 0, l = trans.length ; i < l ; i++){
         if (typeof trans[i].memos == 'string'){
           if ( trans[i].memos.includes("sign_for")){
            let arr = trans[i].memos.split('|');
            //console.log(arr[0]);
            //let ar0 = JSON.parse('{' + arr[0] + '}');
            ar1 = JSON.parse('{' + arr[1] + '}');
            ar2 = JSON.parse('{' + arr[2] + '}');
            console.log(arr,ar1,ar2);
           }
           // 检查备注内钱包合法性
           if (Wallet.isValidAddress(ar1.tx_json.Account) && Wallet.isValidAddress(ar1.tx_json.Destination) && Wallet.isValidAddress(ar2.Signer.Account)){
            console.log({code:0,mes:'地址合法'});
          }else{
            
            console.log({code:6001,mes:'地址不合法'});
            break;
          }
          
          // 检查sequence 
          let now_sequence = await ApiRequest.getSequence(ar1.tx_json.Account);
          //console.log(now_sequence);
          if ( now_sequence > ar1.tx_json.Sequence){
            console.log({code: 6002,mes: 'sequence 过期'});
          }

          //校验签名
          ar1.Signer = ar2.Signer;
          Utils.verifyTx(ar1.tx_json,ar2.Signer);
          //let seq_n = await Utils.getSequence(ar1.Account);
         }
          
       }
     }
     
     
   }

    return;

  }


};
