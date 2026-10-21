# Pink Royal Cinematic Nikah Invitation — Angular

## Requirements
Node.js 20.11+ and npm. Angular 17 standalone project.

## Run
```bash
npm install
npm start
```
Open http://localhost:4200

## Customize
Edit `src/app/app.component.ts` → `INVITE` at the top. Replace names, date (ISO with +05:30), venue, map link, and WhatsApp number. Timeline timings are also editable in the same file. The couple cards use stylized initials by default, so no private photos are needed.

## Deploy free
Push the project to GitHub. Import it into Vercel, framework Angular, build `npm run build`, output `dist/pink-nikah-invitation`. Free Hobby hosting is subject to Vercel's usage and eligibility restrictions. `vercel.json` already provides build and rewrite settings.

## Notes
- Animations: GSAP + ScrollTrigger, CSS petals, 3D envelope hover, reveal-on-scroll.
- Responsive and reduced-motion support.
- Interactive date reveal uses a rose tap, not an actual canvas scratch-off.
- RSVP and blessings open WhatsApp; there is no database.
- Background music and photo galleries can be added later once assets are provided.
