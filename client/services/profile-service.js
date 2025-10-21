import { store } from '../services/state.js'

export const ProfileService = {
    userLanguageKey: 'userLanguage',
    setLanguage(lang) {
        var correctLanguage = store.languages.find(l => l.code === lang);
        if (!correctLanguage) {
            correctLanguage = store.languages[0];
        }

        lang = correctLanguage.code;
        store.currentLanguage = correctLanguage;
        localStorage.setItem(this.userLanguageKey, lang);
    },
    getLanguage() {
        var lang = localStorage.getItem(this.userLanguageKey);
        if (!lang) {
            this.setDefaultLanguage();
            return store.languages[0];
        }

        var language = store.languages.find(l => l.code === lang);
        if (!language) {
            this.setDefaultLanguage();
            return store.languages[0];
        }
        store.currentLanguage = language;
        return language;
    },
    getLanguageCode() {
        return this.getLanguage().code;
    },
    setDefaultLanguage() {
        localStorage.setItem(this.userLanguageKey, store.languages[0].code);
    }
}