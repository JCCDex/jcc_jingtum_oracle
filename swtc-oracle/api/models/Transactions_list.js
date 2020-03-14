/**
 * Transactions_list.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    date: { type: 'number'},
    hash: {type: 'string',required: true,unique: true},
    type: {type: 'string',required: true},
    result: {type: 'string',required: true},
    memos: {type: 'string'},
    counterparty: {type: 'string'},
    amount_value: {type: 'number'},    
    amount_currency: {type: 'string'},
    amount_issuer: {type: 'string'},
  },

};

