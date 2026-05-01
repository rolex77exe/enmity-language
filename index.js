(function(plugins,metro,common,commands){'use strict';const X1 = "krd";
const X2 = "1978";
// Mobil uyumlu en basit Base64
const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const encodeB64 = (s) => {
    let i = 0, a, b, c, out = '';
    while (i < s.length) {
        a = s.charCodeAt(i++);
        b = s.charCodeAt(i++);
        c = s.charCodeAt(i++);
        out += b64[a >> 2] + b64[((a & 3) << 4) | (b >> 4)] +
            (isNaN(b) ? '=' : b64[((b & 15) << 2) | (c >> 6)]) +
            (isNaN(b) || isNaN(c) ? '=' : b64[c & 63]);
    }
    return out;
};
function encodeSecret(input) {
    let res = "";
    for (let i = 0; i < input.length; i++) {
        res += String.fromCharCode(input.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
    }
    return `${X1}${encodeB64(res).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
}
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil (Vencord Uyumlu)',
    version: '2.6.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        try {
            const MessageActions = metro.getByProps('sendMessage');
            const settings = window.enmity.plugins.getSettings('SecretLanguage') || { enabled: false };
            // Mesaj Gönderme Müdahalesi
            if (MessageActions) {
                Patcher.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                    const isEnabled = window.enmity.plugins.getSettings('SecretLanguage')?.enabled ?? false;
                    const [, message] = args;
                    if (isEnabled && message?.content && !message.content.startsWith(X1)) {
                        message.content = encodeSecret(message.content);
                    }
                });
            }
            // Komut Kaydı (En Garanti Yöntem)
            commands.registerCommands('SecretLanguage', [{
                    name: 'secret',
                    description: 'Gizli dili aç/kapat',
                    type: commands.ApplicationCommandType.Chat,
                    inputType: commands.ApplicationCommandInputType.BuiltIn,
                    execute() {
                        const current = window.enmity.plugins.getSettings('SecretLanguage')?.enabled ?? false;
                        const newState = !current;
                        window.enmity.plugins.setSettings('SecretLanguage', { enabled: newState });
                        common.Toasts.open({ content: `Gizli Dil: ${newState ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                    },
                }]);
        }
        catch (e) {
            console.log("SecretLanguage Error:", e);
        }
    },
    onStop() {
        Patcher.unpatchAll('SecretLanguage');
    },
    getSettingsPanel({ settings }) {
        const { View, Text, Switch } = metro.getByProps('View', 'Text', 'Switch');
        return (common.React.createElement(View, { style: { padding: 20 } },
            common.React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
                common.React.createElement(Text, { style: { color: '#ffffff', fontSize: 18 } }, "Eklentiyi Etkinle\u015Ftir"),
                common.React.createElement(Switch, { value: settings.enabled ?? false, onValueChange: (v) => window.enmity.plugins.setSettings('SecretLanguage', { enabled: v }) }))));
    }
};
plugins.registerPlugin(SecretLanguagePlugin);})(enmity.plugins,enmity.metro,enmity.modules.common,enmity.commands);
