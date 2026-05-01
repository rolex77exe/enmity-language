(function(plugins,common,commands){'use strict';const X1 = "krd";
const X2 = "1978";
// Mobil uyumlu en ilkel Base64
const encodeB64 = (s) => {
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
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
const decodeB64 = (s) => {
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let i = 0, a, b, c, d, out = '';
    s = s.replace(/[^A-Za-z0-9+/]/g, '');
    while (i < s.length) {
        a = b64.indexOf(s.charAt(i++));
        b = b64.indexOf(s.charAt(i++));
        c = b64.indexOf(s.charAt(i++));
        d = b64.indexOf(s.charAt(i++));
        out += String.fromCharCode((a << 2) | (b >> 4));
        if (c !== -1)
            out += String.fromCharCode(((b & 15) << 4) | (c >> 2));
        if (d !== -1)
            out += String.fromCharCode(((c & 3) << 6) | d);
    }
    return out;
};
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil (STABLE v3.5.0)',
    version: '3.5.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            const e = window.enmity;
            if (e && e.metro && e.patcher) {
                clearInterval(interval);
                this.initializePlugin(e);
            }
            else if (attempts > 60) { // 30 saniye boyunca denesin
                clearInterval(interval);
                console.log("SecretLanguage: Enmity modülleri bulunamadı.");
            }
        }, 500);
    },
    initializePlugin(e) {
        const { metro, patcher, plugins, commands: enmityCommands } = e;
        const toasts = e.modules?.common?.Toasts || e.toasts || metro.getByProps('open', 'close');
        const { View, Text, TouchableOpacity } = metro.getByProps('View', 'Text', 'TouchableOpacity');
        // 1. MESAJ GÖNDERME YAMASI
        const MessageActions = metro.getByProps('sendMessage');
        if (MessageActions) {
            patcher.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                const settings = plugins.getSettings('SecretLanguage') || { enabled: false };
                const [, message] = args;
                if (settings.enabled && message?.content && !message.content.startsWith(X1)) {
                    let res = "";
                    for (let i = 0; i < message.content.length; i++) {
                        res += String.fromCharCode(message.content.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
                    }
                    message.content = `${X1}${encodeB64(res).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
                }
            });
        }
        // 2. UI ENJEKSİYONU (ChatInput Butonu)
        // Hediye butonu civarına bir kilit eklemeye çalışalım
        const ChatInput = metro.getByProps('ChatInput') || metro.getBySource('ChatInput');
        if (ChatInput && ChatInput.default) {
            patcher.after('SecretLanguage', ChatInput, 'default', (_self, _args, res) => {
                const settings = plugins.getSettings('SecretLanguage') || { enabled: false };
                // Render edilen ağaçta butonları bulup yanına ekleme yapalım
                // Bu kısım Discord versiyonuna göre çok değişkendir
                try {
                    const buttons = res?.props?.children?.props?.children;
                    if (Array.isArray(buttons)) {
                        buttons.push(common.React.createElement(TouchableOpacity, { onPress: () => {
                                const current = plugins.getSettings('SecretLanguage')?.enabled ?? false;
                                plugins.setSettings('SecretLanguage', { enabled: !current });
                                if (toasts)
                                    toasts.open({ content: `Gizli Dil: ${!current ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                            }, style: { padding: 10 } },
                            common.React.createElement(Text, { style: { fontSize: 20 } }, settings.enabled ? '🔒' : '🔓')));
                    }
                }
                catch (err) { }
                return res;
            });
        }
        // 3. KOMUT KAYDI
        if (enmityCommands) {
            enmityCommands.registerCommands('SecretLanguage', [{
                    name: 'secret',
                    description: 'Gizli dili aç/kapat',
                    type: commands.ApplicationCommandType.Chat,
                    inputType: commands.ApplicationCommandInputType.BuiltIn,
                    execute() {
                        const current = plugins.getSettings('SecretLanguage')?.enabled ?? false;
                        plugins.setSettings('SecretLanguage', { enabled: !current });
                        if (toasts)
                            toasts.open({ content: `Gizli Dil: ${!current ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                    },
                }]);
        }
        // 4. MESAJ ÇEVİRİSİ (Long Press)
        const MessageActionSheet = metro.getByProps('MessageActionSheet') || metro.getBySource('MessageActionSheet');
        if (MessageActionSheet) {
            patcher.after('SecretLanguage', MessageActionSheet, 'default', (_self, args, res) => {
                const [props] = args;
                const message = props?.message;
                if (message?.content?.startsWith(X1)) {
                    const translateAction = {
                        label: 'Gizli Dili Çevir',
                        onPress: () => {
                            try {
                                const raw = message.content.slice(X1.length).replace(/-/g, '+').replace(/_/g, '/');
                                const decoded = decodeB64(raw);
                                let res = "";
                                for (let i = 0; i < decoded.length; i++) {
                                    res += String.fromCharCode(decoded.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
                                }
                                if (toasts)
                                    toasts.open({ content: `Çeviri: ${res}` });
                            }
                            catch (e) {
                                if (toasts)
                                    toasts.open({ content: "Çeviri hatası!" });
                            }
                        }
                    };
                    if (res?.props?.children?.props?.options) {
                        res.props.children.props.options.push(translateAction);
                    }
                }
                return res;
            });
        }
        if (toasts)
            toasts.open({ content: "SecretLanguage v3.5.0 Başarıyla Yüklendi!" });
    },
    onStop() {
        const e = window.enmity;
        if (e?.patcher?.unpatchAll)
            e.patcher.unpatchAll('SecretLanguage');
    },
    getSettingsPanel({ settings }) {
        try {
            const e = window.enmity;
            const { View, Text, Switch } = e.metro.getByProps('View', 'Text', 'Switch');
            return (common.React.createElement(View, { style: { padding: 20 } },
                common.React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
                    common.React.createElement(Text, { style: { color: '#ffffff', fontSize: 18 } }, "Eklentiyi Etkinle\u015Ftir"),
                    common.React.createElement(Switch, { value: settings.enabled ?? false, onValueChange: (v) => e.plugins.setSettings('SecretLanguage', { enabled: v }) })),
                common.React.createElement(Text, { style: { color: '#aaaaaa', marginTop: 10 } }, "v3.5.0 - Hediye butonu yan\u0131ndaki kilit ile h\u0131zl\u0131ca a\u00E7\u0131p kapatabilirsiniz.")));
        }
        catch (e) {
            return null;
        }
    }
};
plugins.registerPlugin(SecretLanguagePlugin);})(enmity.plugins,enmity.modules.common,enmity.commands);
