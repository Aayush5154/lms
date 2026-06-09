import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Students": "Students",
      "Seats Layout": "Seats Layout",
      "Fees & Payments": "Fees & Payments",
      "Super Admin": "Super Admin",
      "Settings": "Settings",
      "Logout": "Logout",
      "Total Seats": "Total Seats",
      "Occupied": "Occupied",
      "Vacant": "Vacant",
      "Total Students": "Total Students",
      "Pending Fees": "Pending Fees",
      "Today's Collection": "Today's Collection",
      "Monthly Collection": "Monthly Collection",
      "Overdue Students": "Overdue Students",
      "Occupancy Rate": "Occupancy Rate",
      "Recent Payments": "Recent Payments",
      "Dues Today": "Dues Today",
      "Library Settings": "Library Settings",
      "Save Changes": "Save Changes",
      "Language": "Language",
      "English": "English",
      "Hindi": "Hindi",
      "Theme": "Theme",
      "Setup Library": "Setup Library",
      "Next": "Next",
      "Previous": "Previous",
      "Finish": "Finish",
      "Library Name": "Library Name",
      "Owner Name": "Owner Name",
      "City": "City",
      "State": "State",
      "Opening Time": "Opening Time",
      "Closing Time": "Closing Time",
      "Default Monthly Fee": "Default Monthly Fee",
      "Facilities": "Facilities",
      "Description": "Description",
      "Gallery": "Gallery",
      "Logo": "Logo",
      "Public Page": "Public Page",
      "Contact": "Contact",
      "Address": "Address",
      "Submit": "Submit",
      "Add Student": "Add Student",
      "Record Payment": "Record Payment",
      "Search...": "Search...",
      "All Status": "All Status",
      "Paid": "Paid",
      "Unpaid": "Unpaid",
      "Overdue": "Overdue"
    }
  },
  hi: {
    translation: {
      "Dashboard": "डैशबोर्ड",
      "Students": "छात्र",
      "Seats Layout": "सीट लेआउट",
      "Fees & Payments": "फीस और भुगतान",
      "Super Admin": "सुपर एडमिन",
      "Settings": "सेटिंग्स",
      "Logout": "लॉग आउट",
      "Total Seats": "कुल सीटें",
      "Occupied": "भरी हुई",
      "Vacant": "खाली",
      "Total Students": "कुल छात्र",
      "Pending Fees": "बकाया फीस",
      "Today's Collection": "आज का संग्रह",
      "Monthly Collection": "मासिक संग्रह",
      "Overdue Students": "अतिदेय छात्र",
      "Occupancy Rate": "भराव दर",
      "Recent Payments": "हाल के भुगतान",
      "Dues Today": "आज की देय",
      "Library Settings": "लाइब्रेरी सेटिंग्स",
      "Save Changes": "बदलाव सहेजें",
      "Language": "भाषा",
      "English": "अंग्रेज़ी",
      "Hindi": "हिंदी",
      "Theme": "थीम",
      "Setup Library": "लाइब्रेरी सेटअप करें",
      "Next": "अगला",
      "Previous": "पिछला",
      "Finish": "पूरा करें",
      "Library Name": "लाइब्रेरी का नाम",
      "Owner Name": "मालिक का नाम",
      "City": "शहर",
      "State": "राज्य",
      "Opening Time": "खुलने का समय",
      "Closing Time": "बंद होने का समय",
      "Default Monthly Fee": "डिफ़ॉल्ट मासिक शुल्क",
      "Facilities": "सुविधाएं",
      "Description": "विवरण",
      "Gallery": "गैलरी",
      "Logo": "लोगो",
      "Public Page": "सार्वजनिक पृष्ठ",
      "Contact": "संपर्क करें",
      "Address": "पता",
      "Submit": "जमा करें",
      "Add Student": "छात्र जोड़ें",
      "Record Payment": "भुगतान दर्ज करें",
      "Search...": "खोजें...",
      "All Status": "सभी स्थिति",
      "Paid": "भुगतान किया",
      "Unpaid": "बकाया",
      "Overdue": "अतिदेय"
    }
  }
};

const savedLanguage = localStorage.getItem("lms_lang") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
