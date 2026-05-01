(function(Patcher,metro,common,commands){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}const X1 = "krd";
const X2 = "1978";
// Crypto Logic
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
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil eklentisi (Vencord Uyumlu)',
    version: '1.2.1',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        window.enmity.plugins.getSettings('SecretLanguage') || { enabled: false };
        try {
            const MessageActions = metro.getByProps('sendMessage');
            const ChatInput = metro.getBySource('ChatInput');
            const { TouchableOpacity, Text, View } = metro.getByProps('TouchableOpacity', 'Text', 'View');
            // 1. Patch Message Sending
            if (MessageActions) {
                Patcher__namespace.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                    const currentSettings = window.enmity.plugins.getSettings('SecretLanguage');
                    const isEnabled = currentSettings?.enabled ?? false;
                    const [, message] = args;
                    if (isEnabled && message && message.content && !message.content.startsWith(X1)) {
                        message.content = encodeSecret(message.content);
                    }
                });
            }
            // 2. Patch Chat Input for the Toggle Button
            if (ChatInput && TouchableOpacity) {
                Patcher__namespace.after('SecretLanguage', ChatInput, 'default', (_self, _args, res) => {
                    const SecretToggle = () => {
                        const [enabled, setEnabled] = common.React.useState(window.enmity.plugins.getSettings('SecretLanguage')?.enabled ?? false);
                        return (common.React.createElement(TouchableOpacity, { onPress: () => {
                                const newState = !enabled;
                                window.enmity.plugins.setSettings('SecretLanguage', { enabled: newState });
                                setEnabled(newState);
                                common.Toasts.open({
                                    content: `Gizli Dil: ${newState ? 'AÇIK 🔒' : 'KAPALI 🔓'}`,
                                });
                            }, style: {
                                padding: 8,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: enabled ? 'rgba(67, 181, 129, 0.1)' : 'transparent',
                                borderRadius: 12,
                                marginHorizontal: 4
                            } },
                            common.React.createElement(Text, { style: { fontSize: 20, color: enabled ? '#43b581' : '#ffffff' } }, enabled ? '🔒' : '🔓')));
                    };
                    try {
                        const children = res?.props?.children?.props?.children || res?.props?.children;
                        if (Array.isArray(children)) {
                            // Add to the end or start of the input buttons
                            children.push(common.React.createElement(SecretToggle, null));
                        }
                    }
                    catch (e) { }
                    return res;
                });
            }
            // 3. Context Menu for Translation
            const MessageContextMenu = metro.getBySource('MessageContextMenu');
            if (MessageContextMenu) {
                Patcher__namespace.after('SecretLanguage', MessageContextMenu, 'default', (_self, args, res) => {
                    const [props] = args;
                    const message = props?.message;
                    if (!message || !message.content)
                        return res;
                    const decoded = decodeSecret(message.content);
                    if (decoded) {
                        // When a secret message is detected, we show a toast with the translation
                        // SecretMessage usually adds a menu item, but toasts are more reliable for now.
                        common.Toasts.open({ content: `Gizli Mesaj: ${decoded}` });
                    }
                    return res;
                });
            }
            // 4. Command fallback
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
            common.React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
                common.React.createElement(Text, { style: { color: '#ffffff', fontSize: 16 } }, "Eklentiyi Etkinle\u015Ftir"),
                common.React.createElement(Switch, { value: settings.enabled ?? false, onValueChange: (val) => {
                        window.enmity.plugins.setSettings('SecretLanguage', { enabled: val });
                        common.Toasts.open({ content: `Gizli Dil: ${val ? 'AÇIK' : 'KAPALI'}` });
                    } })),
            common.React.createElement(Text, { style: { color: '#b9bbbe', fontSize: 14 } }, "Bu eklenti, mesajlar\u0131n\u0131z\u0131 XOR algoritmas\u0131 ile \u015Fifreler. \u015Eifrelenmi\u015F mesajlar \"krd\" \u00F6n eki ile ba\u015Flar.")));
    }
};
registerPlugin(SecretLanguagePlugin);})(enmity.patcher,enmity.metro,enmity.modules.common,enmity.commands);
