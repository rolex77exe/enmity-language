(function(common){'use strict';function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}const X1 = "krd";
const X2 = "1978";
// Kripto Fonksiyonu
function encodeSecret(input) {
    const textEncoder = new TextEncoder();
    const key = textEncoder.encode(X2);
    const data = textEncoder.encode(input);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++)
        result[i] = data[i] ^ key[i % key.length];
    let binary = "";
    for (let i = 0; i < result.length; i++)
        binary += String.fromCharCode(result[i]);
    return `${X1}${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
}
// Güvenli Modül Bulucu (Hata almayı engeller)
const getEnmityModule = (name) => {
    const e = window.enmity;
    return e?.[name] || e?.modules?.[name] || e?.api?.[name];
};
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil (Vencord Uyumlu - Kararlı Sürüm)',
    version: '1.4.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        // Discord'un kendine gelmesi için kısa bir bekleme
        setTimeout(() => {
            try {
                const metro = getEnmityModule('metro');
                const patcher = getEnmityModule('patcher');
                const commands = getEnmityModule('commands');
                if (!metro || !patcher) {
                    common.Toasts.open({ content: "HATA: Enmity modülleri bulunamadı!" });
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
                    common.Toasts.open({ content: "SecretLanguage AKTİF! (Mesajlar şifreleniyor)" });
                }
                // Komut Kaydı
                if (commands) {
                    commands.registerCommands('SecretLanguage', [{
                            name: 'secret',
                            description: 'Gizli dili test et',
                            execute: () => {
                                common.Toasts.open({ content: "Eklenti çalışıyor!" });
                            }
                        }]);
                }
            }
            catch (err) {
                common.Toasts.open({ content: "HATA: " + err });
            }
        }, 1500);
    },
    onStop() {
        const patcher = getEnmityModule('patcher');
        if (patcher && patcher.unpatchAll) {
            patcher.unpatchAll('SecretLanguage');
        }
    }
};
registerPlugin(SecretLanguagePlugin);})(enmity.modules.common);
