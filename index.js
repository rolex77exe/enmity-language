(function(Patcher,metro,common,commands){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}const X1 = "krd";
const X2 = "1978";
// Kripto Fonksiyonları (Vencord Uyumlu)
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
function fromBase64Url(input) {
    try {
        const textEncoder = new TextEncoder();
        const textDecoder = new TextDecoder();
        const binary = atob(input.replace(/-/g, '+').replace(/_/g, '/'));
        const key = textEncoder.encode(X2);
        const data = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++)
            data[i] = binary.charCodeAt(i);
        const result = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++)
            result[i] = data[i] ^ key[i % key.length];
        return textDecoder.decode(result);
    }
    catch {
        return null;
    }
}
function encodeSecret(content) {
    return `${X1}${toBase64Url(content)}`;
}
function decodeSecret(content) {
    if (!content.startsWith(X1))
        return null;
    return fromBase64Url(content.slice(X1.length));
}
let isSecretEnabled = false;
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil eklentisi (Üst Bar + Çeviri)',
    version: '1.0.5',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        try {
            const MessageActions = metro.getByProps('sendMessage');
            const HeaderBar = metro.getByProps('HeaderBar') || metro.getByProps('Header');
            const MessageContextMenu = metro.getBySource('MessageContextMenu');
            const { TouchableOpacity, Text, View } = metro.getByProps('TouchableOpacity', 'Text', 'View');
            // 1. Mesaj Gönderme Patch'i
            if (MessageActions) {
                Patcher__namespace.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                    const [, message] = args;
                    if (isSecretEnabled && message && message.content && !message.content.startsWith(X1)) {
                        message.content = encodeSecret(message.content);
                    }
                });
            }
            // 2. Üst Bar Buton Patch'i
            if (HeaderBar && TouchableOpacity) {
                Patcher__namespace.after('SecretLanguage', HeaderBar, 'default', (_self, _args, res) => {
                    const SecretButton = () => {
                        const [enabled, setEnabled] = common.React.useState(isSecretEnabled);
                        return (common.React.createElement(TouchableOpacity, { onPress: () => {
                                isSecretEnabled = !isSecretEnabled;
                                setEnabled(isSecretEnabled);
                                common.Toasts.open({ content: `Gizli Dil: ${isSecretEnabled ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                            }, style: {
                                marginRight: 10,
                                padding: 8,
                                borderRadius: 10,
                                backgroundColor: enabled ? 'rgba(67, 181, 129, 0.15)' : 'transparent',
                                flexDirection: 'row',
                                alignItems: 'center'
                            } },
                            common.React.createElement(Text, { style: { color: enabled ? '#43b581' : '#ffffff', fontSize: 18 } }, enabled ? '🔒' : '🔓')));
                    };
                    try {
                        // Header'ın sağ tarafındaki buton listesini bulmaya çalışıyoruz
                        // Bu yapı Discord versiyonuna göre children.props.children[1] vb olabilir.
                        const headerChildren = res?.props?.children?.props?.children;
                        if (Array.isArray(headerChildren)) {
                            // Eğer buton listesi buradaysa en başa ekle
                            headerChildren.unshift(common.React.createElement(SecretButton, null));
                        }
                        else if (res?.props?.children) {
                            // Alternatif yapı
                            const oldChildren = res.props.children;
                            res.props.children = [common.React.createElement(SecretButton, null), oldChildren];
                        }
                    }
                    catch (e) { }
                    return res;
                });
            }
            // 3. Mesaj Çeviri Patch'i
            if (MessageContextMenu) {
                Patcher__namespace.after('SecretLanguage', MessageContextMenu, 'default', (_self, args, res) => {
                    const [props] = args;
                    const message = props?.message;
                    if (!message || !message.content)
                        return res;
                    const decoded = decodeSecret(message.content);
                    if (decoded) {
                        // Şifreli mesaj algılandığında otomatik olarak bir bildirim gösterir
                        // İstersen buraya tıklandığında Dialog açacak bir mantık da eklenebilir.
                        common.Toasts.open({ content: "Gizli mesaj algılandı! Çevirmek için tıkla." });
                    }
                    return res;
                });
            }
            // 4. Komut Kaydı
            commands.registerCommands('SecretLanguage', [{
                    name: 'secret',
                    description: 'Gizli dili aç/kapat',
                    type: commands.ApplicationCommandType.Chat,
                    inputType: commands.ApplicationCommandInputType.BuiltIn,
                    execute() {
                        isSecretEnabled = !isSecretEnabled;
                        common.Dialog.show({
                            title: 'Secret Language',
                            body: `Gizli dil şu an: ${isSecretEnabled ? 'AÇIK' : 'KAPALI'}`,
                            confirmText: 'Tamam'
                        });
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
