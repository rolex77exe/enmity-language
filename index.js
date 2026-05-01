(function(plugins){'use strict';const X1 = "krd";
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
function encodeSecret(input) {
    let result = "";
    for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input.charCodeAt(i) ^ X2.charCodeAt(i % X2.length));
    }
    const b64 = encodeB64(result);
    return `${X1}${b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
}
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil (Ultra Kararlı Sürüm)',
    version: '2.3.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        // Discord'un modülleri tam yüklemesi için 3 saniye bekle
        setTimeout(() => {
            try {
                const e = window.enmity;
                if (!e)
                    return;
                // Modül bulucu: Her yeri tek tek dener
                const getModule = () => {
                    if (e.metro && e.metro.getByProps)
                        return e.metro;
                    if (e.modules && e.modules.common && e.modules.common.getByProps)
                        return e.modules.common;
                    if (e.getByProps)
                        return e;
                    return null;
                };
                const metro = getModule();
                const patcher = e.patcher;
                const toasts = e.modules?.common?.Toasts || e.toasts;
                if (!metro || !patcher) {
                    if (toasts)
                        toasts.open({ content: "HATA: Gerekli modüller bulunamadı!" });
                    return;
                }
                const MessageActions = metro.getByProps('sendMessage');
                if (MessageActions) {
                    patcher.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                        const [, message] = args;
                        if (message && message.content && !message.content.startsWith(X1)) {
                            message.content = encodeSecret(message.content);
                        }
                    });
                    if (toasts)
                        toasts.open({ content: "SecretLanguage Başarıyla Yüklendi! (Mesajlar Şifrelenecek)" });
                }
            }
            catch (err) {
                console.log("SecretLanguage Başlatma Hatası:", err);
            }
        }, 3000);
    },
    onStop() {
        const e = window.enmity;
        if (e && e.patcher && e.patcher.unpatchAll) {
            e.patcher.unpatchAll('SecretLanguage');
        }
    }
};
plugins.registerPlugin(SecretLanguagePlugin);})(plugins);
