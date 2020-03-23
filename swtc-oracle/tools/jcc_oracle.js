

var jlib = require('@swtc/lib');
var Remote = jlib.Remote;
var remote = new Remote({server: 'ws://swtcnode.jccdex.cn:5020', issuer: 'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'});

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

function getmemos(address,min){
    remote.connectPromise()
    .then(async () => {
    	    let options = {account: address,ledger_min: min};
    	    let req = remote.requestAccountTx(options);
            let response = await req.submitPromise()
            //console.log(response)
            let transactions = response.transactions;
            for (i = 0, l = transactions.length; i < l; i++){
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
               console.log(i,s)
            }
            remote.disconnect()
        }
    )
    .catch(console.error)
}

getmemos(monitor_wallet.address,15303064);