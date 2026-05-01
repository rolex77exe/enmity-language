(function(Patcher,metro,common,commands){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}const X1 = "krd";
const X2 = "1978";
// Kripto Fonksiyonları
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
    description: 'Gizli Dil eklentisi (Hediye Butonu Yerine)',
    version: '1.0.7',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        try {
            const MessageActions = metro.getByProps('sendMessage');
            const ChatInput = metro.getByProps('ChatInput');
            const { TouchableOpacity, Text } = metro.getByProps('TouchableOpacity', 'Text');
            // 1. Mesaj Gönderme Patch'i
            if (MessageActions) {
                Patcher__namespace.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                    const [, message] = args;
                    if (isSecretEnabled && message && message.content && !message.content.startsWith(X1)) {
                        message.content = encodeSecret(message.content);
                    }
                });
            }
            // 2. Hediye Butonunu Değiştirme Patch'i
            if (ChatInput && TouchableOpacity) {
                Patcher__namespace.after('SecretLanguage', ChatInput, 'default', (_self, _args, res) => {
                    const SecretButton = () => {
                        const [enabled, setEnabled] = common.React.useState(isSecretEnabled);
                        return (common.React.createElement(TouchableOpacity, { onPress: () => {
                                isSecretEnabled = !isSecretEnabled;
                                setEnabled(isSecretEnabled);
                                common.Toasts.open({ content: `Gizli Dil: ${isSecretEnabled ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                            }, onLongPress: () => {
                                common.Dialog.show({
                                    title: 'Gizli Dil Ayarları',
                                    body: `Gizli dil şu an ${isSecretEnabled ? 'aktif' : 'pasif'}. Kapatmak için dokunun.`,
                                    confirmText: 'Tamam'
                                });
                            }, style: { padding: 8, justifyContent: 'center', alignItems: 'center' } },
                            common.React.createElement(Text, { style: { fontSize: 20 } }, enabled ? '🔒' : '🔓')));
                    };
                    try {
                        // ChatInput içindeki butonları bul
                        const children = res?.props?.children?.props?.children || res?.props?.children;
                        if (Array.isArray(children)) {
                            // Hediye butonu (Gift) genellikle listenin başlarında olur. 
                            // Onu bulup kendi butonumuzla değiştirmeye çalışalım veya direkt başa ekleyelim.
                            // Hediye butonu kalabalık yapmasın diye onu filtreleyebiliriz (opsiyonel)
                            children.unshift(common.React.createElement(SecretButton, null));
                        }
                    }
                    catch (e) { }
                    return res;
                });
            }
            // 3. Komut Kaydı
            commands.registerCommands('SecretLanguage', [{
                    name: 'secret',
                    description: 'Gizli dili aç/kapat',
                    type: commands.ApplicationCommandType.Chat,
                    inputType: commands.ApplicationCommandInputType.BuiltIn,
                    execute() {
                        isSecretEnabled = !isSecretEnabled;
                        common.Dialog.show({ title: 'Secret Language', body: `Gizli dil şu an: ${isSecretEnabled ? 'AÇIK' : 'KAPALI'}`, confirmText: 'Tamam' });
                    },
                }]);
        }
        catch (err) {
            console.error("Eklenti hatasi:", err);
        }
    },
    onStop() {
        Patcher__namespace.unpatchAll('SecretLanguage');
    },
};
registerPlugin(SecretLanguagePlugin);})(enmity.patcher,enmity.metro,enmity.modules.common,enmity.commands);
