var jingtum = require('../../node_modules/swtc-lib/cjs');

module.exports = {
    connect: function () {
        return new Promise(async function (resolve, reject) {
            var jtServer = sails.config.ws_api.skywell_server_info[Math.floor(Math.random() * sails.config.ws_api.skywell_server_info.length)];
            var remote = new jingtum.Remote(jtServer);
            remote.connectPromise().then(server_info => {
                sails.remote = remote;
                console.log((new Date()).toISOString() + ' success connect jingtum server:', jtServer.server);
                remote.on('disconnect', function () {
                    console.log((new Date()).toISOString() + ' disconnect to jingtum server:', jtServer.server);
                });

                remote.on('reconnect', function () {
                    console.log((new Date()).toISOString() + ' reconnect to jingtum server:', jtServer.server);
                });
                return resolve(true);
            }).catch(error => {
                console.log((new Date()).toISOString() + ' fail connect jingtum server:', jtServer.server, ', error:', error);
                return resolve(false);
            })
        });
    }
};
