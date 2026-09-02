import { safeGetItem, safeJsonParse } from './storage';
import { RegistrationFormData } from '../types';

/**
 * Validates and formats Nigerian and international phone numbers.
 * Supports:
 * - 0803..., 0812..., 0706..., 0905..., 0912... (11 digits local)
 * - +23480..., 23480... (international Nigerian format)
 * - General international numbers with country code
 */
export function validateAndFormatWhatsApp(rawInput: string): {
  isValid: boolean;
  formattedDisplay: string;
  internationalNumber: string;
  errorMessage?: string;
} {
  const cleaned = rawInput.trim().replace(/[\s\-()]/g, '');

  if (!cleaned) {
    return {
      isValid: false,
      formattedDisplay: '',
      internationalNumber: '',
      errorMessage: 'WhatsApp number is required.',
    };
  }

  // Nigerian Local Format: starts with 07, 08, 09 and is 11 digits
  const nigerianLocalRegex = /^(0[789][01]\d{8})$/;
  if (nigerianLocalRegex.test(cleaned)) {
    const international = '234' + cleaned.substring(1);
    const display = `+234 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
    return {
      isValid: true,
      formattedDisplay: display,
      internationalNumber: international,
    };
  }

  // Nigerian Format with 234 without +: 23480..., 23470..., 23490... (13 digits)
  const nigerianIntlNoPlusRegex = /^(234[789][01]\d{8})$/;
  if (nigerianIntlNoPlusRegex.test(cleaned)) {
    const display = `+234 ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
    return {
      isValid: true,
      formattedDisplay: display,
      internationalNumber: cleaned,
    };
  }

  // Nigerian Format with +234: +23480...
  const nigerianIntlPlusRegex = /^\+234([789][01]\d{8})$/;
  if (nigerianIntlPlusRegex.test(cleaned)) {
    const withoutPlus = cleaned.substring(1);
    const display = `+234 ${withoutPlus.substring(3, 6)} ${withoutPlus.substring(6, 9)} ${withoutPlus.substring(9)}`;
    return {
      isValid: true,
      formattedDisplay: display,
      internationalNumber: withoutPlus,
    };
  }

  // General International format: 8 to 15 digits
  const genericIntlRegex = /^\+?[1-9]\d{7,14}$/;
  if (genericIntlRegex.test(cleaned)) {
    const numOnly = cleaned.replace('+', '');
    return {
      isValid: true,
      formattedDisplay: cleaned.startsWith('+') ? cleaned : `+${cleaned}`,
      internationalNumber: numOnly,
    };
  }

  return {
    isValid: false,
    formattedDisplay: rawInput,
    internationalNumber: '',
    errorMessage: 'Please enter a valid Nigerian WhatsApp number (e.g. 08012345678 or +2348012345678).',
  };
}

/**
 * Validates Email Address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Checks for duplicate registration in local history
 */
export function checkDuplicateRegistration(
  email: string,
  whatsapp: string
): { isDuplicate: boolean; existingRecord?: RegistrationFormData } {
  try {
    const raw = safeGetItem('cda_canva_registrations', '[]');
    const records: RegistrationFormData[] = safeJsonParse(raw, []);

    const normalizedEmail = email.trim().toLowerCase();
    const phoneCheck = validateAndFormatWhatsApp(whatsapp);
    const normalizedPhone = phoneCheck.internationalNumber || whatsapp.replace(/\D/g, '');

    const found = records.find((rec) => {
      const recEmail = rec.email?.trim().toLowerCase();
      const recPhone = (rec.whatsappNumber || '').replace(/\D/g, '');
      return (
        (recEmail && recEmail === normalizedEmail) ||
        (recPhone && normalizedPhone && (recPhone.endsWith(normalizedPhone) || normalizedPhone.endsWith(recPhone)))
      );
    });

    if (found) {
      return { isDuplicate: true, existingRecord: found };
    }
  } catch (err) {
    console.warn('Could not check duplicates:', err);
  }

  return { isDuplicate: false };
}
