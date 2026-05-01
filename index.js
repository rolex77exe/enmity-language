(function(plugins,Patcher,metro,common){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);const X1 = "krd";
const X2 = "1978";
function encodeSecret(input) {
    const textEncoder = new TextEncoder();
    const key = textEncoder.encode(X2);
    const data = textEncoder.encode(input);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++)
        result[i] = data[i] ^ key[i % key.length];
    let binary = "";
    for (let i = 0; i < result.length; i++)
        binary += String.fromCharCode(result[i]);
    return `${X1}${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
}
const SecretLanguagePlugin = {
    name: 'EnmitySecret',
    description: 'Gizli Dil (En Stabil Sürüm)',
    version: '2.0.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        try {
            const MessageActions = metro.getByProps('sendMessage');
            if (MessageActions) {
                Patcher__namespace.before('EnmitySecret', MessageActions, 'sendMessage', (_self, args) => {
                    const [, message] = args;
                    if (message && message.content && !message.content.startsWith(X1)) {
                        message.content = encodeSecret(message.content);
                    }
                });
                // Başlangıç bildirimi
                if (common.Toasts && common.Toasts.open) {
                    common.Toasts.open({ content: "Gizli Dil Aktif!" });
                }
            }
            else {
                console.log("EnmitySecret: MessageActions bulunamadı");
            }
        }
        catch (err) {
            console.error("EnmitySecret Hata:", err);
        }
    },
    onStop() {
        Patcher__namespace.unpatchAll('EnmitySecret');
    }
};
plugins.registerPlugin(SecretLanguagePlugin);})(enmity.plugins,enmity.patcher,enmity.metro,enmity.modules.common);
