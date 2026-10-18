/* USEFUL EVERY DAY, TOO (18 Oct 2026). The owner asked whether reminders,
   notes and steps should be on the site, then for it "simple, easy to
   understand and artistic". So not cards and paragraphs: a still life. Three
   small things stand on one windowsill in the lamp's light, the brand's own
   picture, each with its name and a few words.

   Placed after the story and before what is shared, and no higher: the page
   has one promise (if their phone goes quiet, you're told), and these are
   what make the app worth opening on the days nothing happens. Every claim is
   the app's own:
   - a reminder's Done is a sign the person is about (Reminders.kt, and the
     iPhone's ReminderHost);
   - notes are kept in the phone's secure storage, never sent (notes.dart);
   - steps are counted on the phone and shown to nobody (the no-surveillance
     rule; DataModel below says the same). */

// Each picture stands on the sill at y = 80 of its 96: a desk bell, a note
// card propped up, a walking shoe.
const THINGS = [
  {
    name: 'Reminders',
    line: 'Tap Done, it knows you’re up.',
    art: (
      <>
        <path d="M20 80 H76" />
        <path d="M24 72 H72 V80 H24 Z" />
        <path d="M28 72 A20 20 0 0 1 68 72" />
        <path d="M48 52 V46" />
        <path d="M43 46 H53" />
        <path className="ed-spark" d="M66 40 L71 34 M73 49 L80 46 M30 40 L25 34 M23 49 L16 46" />
      </>
    ),
  },
  {
    name: 'Notes',
    line: 'Yours alone, on your phone.',
    art: (
      <>
        <path d="M32 24 H58 L66 32 V80 H32 Z" />
        <path d="M58 24 V32 H66" />
        <path d="M39 44 H59" />
        <path d="M39 54 H59" />
        <path d="M39 64 H52" />
      </>
    ),
  },
  {
    name: 'Steps',
    line: 'Counted, never shared.',
    art: (
      <>
        <path d="M18 80 V58 Q18 52 24 52 H36 Q40 52 43 56 L50 64 Q53 67 58 68 L72 71 Q80 73 80 80 Z" />
        <path d="M18 74 H80" />
        <path d="M33 60 L38 57 M37 65 L43 61 M42 69 L47 66" />
        <path className="ed-spark" d="M10 60 H4 M12 68 H6" />
      </>
    ),
  },
];

export default function Everyday() {
  return (
    <section className="section everyday" id="everyday">
      <div className="wrap">
        <div className="reveal everyday-head">
          <p className="eyebrow">Every day, too</p>
          <h2>Small things, every day.</h2>
          <p className="lede">And all of them stay on your phone.</p>
        </div>
        <div className="everyday-sill reveal">
          <div className="everyday-light" aria-hidden="true" />
          <ul className="everyday-things">
            {THINGS.map((t) => (
              <li key={t.name}>
                <svg className="everyday-art" viewBox="0 0 96 96" aria-hidden="true">
                  {t.art}
                </svg>
                <h3>{t.name}</h3>
                <p>{t.line}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
