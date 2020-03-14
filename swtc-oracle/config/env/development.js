module.exports = {

    stm: {
        wallet: {
                address: "jKsToDYhqR8J8ApYucgbKcrh5C7eCHa2ed",
                secret: "shCsg6mxsiAprKPZXLoJBJx4Woa8c"
            },
        m1: {
            secret: 'spvySgsM4GtQJ4Smn8oB4ZPWVdzYV',
            address: 'jUrxVYh2ggyFDLpsajzS3Kn97A2BRV1ExK'
          },
        s1: {
            secret: 'ssBJJUvRmGtPz6jjWvnBhQkFuST93',
            address: 'jwJRBK8VycKzV3zK8DpB7h6q4dvMVGty3'
          },
        s2: {
            secret: 'sn4XDiaSgRbe6zNmcmUcmdTgqou1A',
            address: 'j9DeMYibu41jMMqUszhR3VsANesnwxF4wW'
          },       
            fee: 0.005
        },
        amount: [{
            amount_currency: "SWT",
            amount_issuer: "",
            amount_value: {'>=': 0.1}
          },{
            amount_currency: "JFST",
            amount_issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
            amount_value: {'>=': 0.1}
          }],
          last_index: '14627192',
          test: true,
    ws_api: {
        skywell_server_info: [
            {
                server: 'ws://snmec391023b509.jccdex.cn:5020',
                local_sign: false,
                issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or'
            }]
    }
    /**
    MOAC: {
        node: 'https://mtnode1.jccdex.cn',
        production: true,
        network : 101
    },
    moac_Chain_options: {
        wallet: {
            "address": "0xc449baadff0bdbbc55033da0c573ef8aa8ebaf11",
            "secret": "0xe23d7d840a2a59d2f4aca99a87e9b784a36e39475ac0836204862a202136d1d7"
          },
        dest: {
            "address": "0x8c9791d32c36215555701c848ce72389bfedc2d4",
            "secret": "0x859118ab59be0b02eb69e6071fca681b0e874771ce01395746f5216662ca97f5"
          },
        amount: 0.001,
        gasPrice: 20000000000,
        gasLimit: 20000
    }
     */
};