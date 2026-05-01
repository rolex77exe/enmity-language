(function(plugins,metro,common,commands){'use strict';const X1 = "krd";
const X2 = "1978";
// Mobil uyumlu en basit Base64
const encodeB64 = (s) => {
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let i = 0, a, b, c, out = '';
    while (i < s.length) {
        a = s.charCodeAt(i++);
        b = s.charCodeAt(i++);
        c = s.charCodeAt(i++);
        out += b64[a >> 2] + b64[((a & 3) << 4) | (b >> 4)] + (isNaN(b) ? '=' : b64[((b & 15) << 2) | (c >> 6)]) + (isNaN(b) || isNaN(c) ? '=' : b64[c & 63]);
    }
    return out;
};
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil (Hata Takipçili)',
    version: '2.7.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        // LOG 1: Başlangıç
        setTimeout(() => { common.Toasts.open({ content: "DEBUG: onStart tetiklendi" }); }, 1000);
        try {
            // LOG 2: Modülleri kontrol et
            const MessageActions = metro.getByProps('sendMessage');
            if (!MessageActions) {
                common.Toasts.open({ content: "HATA: MessageActions bulunamadı!" });
                return;
            }
            // LOG 3: Patch işlemi
            Patcher.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                const isEnabled = window.enmity.plugins.getSettings('SecretLanguage')?.enabled ?? false;
                const [, message] = args;
                if (isEnabled && message?.content && !message.content.startsWith(X1)) {
                    let res = "";
                    for (let i = 0; i < message.content.length; i++) {
                        res += String.fromCharCode(message.content.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
                    }
                    message.content = `${X1}${encodeB64(res).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
                }
            });
            // LOG 4: Komut kaydı
            commands.registerCommands('SecretLanguage', [{
                    name: 'secret',
                    description: 'Gizli dili aç/kapat',
                    type: commands.ApplicationCommandType.Chat,
                    inputType: commands.ApplicationCommandInputType.BuiltIn,
                    execute() {
                        const current = window.enmity.plugins.getSettings('SecretLanguage')?.enabled ?? false;
                        window.enmity.plugins.setSettings('SecretLanguage', { enabled: !current });
                        common.Toasts.open({ content: `Gizli Dil: ${!current ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                    },
                }]);
            common.Toasts.open({ content: "DEBUG: Tüm adımlar başarıyla tamamlandı!" });
        }
        catch (e) {
            common.Toasts.open({ content: "KRİTİK HATA: " + e });
            console.error(e);
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
