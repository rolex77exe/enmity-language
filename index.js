(function(Patcher,metro,commands){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}const X1 = "krd";
const X2 = "1978";
// Kripto fonksiyonu (En basit ve hatasız hali)
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
let isSecretEnabled = false;
const SecretLanguagePlugin = {
    name: 'SecretLanguageFix',
    description: 'Gizli Dil (Sadece Komut Modu - En Stabil)',
    version: '1.1.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        // Discord'un tamamen yüklenmesi için 2 saniye bekle (Crash önleyici)
        setTimeout(() => {
            try {
                const MessageActions = metro.getByProps('sendMessage');
                if (MessageActions) {
                    Patcher__namespace.before('SecretLanguageFix', MessageActions, 'sendMessage', (_self, args) => {
                        const [, message] = args;
                        if (isSecretEnabled && message?.content && !message.content.startsWith(X1)) {
                            message.content = encodeSecret(message.content);
                        }
                    });
                }
                // Komut kaydı
                commands.registerCommands('SecretLanguageFix', [{
                        name: 'secret',
                        description: 'Gizli dili aç/kapat',
                        type: commands.ApplicationCommandType.Chat,
                        inputType: commands.ApplicationCommandInputType.BuiltIn,
                        execute() {
                            isSecretEnabled = !isSecretEnabled;
                            return { content: `Gizli dil şu an: ${isSecretEnabled ? 'AÇIK 🔒' : 'KAPALI 🔓'}` };
                        },
                    }]);
            }
            catch (err) {
                console.error("Fix hatasi:", err);
            }
        }, 2000);
    },
    onStop() {
        try {
            Patcher__namespace.unpatchAll('SecretLanguageFix');
        }
        catch (e) { }
    },
};
registerPlugin(SecretLanguagePlugin);})(enmity.patcher,enmity.metro,enmity.commands);
