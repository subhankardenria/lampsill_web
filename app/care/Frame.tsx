import { Mark } from '@/components/Chrome';

/** The care page's frame before signing in: the lockup, then the page. */
export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="care">
      <div className="care-top">
        <a className="lockup" href="/" aria-label="Lampsill, home">
          <Mark />
          <span className="wordmark">Lampsill</span>
        </a>
      </div>
      {children}
    </main>
  );
}
