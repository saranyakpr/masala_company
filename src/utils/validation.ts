import type { ContactFormErrors, ContactFormValues } from '@/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;

export const contactLimits = {
  name: 80,
  subject: 120,
  message: 2000,
  messageMin: 20,
} as const;

export function validateContactField(field: keyof ContactFormValues, raw: string): string | undefined {
  const value = raw.trim();
  switch (field) {
    case 'name':
      if (!value) return 'Please tell us your name.';
      if (value.length < 2) return 'Name should be at least 2 characters.';
      if (value.length > contactLimits.name) return `Name should be under ${contactLimits.name} characters.`;
      return undefined;
    case 'email':
      if (!value) return 'An email address helps us reply.';
      if (!EMAIL_RE.test(value)) return 'That email address doesn’t look right.';
      return undefined;
    case 'phone':
      if (!value) return undefined; // optional
      if (!PHONE_RE.test(value)) return 'Use digits, spaces, + or - only (7–20 characters).';
      if (value.replace(/\D/g, '').length < 7) return 'Phone number looks too short.';
      return undefined;
    case 'subject':
      if (!value) return 'Please choose a subject.';
      if (value.length > contactLimits.subject) return 'Subject is too long.';
      return undefined;
    case 'message':
      if (!value) return 'Please write a short message.';
      if (value.length < contactLimits.messageMin)
        return `A little more detail please — at least ${contactLimits.messageMin} characters.`;
      if (value.length > contactLimits.message) return `Message should be under ${contactLimits.message} characters.`;
      return undefined;
  }
}

export function validateContact(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  (Object.keys(values) as (keyof ContactFormValues)[]).forEach((field) => {
    const err = validateContactField(field, values[field]);
    if (err) errors[field] = err;
  });
  return errors;
}
