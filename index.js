(function(){'use strict';// SecretLanguage v4.1.0 - Otomatik Başlatma ve Kalıcılık Güncellemesi
// Bu sürüm Discord her açıldığında modüller yüklenene kadar deneme yapar.
const X1 = "krd";
const X2 = "1978";
// --- YARDIMCI FONKSİYONLAR ---
const getEnmity = () => window.enmity;
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
    description: 'Gizli Dil (STABLE v4.1.0)',
    version: '4.1.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        let attempts = 0;
        const initInterval = setInterval(() => {
            attempts++;
            const enmity = getEnmity();
            // Enmity ve temel modüller hazır mı kontrol et
            if (enmity && enmity.metro && enmity.patcher && enmity.modules?.common?.Toasts) {
                clearInterval(initInterval);
                this.initializePlugin(enmity);
            }
            else if (attempts > 100) { // 50 saniye boyunca denesin
                clearInterval(initInterval);
                console.log("SecretLanguage: Enmity bulunamadı.");
            }
        }, 500);
    },
    initializePlugin(enmity) {
        const { metro, patcher, plugins, commands, assets, modules } = enmity;
        const getByProps = metro.getByProps;
        const common = modules.common;
        const Toasts = common.Toasts;
        // Ayarları m4fn3 yöntemiyle (kalıcı) kullan
        const getSetting = (key, def) => plugins.getSettings('SecretLanguage')?.[key] ?? def;
        const setSetting = (key, val) => {
            const current = plugins.getSettings('SecretLanguage') || {};
            plugins.setSettings('SecretLanguage', { ...current, [key]: val });
        };
        const p = patcher.create('SecretLanguage');
        // 1. MESAJ GÖNDERME
        const MessageActions = getByProps('sendMessage');
        if (MessageActions) {
            p.before(MessageActions, 'sendMessage', (_self, args) => {
                if (getSetting('enabled', false)) {
                    const [, message] = args;
                    if (message?.content && !message.content.startsWith(X1)) {
                        let res = "";
                        for (let i = 0; i < message.content.length; i++) {
                            res += String.fromCharCode(message.content.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
                        }
                        message.content = `${X1}${encodeB64(res).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
                    }
                }
            });
        }
        // 2. HEDİYE BUTONU HIJACK (Daha sağlam kontrol)
        const TouchableOpacity = getByProps('TouchableOpacity');
        const giftIconId = assets.getIDByName('ic_gift');
        const lockIconId = assets.getIDByName('ic_lock');
        const unlockIconId = assets.getIDByName('ic_show_password');
        if (TouchableOpacity) {
            p.after(TouchableOpacity.default || TouchableOpacity, 'render', (_self, args, res) => {
                if (!getSetting('hijack_gift', true))
                    return res;
                try {
                    const children = res.props?.children;
                    const icon = Array.isArray(children) ? children[0] : children;
                    if (icon?.props?.source === giftIconId) {
                        const isEnabled = getSetting('enabled', false);
                        icon.props.source = isEnabled ? lockIconId : unlockIconId;
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
        // 3. MESAJ ÇEVİRİSİ (Long Press)
        const MessageActionSheet = getByProps('MessageActionSheet') || (metro.getBySource && metro.getBySource('MessageActionSheet'));
        if (MessageActionSheet) {
            p.after(MessageActionSheet, 'default', (_self, args, res) => {
                const message = args[0]?.message;
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
                                    Toasts.open({ content: "Hata!" });
                            }
                        }
                    };
                    if (res?.props?.children?.props?.options)
                        res.props.children.props.options.push(translateAction);
                }
                return res;
            });
        }
        // 4. KOMUTLAR
        if (commands) {
            commands.registerCommands('SecretLanguage', [{
                    name: 'secret',
                    description: 'Gizli dili aç/kapat',
                    type: 1, inputType: 1,
                    execute: () => {
                        const current = getSetting('enabled', false);
                        setSetting('enabled', !current);
                        if (Toasts)
                            Toasts.open({ content: `Gizli Dil: ${!current ? 'AÇIK 🔒' : 'KAPALI 🔓'}` });
                    }
                }]);
        }
        if (Toasts)
            Toasts.open({ content: "SecretLanguage v4.1.0 Aktif!" });
    },
    onStop() {
        const enmity = getEnmity();
        if (enmity?.patcher)
            enmity.patcher.unpatchAll('SecretLanguage');
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
        })));
    }
};
// KESİN KAYIT (Retry ile)
const register = () => {
    const enmity = getEnmity();
    if (enmity?.plugins?.registerPlugin) {
        enmity.plugins.registerPlugin(SecretLanguagePlugin);
    }
    else {
        setTimeout(register, 1000);
    }
};
register();})();
