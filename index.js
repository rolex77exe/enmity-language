(function(plugins,Patcher,metro,common,commands){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);const X1 = "krd";
const X2 = "1978";
// Mobil uyumlu Base64
const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function encodeB64(input) {
    let str = input;
    let output = '';
    for (let block = 0, charCode, i = 0, map = b64chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
        charCode = str.charCodeAt(i += 3 / 4);
        block = block << 8 | charCode;
    }
    return output;
}
function decodeB64(input) {
    let str = input.replace(/=+$/, '');
    let output = '';
    for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = b64chars.indexOf(buffer);
    }
    return output;
}
function encodeSecret(input) {
    let result = "";
    for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
    }
    const b64 = encodeB64(result);
    return `${X1}${b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
}
function decodeSecret(input) {
    if (!input.startsWith(X1))
        return null;
    try {
        const body = input.slice(X1.length).replace(/-/g, '+').replace(/_/g, '/');
        const decodedB64 = decodeB64(body);
        let result = "";
        for (let i = 0; i < decodedB64.length; i++) {
            result += String.fromCharCode(decodedB64.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
        }
        return result;
    }
    catch {
        return null;
    }
}
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil (Vencord Uyumlu)',
    version: '2.5.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        try {
            const MessageActions = metro.getByProps('sendMessage');
            const ChatInput = metro.getBySource('ChatInput');
            const MessageContextMenu = metro.getBySource('MessageContextMenu');
            const { TouchableOpacity, Text } = metro.getByProps('TouchableOpacity', 'Text');
            // 1. Mesaj Gönderme Patch'i
            if (MessageActions) {
                Patcher__namespace.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                    const settings = window.enmity.plugins.getSettings('SecretLanguage') || { enabled: false };
                    const [, message] = args;
                    if (settings.enabled && message?.content && !message.content.startsWith(X1)) {
                        message.content = encodeSecret(message.content);
                    }
                });
            }
            // 2. Chat Input Buton Patch'i (Hediye butonu bölgesine)
            if (ChatInput && TouchableOpacity) {
                Patcher__namespace.after('SecretLanguage', ChatInput, 'default', (_self, _args, res) => {
                    const SecretToggle = () => {
                        const [enabled, setEnabled] = common.React.useState(window.enmity.plugins.getSettings('SecretLanguage')?.enabled ?? false);
                        return (common.React.createElement(TouchableOpacity, { onPress: () => {
                                const newState = !enabled;
                                window.enmity.plugins.setSettings('SecretLanguage', { enabled: newState });
                                setEnabled(newState);
                                common.Toasts.open({ content: `Gizli Dil: ${newState ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                            }, style: { padding: 8, justifyContent: 'center', alignItems: 'center' } },
                            common.React.createElement(Text, { style: { fontSize: 22, color: enabled ? '#43b581' : '#ffffff' } }, enabled ? '🔒' : '🔓')));
                    };
                    try {
                        const children = res?.props?.children?.props?.children || res?.props?.children;
                        if (Array.isArray(children)) {
                            // Buton listesinin en başına (hediye butonu civarı) ekle
                            children.unshift(common.React.createElement(SecretToggle, null));
                        }
                    }
                    catch (e) { }
                    return res;
                });
            }
            // 3. Mesaj Çeviri (Basılı Tutma) Patch'i
            if (MessageContextMenu) {
                // Bu kısım genellikle lazy-loaded olduğu için 'default' üzerinden patchlenir
                Patcher__namespace.after('SecretLanguage', MessageContextMenu, 'default', (_self, args, res) => {
                    const [props] = args;
                    const message = props?.message;
                    if (!message || !message.content)
                        return res;
                    const decoded = decodeSecret(message.content);
                    if (decoded) {
                        // Mesaj şifreliyse, menüye basınca otomatik toast göster veya bir dialog aç
                        // Not: MenuItem eklemek çok daha karmaşıktır, en hızlı çözüm Toast/Dialog
                        common.Toasts.open({ content: `Çeviri: ${decoded}` });
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
                        const current = window.enmity.plugins.getSettings('SecretLanguage')?.enabled ?? false;
                        const newState = !current;
                        window.enmity.plugins.setSettings('SecretLanguage', { enabled: newState });
                        return { content: `Gizli dil şu an: ${newState ? 'AÇIK' : 'KAPALI'}` };
                    },
                }]);
        }
        catch (err) {
            console.error("SecretLanguage onStart Error:", err);
        }
    },
    onStop() {
        Patcher__namespace.unpatchAll('SecretLanguage');
    },
    getSettingsPanel({ settings }) {
        const { View, Text, Switch } = metro.getByProps('View', 'Text', 'Switch');
        return (common.React.createElement(View, { style: { padding: 16 } },
            common.React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
                common.React.createElement(Text, { style: { color: '#ffffff', fontSize: 16 } }, "Eklentiyi Etkinle\u015Ftir"),
                common.React.createElement(Switch, { value: settings.enabled ?? false, onValueChange: (val) => {
                        window.enmity.plugins.setSettings('SecretLanguage', { enabled: val });
                    } }))));
    }
};
plugins.registerPlugin(SecretLanguagePlugin);})(enmity.plugins,enmity.patcher,enmity.metro,enmity.modules.common,enmity.commands);
