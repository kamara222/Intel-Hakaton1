import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./translations/fr";

const resources = {
  fr,
};

i18n.use(initReactI18next).init({
  fallbackLng: "fr",
  lng: "fr",
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
