(function () {
    'use strict';

    // @ts-nocheck
    const X1 = "krd";
    const X2 = "1978";

    // Mobil uyumlu en ilkel Base64
    const encodeB64 = (s) => {
        const b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let i = 0, r = '';
        while (i < s.length) {
            let n = s.charCodeAt(i++) << 16 | s.charCodeAt(i++) << 8 | s.charCodeAt(i++);
            r += b[n >> 18 & 63] + b[n >> 12 & 63] + b[n >> 6 & 63] + b[n & 63];
        }
        return r;
    };

    const SecretLanguagePlugin = {
        name: 'SecretLanguage',
        description: 'Gizli Dil (Saf JS Sürümü)',
        version: '3.0.0',
        authors: [{ name: 'You', id: '0' }],

        onStart() {
            // Enmity hazır olana kadar bekle
            const interval = setInterval(() => {
                const e = window.enmity;
                if (e && e.patcher && (e.metro || e.modules)) {
                    clearInterval(interval);
                    
                    try {
                        const metro = e.metro || e.modules.common;
                        const MessageActions = metro.getByProps('sendMessage');

                        if (MessageActions) {
                            e.patcher.before('SecretLanguage', MessageActions, 'sendMessage', (self, args) => {
                                const message = args[1];
                                if (message && message.content && !message.content.startsWith(X1)) {
                                    let res = "";
                                    for (let i = 0; i < message.content.length; i++) {
                                        res += String.fromCharCode(message.content.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
                                    }
                                    message.content = X1 + encodeB64(res).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
                                }
                            });
                            console.log("SecretLanguage Yüklendi!");
                        }
                    } catch (err) {
                        console.error("Başlatma hatası:", err);
                    }
                }
            }, 1000);
        },

        onStop() {
            if (window.enmity && window.enmity.patcher) {
                window.enmity.patcher.unpatchAll('SecretLanguage');
            }
        }
    };

    if (window.enmity && window.enmity.plugins) {
        window.enmity.plugins.registerPlugin(SecretLanguagePlugin);
    }

})();
