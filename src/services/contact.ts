import type { ContactFormValues } from '@/types';

export type ContactSubmitResult =
  | { status: 'sent' }
  | { status: 'not-configured' }
  | { status: 'error'; message: string };

const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT?.trim() ?? '';

/** True only when a real delivery endpoint has been configured via VITE_CONTACT_ENDPOINT. */
export const isContactDeliveryConfigured = endpoint.length > 0;

/**
 * Sends the contact form to the configured endpoint (Formspree, serverless function, etc.).
 * When no endpoint is configured it resolves `not-configured` — the UI must never claim
 * the message was delivered in that case.
 */
export async function submitContact(values: ContactFormValues): Promise<ContactSubmitResult> {
  if (!isContactDeliveryConfigured) return { status: 'not-configured' };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) return { status: 'error', message: `The server responded with ${res.status}.` };
    return { status: 'sent' };
  } catch {
    return { status: 'error', message: 'We couldn’t reach the server. Please check your connection.' };
  }
}

export function buildMailto(to: string, values: ContactFormValues): string {
  const body = [
    values.message,
    '',
    `— ${values.name}`,
    values.email,
    values.phone ? `Phone: ${values.phone}` : '',
  ]
    .filter((l) => l !== undefined)
    .join('\n');
  return `mailto:${to}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
}
