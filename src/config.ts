/**
 * Editable Configuration for Clarity Digital Academy
 * 3-Day Free Canva Design Class Landing Page
 *
 * You can easily update these values without touching component code.
 */

export interface AcademyConfig {
  BRAND_NAME: string;
  TAGLINE: string;
  MENTOR_NAME: string;
  MENTOR_NICKNAME: string;
  MENTOR_TITLE: string;
  CLASS_TITLE: string;
  CLASS_SUBTITLE: string;
  CLASS_DURATION: string;
  CLASS_COST: string;
  CLASS_DATE: string;
  CLASS_TIME: string;
  CLASS_LOCATION: string;
  WHATSAPP_GROUP_LINK: string;
  REGISTRATION_ENDPOINT: string;
  META_PIXEL_ID: string;
  MENTOR_IMAGE: string;
  EMAIL: string;
  PHONE: string;
  SUPPORT_EMAIL: string;
  SUPPORT_PHONE: string;
  SOCIAL_LINKS: {
    whatsapp?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
  };
}

export const SITE_CONFIG: AcademyConfig = {
  BRAND_NAME: "CLARITY DIGITAL ACADEMY",
  TAGLINE: "Learn Skills. Earn Globally.",
  MENTOR_NAME: "ONIFADE SULAIMAN",
  MENTOR_NICKNAME: "MR. CLARITY",
  MENTOR_TITLE: "Founder — Clarity Digital Academy",
  CLASS_TITLE: "3-DAY FREE CANVA DESIGN CLASS",
  CLASS_SUBTITLE: "Learn how to use Canva to create clean, attractive and professional designs with your smartphone or laptop — even if you've never designed before.",
  CLASS_DURATION: "3 Days Intensive",
  CLASS_COST: "100% FREE",
  CLASS_DATE: "Next Cohort Starting Soon",
  CLASS_TIME: "8:00 PM WAT (Daily)",
  CLASS_LOCATION: "Live Class via WhatsApp & Dedicated Training Hub",
  // Official WhatsApp community group invite link:
  WHATSAPP_GROUP_LINK: "https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y",
  // Configure with your Formspree, Google Sheets Apps Script, or custom API URL:
  // If left empty (""), registrations are saved securely in local browser storage and display the WhatsApp confirmation directly!
  REGISTRATION_ENDPOINT: "",
  // Meta Pixel ID for Facebook & Instagram Ads Tracking (configured here, via .env, or in Admin Settings):
  META_PIXEL_ID: "1065001129595286",
  // Real photograph of Onifade Sulaiman (Mr. Clarity):
  MENTOR_IMAGE: "/sulaiman.jpg",
  EMAIL: "ipesolasulaiman@gmail.com",
  PHONE: "+234 805 178 0169",
  SUPPORT_EMAIL: "ipesolasulaiman@gmail.com",
  SUPPORT_PHONE: "+234 805 178 0169",
  SOCIAL_LINKS: {
    whatsapp: "https://wa.me/2348051780169?text=Hello%20Mr.%20Clarity%2C%20I%20have%20a%20question%20about%20the%20Free%20Canva%20Design%20Class",
    instagram: "https://instagram.com/claritydigitalacademy",
    twitter: "https://twitter.com/mrclarity_design",
    facebook: "https://facebook.com/claritydigitalacademy",
    youtube: "https://youtube.com/@claritydigitalacademy",
    linkedin: "https://linkedin.com/in/onifadesulaiman"
  }
};
