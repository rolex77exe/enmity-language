(function(Patcher,metro){'use strict';function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n["default"]=e;return Object.freeze(n)}var Patcher__namespace=/*#__PURE__*/_interopNamespace(Patcher);function registerPlugin(plugin) {
    window.enmity.plugins.registerPlugin(plugin);
}window.enmity.modules.common.Constants;
window.enmity.modules.common.Clipboard;
window.enmity.modules.common.Assets;
window.enmity.modules.common.Messages;
window.enmity.modules.common.Clyde;
window.enmity.modules.common.Avatars;
window.enmity.modules.common.Native;
window.enmity.modules.common.React;
window.enmity.modules.common.Dispatcher;
window.enmity.modules.common.Storage;
window.enmity.modules.common.Toasts;
const Dialog = window.enmity.modules.common.Dialog;
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
window.enmity.modules.common.Moment;var ApplicationCommandSectionType;
(function (ApplicationCommandSectionType) {
    ApplicationCommandSectionType[ApplicationCommandSectionType["BuiltIn"] = 0] = "BuiltIn";
    ApplicationCommandSectionType[ApplicationCommandSectionType["Guild"] = 1] = "Guild";
    ApplicationCommandSectionType[ApplicationCommandSectionType["DM"] = 2] = "DM";
})(ApplicationCommandSectionType || (ApplicationCommandSectionType = {}));
var ApplicationCommandType;
(function (ApplicationCommandType) {
    ApplicationCommandType[ApplicationCommandType["Chat"] = 1] = "Chat";
    ApplicationCommandType[ApplicationCommandType["User"] = 2] = "User";
    ApplicationCommandType[ApplicationCommandType["Message"] = 3] = "Message";
})(ApplicationCommandType || (ApplicationCommandType = {}));
var ApplicationCommandInputType;
(function (ApplicationCommandInputType) {
    ApplicationCommandInputType[ApplicationCommandInputType["BuiltIn"] = 0] = "BuiltIn";
    ApplicationCommandInputType[ApplicationCommandInputType["BuiltInText"] = 1] = "BuiltInText";
    ApplicationCommandInputType[ApplicationCommandInputType["BuiltInIntegration"] = 2] = "BuiltInIntegration";
    ApplicationCommandInputType[ApplicationCommandInputType["Bot"] = 3] = "Bot";
    ApplicationCommandInputType[ApplicationCommandInputType["Placeholder"] = 4] = "Placeholder";
})(ApplicationCommandInputType || (ApplicationCommandInputType = {}));
var ApplicationCommandPermissionType;
(function (ApplicationCommandPermissionType) {
    ApplicationCommandPermissionType[ApplicationCommandPermissionType["Role"] = 1] = "Role";
    ApplicationCommandPermissionType[ApplicationCommandPermissionType["User"] = 2] = "User";
})(ApplicationCommandPermissionType || (ApplicationCommandPermissionType = {}));
var ApplicationCommandOptionType;
(function (ApplicationCommandOptionType) {
    ApplicationCommandOptionType[ApplicationCommandOptionType["SubCommand"] = 1] = "SubCommand";
    ApplicationCommandOptionType[ApplicationCommandOptionType["SubCommandGroup"] = 2] = "SubCommandGroup";
    ApplicationCommandOptionType[ApplicationCommandOptionType["String"] = 3] = "String";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Integer"] = 4] = "Integer";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Boolean"] = 5] = "Boolean";
    ApplicationCommandOptionType[ApplicationCommandOptionType["User"] = 6] = "User";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Channel"] = 7] = "Channel";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Role"] = 8] = "Role";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Mentionnable"] = 9] = "Mentionnable";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Number"] = 10] = "Number";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Attachment"] = 11] = "Attachment";
})(ApplicationCommandOptionType || (ApplicationCommandOptionType = {}));
var InteractionTypes;
(function (InteractionTypes) {
    InteractionTypes[InteractionTypes["ApplicationCommand"] = 2] = "ApplicationCommand";
    InteractionTypes[InteractionTypes["MessageComponent"] = 3] = "MessageComponent";
})(InteractionTypes || (InteractionTypes = {}));
function registerCommands(caller, commands) {
    window.enmity.commands.registerCommands(caller, commands);
}const X1 = "krd";
const X2 = "1978";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
// Crypto Logic
function xorEncryptDecrypt(input) {
    const key = textEncoder.encode(X2);
    const data = textEncoder.encode(input);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ key[i % key.length];
    }
    let binary = "";
    for (const byte of result)
        binary += String.fromCharCode(byte);
    return btoa(binary);
}
function xorDecrypt(base64) {
    try {
        const binary = atob(base64);
        const key = textEncoder.encode(X2);
        const data = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            data[i] = binary.charCodeAt(i);
        }
        const result = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            result[i] = data[i] ^ key[i % key.length];
        }
        return textDecoder.decode(result);
    }
    catch {
        return null;
    }
}
function toBase64Url(input) {
    return xorEncryptDecrypt(input)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}
