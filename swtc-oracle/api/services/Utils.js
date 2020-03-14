//import { tx_json_filter, normalize_memo } from "@swtc/common"
const  SerializerFactory = require("../../node_modules/@swtc/serializer/cjs").Factory;
const  WalletFactory = require("../../node_modules/@swtc/wallet/cjs").Factory;
const { HASHPREFIX, tx_json_filter, normalize_memo} = require('../../node_modules/@swtc/common/cjs');

//
exports._return = function (_obj, data) {
    return { code: _obj.code, msg: _obj.msg, data: data };
};

/**
 * @description :: 判断是否为空对象
 * @param obj 数据对象
 * @return userInfo
 */
exports.isNil = function (obj) {
    if (typeof (obj) === "undefined" || obj == null || obj == {}) {
        return true
    }
    var tmp = String(obj);
    if (tmp.length === 0) {
        return true;
    }

    return false
};




exports.verifyTx = function (tx_json,Signer) {
    // 验签
    const Wallet = WalletFactory("jingtum")
    const jser = SerializerFactory(Wallet)
    const tx_json_new = JSON.parse(JSON.stringify(tx_json))
    const signers = tx_json_new.Signers || []
    delete tx_json_new.Signers
    //tx_json_filter(tx_json_new)
    //normalize_memo(tx_json_new, true)
    //console.log(tx_json_new,signers,tx_json_filter(tx_json_new));
     

        const s = Signer
        
        let message
        let blob = jser.from_json(tx_json_new)
        blob = jser.adr_json(blob, s.Account)
        


        if (s.SigningPubKey.slice(0, 2) === "ED") {
          // ed25519
          message = `${HASHPREFIX.transactionMultiSig
            .toString(16)
            .toUpperCase()}${blob.to_hex()}`
        } else {
          message = blob.hash(HASHPREFIX.transactionMultiSig)
        }
        console.log(blob,message);
        if (
          // todo: check format of pubkey is needed
          !Wallet.checkTx(message, s.TxnSignature, s.SigningPubKey)
        ) {
            console.log('false');
          return false
        }
 
    return true
    
  }


