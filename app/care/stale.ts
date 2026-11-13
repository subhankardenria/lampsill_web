/**
 * A care page left open while lampsill.com is updated still holds the old
 * site's actions, which the new site no longer has, so the first press fails
 * ("This page couldn't load"; 14 Nov 2026). Reloading picks up the new site.
 *
 * So every press goes through safely(): if the action fails but the site can
 * still be reached, the page reloads itself, once a minute at most. If the
 * site can't be reached, or it failed again straight after a reload, the
 * person is told in words instead.
 */

const KEY = 'care-reloaded-at';
const FAILED = "That didn't go through. Check your connection and try again.";

/** Never settles: keeps a button in its "…ing" state while the page goes. */
export const leaving = <T>(): Promise<T> => new Promise<T>(() => {});

export function go(path: string): Promise<never> {
  window.location.assign(path);
  return leaving();
}

async function reachable(): Promise<boolean> {
  try {
    const res = await fetch('/care/data', { cache: 'no-store' });
    return res.status < 500;
  } catch {
    return false;
  }
}

function reloadedJustNow(): boolean {
  try {
    if (Date.now() - Number(sessionStorage.getItem(KEY) ?? 0) < 60_000) return true;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: reload anyway. Only a press can bring us here, so it can't loop.
  }
  return false;
}

export async function safely<T>(call: () => Promise<T>, failed: (message: string) => T): Promise<T> {
  try {
    return await call();
  } catch {
    if ((await reachable()) && !reloadedJustNow()) {
      window.location.reload();
      return leaving();
    }
    return failed(FAILED);
  }
}
