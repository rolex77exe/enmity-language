(function(Patcher,metro,common,commands){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}const X1 = "krd";
const X2 = "1978";
function toBase64Url(input) {
    const textEncoder = new TextEncoder();
    const key = textEncoder.encode(X2);
    const data = textEncoder.encode(input);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ key[i % key.length];
    }
    let binary = "";
    for (let i = 0; i < result.length; i++)
        binary += String.fromCharCode(result[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function encodeSecret(content) {
    return `${X1}${toBase64Url(content)}`;
}
let isSecretEnabled = false;
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil eklentisi',
    version: '1.0.0',
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
            }
            commands.registerCommands('SecretLanguage', [{
                    name: 'secret',
                    description: 'Gizli dili aç/kapat',
                    type: commands.ApplicationCommandType.Chat,
                    inputType: commands.ApplicationCommandInputType.BuiltIn,
                    execute() {
                        isSecretEnabled = !isSecretEnabled;
                        if (common.Dialog && common.Dialog.show) {
                            common.Dialog.show({
                                title: 'Secret Language',
                                body: `Gizli dil şu an: ${isSecretEnabled ? 'AÇIK' : 'KAPALI'}`,
                                confirmText: 'Tamam'
                            });
                        }
                    },
                }]);
        }
        catch (err) {
            console.error("Eklenti hatasi:", err);
        }
    },
    onStop() {
        if (Patcher__namespace && Patcher__namespace.unpatchAll) {
            Patcher__namespace.unpatchAll('SecretLanguage');
        }
    },
};
registerPlugin(SecretLanguagePlugin);})(enmity.patcher,enmity.metro,enmity.modules.common,enmity.commands);
