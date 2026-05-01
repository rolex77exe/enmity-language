(function(plugins,common,commands){'use strict';const X1 = "krd";
const X2 = "1978";
// Mobil uyumlu en ilkel Base64
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
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil (Hata Ayıklamalı)',
    version: '3.1.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        // 1. ADIM: Başlangıç Logu (Her durumda çıkmalı)
        setTimeout(() => {
            try {
                const enmity = window.enmity;
                const toasts = enmity?.modules?.common?.Toasts || enmity?.toasts;
                if (toasts)
                    toasts.open({ content: "DEBUG: onStart başladı..." });
                // 2. ADIM: Metro Modülünü Kontrol Et
                const metro = enmity?.metro || enmity?.modules?.common;
                if (!metro || !metro.getByProps) {
                    if (toasts)
                        toasts.open({ content: "HATA: Metro/getByProps bulunamadı!" });
                    return;
                }
                // 3. ADIM: sendMessage Patch'i
                const MessageActions = metro.getByProps('sendMessage');
                if (MessageActions) {
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
                    if (toasts)
                        toasts.open({ content: "DEBUG: sendMessage patchlendi." });
                }
                // 4. ADIM: Komut Kaydı
                commands.registerCommands('SecretLanguage', [{
                        name: 'secret',
                        description: 'Gizli dili aç/kapat',
                        type: commands.ApplicationCommandType.Chat,
                        inputType: commands.ApplicationCommandInputType.BuiltIn,
                        execute() {
                            const current = window.enmity.plugins.getSettings('SecretLanguage')?.enabled ?? false;
                            window.enmity.plugins.setSettings('SecretLanguage', { enabled: !current });
                            if (toasts)
                                toasts.open({ content: `Gizli Dil: ${!current ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                        },
                    }]);
                if (toasts)
                    toasts.open({ content: "BAŞARILI: Eklenti tamamen hazır!" });
            }
            catch (e) {
                const enmity = window.enmity;
                const toasts = enmity?.modules?.common?.Toasts || enmity?.toasts;
                if (toasts)
                    toasts.open({ content: "KRİTİK HATA: " + e.message });
            }
        }, 2000);
    },
    onStop() {
        Patcher.unpatchAll('SecretLanguage');
    },
    getSettingsPanel({ settings }) {
        // Ayarlar paneli bazen çökmeye sebep olur, en basit haliyle tutalım
        const enmity = window.enmity;
        const metro = enmity?.metro || enmity?.modules?.common;
        const { View, Text, Switch } = metro.getByProps('View', 'Text', 'Switch');
        return (common.React.createElement(View, { style: { padding: 20 } },
            common.React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
                common.React.createElement(Text, { style: { color: '#ffffff', fontSize: 18 } }, "Eklentiyi Etkinle\u015Ftir"),
                common.React.createElement(Switch, { value: settings.enabled ?? false, onValueChange: (v) => window.enmity.plugins.setSettings('SecretLanguage', { enabled: v }) }))));
    }
};
plugins.registerPlugin(SecretLanguagePlugin);})(enmity.plugins,enmity.modules.common,enmity.commands);
