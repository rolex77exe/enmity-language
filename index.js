(function(Patcher,metro,common,commands){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}const X1 = "krd";
const X2 = "1978";
// Kripto fonksiyonu
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
// Ayarlar için Storage kullanımı (Kapanıp açılınca sıfırlanmaması için)
const Settings = {
    get enabled() { return window.enmity.plugins.getSettings('SecretLanguage')?.enabled ?? false; },
    set enabled(val) { window.enmity.plugins.setSettings('SecretLanguage', { enabled: val }); }
};
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil (Ayarlar Sayfasından Açıp Kapatılabilir)',
    version: '1.2.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        try {
            const MessageActions = metro.getByProps('sendMessage');
            // Mesaj Gönderme Patch'i
            if (MessageActions) {
                Patcher__namespace.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                    const [, message] = args;
                    if (Settings.enabled && message?.content && !message.content.startsWith(X1)) {
                        message.content = encodeSecret(message.content);
                    }
                });
            }
            // Komut kaydı
            commands.registerCommands('SecretLanguage', [{
                    name: 'secret',
                    description: 'Gizli dili aç/kapat',
                    type: commands.ApplicationCommandType.Chat,
                    inputType: commands.ApplicationCommandInputType.BuiltIn,
                    execute() {
                        Settings.enabled = !Settings.enabled;
                        const status = Settings.enabled ? 'AÇIK 🔒' : 'KAPALI 🔓';
                        common.Toasts.open({ content: `Gizli dil şu an: ${status}` });
                    },
                }]);
        }
        catch (err) {
            console.error("Başlatma hatası:", err);
        }
    },
    onStop() {
        Patcher__namespace.unpatchAll('SecretLanguage');
    },
    // Enmity Ayarlar Sayfası (En güvenli yöntem)
    getSettingsPanel({ settings }) {
        const { View, Text, Switch } = metro.getByProps('View', 'Text', 'Switch');
        return (common.React.createElement(View, { style: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
            common.React.createElement(Text, { style: { color: '#ffffff', fontSize: 16 } }, "Gizli Dili Aktif Et"),
            common.React.createElement(Switch, { value: settings.enabled ?? false, onValueChange: (val) => {
                    Settings.enabled = val;
                    common.Toasts.open({ content: `Gizli Dil: ${val ? 'AÇIK' : 'KAPALI'}` });
                } })));
    }
};
registerPlugin(SecretLanguagePlugin);})(enmity.patcher,enmity.metro,enmity.modules.common,enmity.commands);
