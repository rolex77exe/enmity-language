(function(){'use strict';function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}window.enmity.modules.common.Constants;
window.enmity.modules.common.Clipboard;
window.enmity.modules.common.Assets;
window.enmity.modules.common.Messages;
window.enmity.modules.common.Clyde;
window.enmity.modules.common.Avatars;
window.enmity.modules.common.Native;
const React = window.enmity.modules.common.React;
window.enmity.modules.common.Dispatcher;
window.enmity.modules.common.Storage;
const Toasts = window.enmity.modules.common.Toasts;
window.enmity.modules.common.Dialog;
window.enmity.modules.common.Token;
window.enmity.modules.common.REST;
window.enmity.modules.common.Settings;
window.enmity.modules.common.Users;
window.enmity.modules.common.Navigation;
window.enmity.modules.common.NavigationNative;
window.enmity.modules.common.NavigationStack;
window.enmity.modules.common.Theme;
window.enmity.modules.common.Linking;
window.enmity.modules.common.StyleSheet;
window.enmity.modules.common.ColorMap;
window.enmity.modules.common.Components;
window.enmity.modules.common.Locale;
window.enmity.modules.common.Profiles;
window.enmity.modules.common.Lodash;
window.enmity.modules.common.Logger;
window.enmity.modules.common.Flux;
window.enmity.modules.common.SVG;
window.enmity.modules.common.Scenes;
window.enmity.modules.common.Moment;const X1 = "krd";
const X2 = "1978";
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
    description: 'Gizli Dil (Hata Çözüldü)',
    version: '2.8.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        setTimeout(() => {
            try {
                const e = window.enmity;
                if (!e)
                    return;
                // AKILLI MODÜL BULUCU
                const metro = e.metro || e.modules?.common || e;
                const patcher = e.patcher;
                const commands = e.commands || e.api?.commands;
                if (!metro.getByProps || !patcher) {
                    Toasts.open({ content: "KRİTİK: Modül sistemi hala bulunamadı!" });
                    return;
                }
                const MessageActions = metro.getByProps('sendMessage');
                if (MessageActions) {
                    patcher.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                        const isEnabled = e.plugins.getSettings('SecretLanguage')?.enabled ?? false;
                        const [, message] = args;
                        if (isEnabled && message?.content && !message.content.startsWith(X1)) {
                            let res = "";
                            for (let i = 0; i < message.content.length; i++) {
                                res += String.fromCharCode(message.content.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
                            }
                            message.content = `${X1}${encodeB64(res).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
                        }
                    });
                    Toasts.open({ content: "SecretLanguage BAŞARIYLA YÜKLENDİ!" });
                }
                if (commands) {
                    commands.registerCommands('SecretLanguage', [{
                            name: 'secret',
                            description: 'Gizli dili aç/kapat',
                            execute() {
                                const current = e.plugins.getSettings('SecretLanguage')?.enabled ?? false;
                                e.plugins.setSettings('SecretLanguage', { enabled: !current });
                                Toasts.open({ content: `Gizli Dil: ${!current ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                            }
                        }]);
                }
            }
            catch (err) {
                Toasts.open({ content: "HATA AYIKLAMA: " + err });
            }
        }, 2000);
    },
    onStop() {
        const e = window.enmity;
        if (e?.patcher?.unpatchAll)
            e.patcher.unpatchAll('SecretLanguage');
    },
    getSettingsPanel({ settings }) {
        const e = window.enmity;
        const metro = e?.metro || e?.modules?.common || e;
        const { View, Text, Switch } = metro.getByProps('View', 'Text', 'Switch');
        return (React.createElement(View, { style: { padding: 20 } },
            React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
                React.createElement(Text, { style: { color: '#ffffff', fontSize: 18 } }, "Eklentiyi Etkinle\u015Ftir"),
                React.createElement(Switch, { value: settings.enabled ?? false, onValueChange: (v) => e.plugins.setSettings('SecretLanguage', { enabled: v }) }))));
    }
};
registerPlugin(SecretLanguagePlugin);})();
