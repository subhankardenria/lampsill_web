import { Mark } from '@/components/Chrome';
import { signOut } from './actions';

/** The care page's frame: the lockup, and who is signed in. */
export function Frame({ children, me }: { children: React.ReactNode; me?: string }) {
  return (
    <main className="care">
      <div className="care-top">
        <a className="lockup" href="/" aria-label="Lampsill, home">
          <Mark />
          <span className="wordmark">Lampsill</span>
        </a>
        {me && (
          <form action={signOut} className="care-me">
            <span className="care-quiet care-small care-email">{me}</span>
            <button className="care-link" type="submit">Sign out</button>
          </form>
        )}
      </div>
      {children}
    </main>
  );
}
