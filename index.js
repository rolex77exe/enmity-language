(function(){'use strict';// SecretLanguage v4.0.0 - m4fn3/SecretMessage Mimarisinde Yeniden Yazıldı
// Bu sürüm tamamen global window.enmity nesnesini kullanır.
const X1 = "krd";
const X2 = "1978";
// --- YARDIMCI FONKSİYONLAR ---
const getEnmity = () => window.enmity;
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
    description: 'Gizli Dil (STABLE v4.0.0)',
    version: '4.0.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        const enmity = getEnmity();
        if (!enmity)
            return;
        const { metro, patcher, plugins, commands, assets, modules } = enmity;
        const getByProps = metro.getByProps;
        const common = modules.common;
        common.React;
        const Toasts = common.Toasts;
        // Ayarları Başlat
        const getSetting = (key, def) => plugins.getSettings('SecretLanguage')?.[key] ?? def;
        const setSetting = (key, val) => {
            const current = plugins.getSettings('SecretLanguage') || {};
            plugins.setSettings('SecretLanguage', { ...current, [key]: val });
        };
        if (plugins.getSettings('SecretLanguage') === undefined) {
            plugins.setSettings('SecretLanguage', { enabled: false, hijack_gift: true });
        }
        const p = patcher.create('SecretLanguage');
        // 1. MESAJ GÖNDERME YAMASI
        const MessageActions = getByProps('sendMessage');
        if (MessageActions) {
            p.before(MessageActions, 'sendMessage', (_self, args) => {
                const isEnabled = getSetting('enabled', false);
                const [, message] = args;
                if (isEnabled && message?.content && !message.content.startsWith(X1)) {
                    let res = "";
                    for (let i = 0; i < message.content.length; i++) {
                        res += String.fromCharCode(message.content.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
                    }
                    message.content = `${X1}${encodeB64(res).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
                }
            });
        }
        // 2. HEDİYE BUTONUNU ELE GEÇİRME (UI Injection)
        const TouchableOpacity = getByProps('TouchableOpacity');
        const giftIconId = assets.getIDByName('ic_gift');
        const lockIconId = assets.getIDByName('ic_lock');
        const unlockIconId = assets.getIDByName('ic_show_password');
        if (TouchableOpacity) {
            p.after(TouchableOpacity.default ? TouchableOpacity.default : TouchableOpacity, 'render', (_self, args, res) => {
                if (!getSetting('hijack_gift', true))
                    return res;
                // İçindeki ikonu bul
                try {
                    const children = res.props?.children;
                    const icon = Array.isArray(children) ? children[0] : children;
                    if (icon?.props?.source === giftIconId) {
                        const isEnabled = getSetting('enabled', false);
                        // İkonu değiştir
                        icon.props.source = isEnabled ? lockIconId : unlockIconId;
                        // Tıklama olayını değiştir
                        res.props.onPress = () => {
                            const current = getSetting('enabled', false);
                            setSetting('enabled', !current);
                            if (Toasts)
                                Toasts.open({ content: `Gizli Dil: ${!current ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                        };
                    }
                }
                catch (e) { }
                return res;
            });
        }
        // 3. MESAJ ÇEVİRİSİ (Long Press Menu)
        const MessageActionSheet = getByProps('MessageActionSheet') || (metro.getBySource && metro.getBySource('MessageActionSheet'));
        if (MessageActionSheet) {
            p.after(MessageActionSheet, 'default', (_self, args, res) => {
                const [props] = args;
                const message = props?.message;
                if (message?.content?.startsWith(X1)) {
                    const translateAction = {
                        label: 'Gizli Dili Çevir',
                        onPress: () => {
                            try {
                                const raw = message.content.slice(X1.length).replace(/-/g, '+').replace(/_/g, '/');
                                const decoded = decodeB64(raw);
                                let resStr = "";
                                for (let i = 0; i < decoded.length; i++) {
                                    resStr += String.fromCharCode(decoded.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
                                }
                                if (Toasts)
                                    Toasts.open({ content: `Çeviri: ${resStr}` });
                            }
                            catch (e) {
                                if (Toasts)
                                    Toasts.open({ content: "Çeviri hatası!" });
                            }
                        }
                    };
                    // Menüye ekle
                    if (res?.props?.children?.props?.options) {
                        res.props.children.props.options.push(translateAction);
                    }
                }
                return res;
            });
        }
        // 4. KOMUTLAR
        if (commands) {
            commands.registerCommands('SecretLanguage', [{
                    name: 'secret',
                    description: 'Gizli dili aç/kapat',
                    type: 1,
                    inputType: 1,
                    execute: () => {
                        const current = getSetting('enabled', false);
                        setSetting('enabled', !current);
                        if (Toasts)
                            Toasts.open({ content: `Gizli Dil: ${!current ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                    }
                }]);
        }
        if (Toasts)
            Toasts.open({ content: "SecretLanguage v4.0.0 Aktif!" });
    },
    onStop() {
        const enmity = getEnmity();
        if (enmity?.patcher) {
            enmity.patcher.unpatchAll('SecretLanguage');
        }
    },
    getSettingsPanel({ settings }) {
        const enmity = getEnmity();
        if (!enmity)
            return null;
        const { View, Text, Switch } = enmity.metro.getByProps('View', 'Text', 'Switch');
        const React = enmity.modules.common.React;
        return React.createElement(View, { style: { padding: 20 } }, React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } }, React.createElement(Text, { style: { color: '#ffffff', fontSize: 18 } }, "Eklentiyi Etkinleştir"), React.createElement(Switch, {
            value: settings.enabled ?? false,
            onValueChange: (v) => {
                const current = enmity.plugins.getSettings('SecretLanguage') || {};
                enmity.plugins.setSettings('SecretLanguage', { ...current, enabled: v });
            }
        })), React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 } }, React.createElement(Text, { style: { color: '#ffffff', fontSize: 18 } }, "Hediye Butonunu Kullan"), React.createElement(Switch, {
            value: settings.hijack_gift ?? true,
            onValueChange: (v) => {
                const current = enmity.plugins.getSettings('SecretLanguage') || {};
                enmity.plugins.setSettings('SecretLanguage', { ...current, hijack_gift: v });
            }
        })), React.createElement(Text, { style: { color: '#aaaaaa', marginTop: 10 } }, "v4.0.0 - Hediye butonu artık bir anahtar görevi görür."));
    }
};
// GLOBAL KAYIT
window.enmity.plugins.registerPlugin(SecretLanguagePlugin);})();
