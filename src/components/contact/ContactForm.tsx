import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, Loader2, Mail, AlertTriangle } from 'lucide-react';
import type { ContactFormErrors, ContactFormValues } from '@/types';
import { contactLimits, validateContact, validateContactField } from '@/utils/validation';
import { buildMailto, isContactDeliveryConfigured, submitContact } from '@/services/contact';
import { site } from '@/data/site';
import { InputField, SelectField, TextAreaField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { easePremium } from '@/animations/variants';

export const contactSubjects = [
  'General enquiry',
  'Trade & distribution',
  'Bulk & export enquiry',
  'Product information',
  'Quality documentation request',
  'Careers',
];

type Status = 'idle' | 'submitting' | 'sent' | 'not-configured' | 'error';

const empty: ContactFormValues = { name: '', email: '', phone: '', subject: '', message: '' };

interface ContactFormProps {
  initial?: Partial<ContactFormValues>;
}

export function ContactForm({ initial }: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>({ ...empty, ...initial });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormValues, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const onChange = (field: keyof ContactFormValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const v = e.target.value;
    setValues((prev) => ({ ...prev, [field]: v }));
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateContactField(field, v) }));
    if (status !== 'idle' && status !== 'submitting') setStatus('idle');
  };

  const onBlur = (field: keyof ContactFormValues) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateContactField(field, values[field]) }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot
    const found = validateContact(values);
    setErrors(found);
    setTouched({ name: true, email: true, phone: true, subject: true, message: true });
    const firstInvalid = (Object.keys(found) as (keyof ContactFormValues)[])[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    setStatus('submitting');
    const result = await submitContact({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      subject: values.subject,
      message: values.message.trim(),
    });
    if (result.status === 'sent') {
      setStatus('sent');
      setValues(empty);
      setTouched({});
    } else if (result.status === 'not-configured') {
      setStatus('not-configured');
    } else {
      setStatus('error');
      setErrorMessage(result.message);
    }
  };

  const err = (f: keyof ContactFormValues) => (touched[f] ? errors[f] : undefined);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="form-note" className="relative">
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <InputField
          label="Full name"
          name="name"
          autoComplete="name"
          required
          maxLength={contactLimits.name}
          value={values.name}
          onChange={onChange('name')}
          onBlur={onBlur('name')}
          error={err('name')}
          placeholder="Your name"
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={onChange('email')}
          onBlur={onBlur('email')}
          error={err('email')}
          placeholder="you@company.com"
        />
        <InputField
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={onChange('phone')}
          onBlur={onBlur('phone')}
          error={err('phone')}
          placeholder="+91 …"
        />
        <SelectField
          label="Subject"
          name="subject"
          required
          options={values.subject && !contactSubjects.includes(values.subject) ? [values.subject, ...contactSubjects] : contactSubjects}
          placeholder="Choose a subject"
          value={values.subject}
          onChange={onChange('subject')}
          onBlur={onBlur('subject')}
          error={err('subject')}
        />
        <div className="sm:col-span-2">
          <TextAreaField
            label="Message"
            name="message"
            required
            maxLength={contactLimits.message}
            value={values.message}
            onChange={onChange('message')}
            onBlur={onBlur('message')}
            error={err('message')}
            hint={`${values.message.trim().length} / ${contactLimits.message} characters`}
            placeholder="Tell us about your requirement — products, quantities, location…"
          />
        </div>
      </div>

      {/* honeypot — hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p id="form-note" className="max-w-sm text-xs leading-relaxed text-ink-soft/60">
          Fields marked * are required. We only use your details to respond to this enquiry.
        </p>
        <Button type="submit" variant="primary" size="lg" disabled={status === 'submitting'} arrow={status !== 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            'Send message'
          )}
        </Button>
      </div>

      <div aria-live="polite" className="mt-6">
        <AnimatePresence mode="wait">
          {status === 'sent' && (
            <Notice key="sent" tone="success" icon={<CheckCircle2 className="h-5 w-5" />} title="Thank you — your message has been sent.">
              Our team will get back to you shortly.
            </Notice>
          )}
          {status === 'not-configured' && (
            <Notice key="nc" tone="info" icon={<Info className="h-5 w-5" />} title="Online delivery isn’t connected yet.">
              Your message has <strong>not</strong> been sent. You can send it from your email app instead — it’s pre-filled for you.
              <div className="mt-4">
                <Button href={buildMailto(site.contact.email, values)} variant="ink" arrow={false}>
                  <Mail aria-hidden="true" className="h-4 w-4" /> Open in email app
                </Button>
              </div>
            </Notice>
          )}
          {status === 'error' && (
            <Notice key="err" tone="error" icon={<AlertTriangle className="h-5 w-5" />} title="Your message couldn’t be sent.">
              {errorMessage} Please try again, or email us at{' '}
              <a className="underline" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
              .
            </Notice>
          )}
        </AnimatePresence>
      </div>

      {!isContactDeliveryConfigured && import.meta.env.DEV && (
        <p className="mt-4 text-xs text-ink-soft/50">Developer note: set VITE_CONTACT_ENDPOINT to enable online delivery.</p>
      )}
    </form>
  );
}

function Notice({ tone, icon, title, children }: { tone: 'success' | 'info' | 'error'; icon: ReactNode; title: string; children: ReactNode }) {
  const styles = {
    success: 'border-leaf/40 bg-leaf/10 text-ink',
    info: 'border-gold/50 bg-gold/10 text-ink',
    error: 'border-spice/40 bg-spice/10 text-ink',
  }[tone];
  const iconColor = { success: 'text-leaf', info: 'text-earth', error: 'text-spice' }[tone];
  return (
    <motion.div
      role={tone === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.5, ease: easePremium }}
      className={`flex gap-4 border p-5 ${styles}`}
    >
      <span aria-hidden="true" className={`mt-0.5 ${iconColor}`}>
        {icon}
      </span>
      <div className="text-sm leading-relaxed">
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-ink-soft/80">{children}</div>
      </div>
    </motion.div>
  );
}