function fromBase64Url(input) {
    const normalized = input
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const padLength = (4 - normalized.length % 4) % 4;
    const padded = normalized + "=".repeat(padLength);
    return xorDecrypt(padded);
}
function encodeSecret(content) {
    return `${X1}${toBase64Url(content)}`;
}
function decodeSecret(content) {
    let cleanContent = content;
    if (cleanContent.startsWith("||") && cleanContent.endsWith("||")) {
        cleanContent = cleanContent.slice(2, -2).trim();
    }
    if (!cleanContent.startsWith(X1))
        return null;
    const body = cleanContent.slice(X1.length).trim();
    if (!body)
        return "";
    return fromBase64Url(body);
}
// State
let isSecretEnabled = false;
const SecretLanguagePlugin = {
    name: 'SecretLanguage',
    description: 'Gizli Dil eklentisi',
    version: '1.0.0',
    authors: [{ name: 'You', id: '0' }],
    onStart() {
        const MessageActions = metro.getByProps('sendMessage');
        const MessageContextMenu = metro.getByProps('MessageContextMenu');
        const ChatInput = metro.getByProps('ChatInput');
        const { TouchableOpacity } = metro.getByProps('TouchableOpacity');
        // Patch Send Message
        if (MessageActions) {
            Patcher__namespace.before('SecretLanguage', MessageActions, 'sendMessage', (_self, args) => {
                const [, message] = args;
                if (isSecretEnabled && message.content && !message.content.startsWith(X1)) {
                    message.content = encodeSecret(message.content);
                }
            });
        }
        // Toggle Button Injection into Chat Bar
        if (ChatInput && TouchableOpacity) {
            Patcher__namespace.after('SecretLanguage', ChatInput, 'default', (_self, _args, res) => {
                // Mobile Discord's ChatInput structure can be complex.
                return res;
            });
        }
        // Context Menu "Çevir" Button
        if (MessageContextMenu) {
            Patcher__namespace.after('SecretLanguage', MessageContextMenu, 'default', (_self, args, res) => {
                const [props] = args;
                const message = props?.message;
                if (!message)
                    return res;
                decodeSecret(message.content);
                return res;
            });
        }
        // Slash Command for Toggle
        const command = {
            name: 'secret',
            description: 'Gizli dili aç/kapat',
            type: ApplicationCommandType.Chat,
            inputType: ApplicationCommandInputType.BuiltIn,
            execute() {
                isSecretEnabled = !isSecretEnabled;
                Dialog.show({
                    title: 'Secret Language',
                    body: `Gizli dil ${isSecretEnabled ? 'açıldı' : 'kapatıldı'}.`,
                    confirmText: 'Tamam'
                });
            },
        };
        registerCommands('SecretLanguage', [command]);
    },
    onStop() {
        const p = Patcher__namespace;
        if (p.unpatchAll) {
            p.unpatchAll('SecretLanguage');
        }
    },
};
registerPlugin(SecretLanguagePlugin);})(Patcher,metro);