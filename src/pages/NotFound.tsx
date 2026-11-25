import { useSeo } from '@/hooks/useSeo';
import { Button } from '@/components/ui/Button';
import { SplitText } from '@/animations/SplitText';
import { Reveal } from '@/animations/Reveal';
import { useLocation } from 'react-router-dom';

export default function NotFound({ message }: { message?: string }) {
  const { pathname } = useLocation();
  useSeo({ title: 'Page not found', description: 'The page you were looking for could not be found.', path: pathname });
  return (
    <section className="grain-light flex min-h-[100svh] items-center bg-burgundy-deep text-ivory">
      <div className="container-x py-32">
        <span className="eyebrow text-gold-light">Error 404</span>
        <SplitText as="h1" immediate text={'This spice jar\nis empty.'} accentWords={[4]} accentClassName="italic text-gold-light" className="mt-6 text-display" />
        <Reveal delay={0.4}>
          <p className="mt-8 max-w-md text-lg text-ivory/70">{message ?? 'The page you were looking for has moved, or never existed.'}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/" variant="gold" size="lg">
              Back to home
            </Button>
            <Button to="/products" variant="outline-light" size="lg">
              Browse products
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
