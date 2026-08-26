type FooterProps = {
  name: string;
};

export function Footer({ name }: FooterProps) {
  return (
    <footer className="border-ink-200 border-t px-4 py-8 sm:px-6">
      <p className="text-ink-400 mx-auto max-w-3xl text-sm text-balance">
        Built by {name} with React, TypeScript and Claude Code, at a Rewriting the Code workshop.
      </p>
    </footer>
  );
}
