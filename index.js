(function(Patcher,metro,common){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}const X1 = "krd";
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
let isSecretEnabled = true; // Test için her zaman açık
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil (Vencord Uyumlu)',
    version: '1.3.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        try {
            const MessageActions = metro.getByProps('sendMessage');
            if (MessageActions) {
                Patcher__namespace.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                    const [, message] = args;
                    if (isSecretEnabled && message && message.content && !message.content.startsWith(X1)) {
                        message.content = encodeSecret(message.content);
                    }
                });
                common.Toasts.open({ content: "SecretLanguage Yüklendi! (Her mesaj şifrelenecek)" });
            }
        }
        catch (err) {
            common.Toasts.open({ content: "HATA: " + err });
        }
    },
    onStop() {
        Patcher__namespace.unpatchAll('SecretLanguage');
    }
};
registerPlugin(SecretLanguagePlugin);})(enmity.patcher,enmity.metro,enmity.modules.common);
