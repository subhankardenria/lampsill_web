import { isCountryCode } from '@/lib/pricing';

/**
 * WHERE TO COMPLAIN, for the visitor's own country.
 *
 * The notice used to name the UK's regulator to everyone, which tells a reader
 * in India or Canada to take a complaint to a body that is not theirs. Now:
 *
 *   UK                       the Information Commissioner's Office
 *   EU and EEA               their own national authority, found through the
 *                            European Data Protection Board's member list
 *   anywhere else, or unknown  the authority "where you live", unnamed
 *
 * Only places where the right body is certain are named. A wrong name here is
 * worse than a general one, so more countries are added only once checked.
 * Server-rendered, from the same country the page's price came from; a visitor
 * on a VPN simply gets the wording for where the VPN is.
 */
const EEA = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV',
  'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
]);

export function Complaint({ country, lead }: { country: string | null; lead: string }) {
  const c = isCountryCode(country) ? country.toUpperCase() : null;

  if (c === 'GB') {
    return (
      <p>
        {lead} You can also complain to the{' '}
        <a href="https://ico.org.uk/make-a-complaint/" rel="noopener">
          Information Commissioner&rsquo;s Office
        </a>
        .
      </p>
    );
  }

  if (c && EEA.has(c)) {
    return (
      <p>
        {lead} You can also complain to the data protection authority in your country. The{' '}
        <a href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en" rel="noopener">
          European Data Protection Board
        </a>{' '}
        lists them.
      </p>
    );
  }

  return (
    <p>
      {lead} You can also complain to the data protection authority where you live.
    </p>
  );
}
