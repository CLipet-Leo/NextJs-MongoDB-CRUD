import { cn } from '@/lib/utils';

export function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'center bg-primary-foreground mb-8 max-w-6xl rounded-lg p-6 shadow-md',
        className,
      )}
    >
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
