type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalPage({ title, children }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl text-ink">{title}</h1>
      <div className="mt-10 space-y-6 text-stone-600 leading-relaxed">{children}</div>
    </section>
  );
}
