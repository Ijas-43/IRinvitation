/* ============================================================================
 * INVITATION CONFIGURATION — JASBIKA (Ijaz & Rasbika)
 * Islamic Nikah Invitation
 * Saturday, 26 December 2026 · ECR Masjid, Kottaipattinam
 * ==========================================================================*/

export interface NavItem {
  label: string;
  href: string;
}

export interface PersonDetails {
  key: 'groom' | 'bride';
  short: string;
  full: string;
  qualification: string;
  parentsTitle: string;
  father: string;
  mother: string;
  parentsSummary: string;
  label: string;
}

export interface WeddingEventItem {
  id: string;
  index: string;
  title: string;
  timeLabel: string;
  description: string;
  iso: string;
  venue: string;
  mapUrl: string;
}

export interface InvitationConfig {
  meta: {
    brand: string;
    monogram: string;
    groom: string;
    bride: string;
    groomFull: string;
    brideFull: string;
    groomQualification: string;
    brideQualification: string;
    date: string;
    dayName: string;
    dateDay: string;
    dateMonthYear: string;
    timezone: string;
    venue: string;
    address: string;
    map: string;
    /** Country code + phone digits (e.g. '919876543210') or empty string for universal picker */
    whatsapp: string;
    whatsappMessage: string;
    hashtag: string;
  };

  intro: {
    /** Master switch for the 3D envelope opening experience. */
    enabled: boolean;
    /** How often the envelope should play again for the same guest. */
    replay: 'session' | 'always' | 'never';
  };

  /** Copy for the luxury 3D envelope opening experience. */
  envelope: {
    /** Shown under the sealed envelope. */
    kicker: string;
    /** Call to action under the kicker. */
    tapLabel: string;
    /** Small note above the tap label. */
    sealedNote: string;
    /** Headline inside the invitation card. */
    invitedLabel: string;
    /** Sentence introducing the ceremony. */
    celebrateLabel: string;
    /** Warm invitation message. */
    message: string;
    /** Shown on the invitation card while it waits for the automatic hand-off. */
    openingLabel: string;
    /**
     * Seconds the invitation preview stays on screen before the guest is
     * handed over to the homepage automatically (no button needed).
     */
    autoEnterDelay: number;
    /** Accessible label of the interactive envelope. */
    openLabel: string;
    bismillah: string;
  };

  hero: {
    brand: string;
    monogram: string;
    bismillah: string;
    eyebrow: string;
    quote: string;
    names: string;
    dateText: string;
    venueText: string;
    blessing: string;
    ctaScroll: string;
    footerLine: string;
  };

  verse: {
    arabic: string;
    surah: string;
    translation: string;
    kicker: string;
    action: string;
    names: string;
    subtext: string;
  };

  couple: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    titleEm: string;
    brand: string;
    monogram: string;
    groom: PersonDetails;
    bride: PersonDetails;
  };

  beginning: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    titleEm: string;
    lead: string;
    sublead: string;
    brand: string;
  };

  countdown: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    titleEm: string;
    day: string;
    dateNum: string;
    monthYear: string;
    targetTime: string;
    doneMessage: string;
  };

  events: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    titleEm: string;
    lead: string;
    items: WeddingEventItem[];
  };

  venue: {
    eyebrow: string;
    title: string;
    subtitle: string;
    name: string;
    date: string;
    mapUrl: string;
    buttonLabel: string;
  };

  wishes: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    titleEm: string;
    lead: string;
    buttonLabel: string;
    copyLabel: string;
    shareLabel: string;
    sampleMessage: string;
  };

  finale: {
    enabled: boolean;
    heading: string;
    subheading: string;
    p1: string;
    p2: string;
    p3: string;
    names: string;
    date: string;
    brand: string;
  };

  music: {
    src: string;
    title: string;
    artist: string;
    volume: number;
  };

  nav: {
    brand: string;
    monogram: string;
    items: NavItem[];
    ctaLabel: string;
  };
}

/* ========================================================================== */

export const INVITE: InvitationConfig = {
  meta: {
    brand: 'Jasbika',
    monogram: 'I & R',
    groom: 'Ijaz',
    bride: 'Rasbika',
    groomFull: 'Ijaz Khan. S',
    brideFull: 'Rasbika Banu. M',
    groomQualification: 'MCA',
    brideQualification: 'Muballiga & B.Com (CA)',
    date: '2026-12-26T17:30:00+05:30',
    dayName: 'Saturday',
    dateDay: '26',
    dateMonthYear: 'December 2026',
    timezone: 'Asia/Kolkata',
    venue: 'ECR Masjid, Kottaipattinam',
    address: 'ECR Masjid, Kottaipattinam',
    map: 'https://maps.app.goo.gl/99cch99DEdXFG6nA9',
    /** Configurable WhatsApp number: Country code + phone without + or spaces (e.g. '919876543210').
     * If left as empty '', WhatsApp universal share will open smoothly allowing guest to pick contact. */
    whatsapp: '919585099241',
    whatsappMessage:
      'Assalamu Alaikum Ijaz & Rasbika! May Allah bless your Nikah with love, mercy, happiness, and endless barakah. May He unite your hearts in goodness and grant you a beautiful life together. Ameen.',
    hashtag: '#JasbikaWedding',
  },

  intro: {
    enabled: true,
    replay: 'session',
  },

  envelope: {
    kicker: 'A Special Invitation Awaits You',
    tapLabel: 'Tap to Open',
    sealedNote: 'Sealed with love & blessings',
    invitedLabel: 'You Are Cordially Invited',
    celebrateLabel: 'To Celebrate the Blessed Nikah of',
    message:
      'With the blessings of Allah and the love of our families, we warmly invite you to share in this beautiful beginning.',
    openingLabel: 'Opening Your Invitation...',
    autoEnterDelay: 3,
    openLabel: 'Open the wedding invitation envelope for Ijaz and Rasbika',
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  },

  hero: {
    brand: 'Jasbika',
    monogram: 'I & R',
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    eyebrow: 'A Beautiful Beginning',
    quote: 'With hearts full of gratitude, we invite our family and friends to share in the joy of our Nikah.',
    names: 'Ijaz & Rasbika',
    dateText: 'Saturday, 26 December 2026',
    venueText: 'ECR Masjid, Kottaipattinam',
    blessing: 'May Allah bless this new chapter with love, mercy, and barakah.',
    ctaScroll: 'Scroll to explore our invitation',
    footerLine: 'Nikah Celebration',
  },

  verse: {
    arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا',
    surah: 'Surah Ar-Rum 30:21',
    translation: '“And among His signs is that He created for you spouses from among yourselves.”',
    kicker: 'TOGETHER WITH THEIR FAMILIES',
    action: 'INVITE YOU TO CELEBRATE THEIR NIKAH',
    names: 'Ijaz & Rasbika',
    subtext: '“Two hearts, one beautiful journey. May Allah bless our days with love and barakah.”',
  },

  couple: {
    enabled: true,
    eyebrow: 'With the blessings of Allah & our families',
    title: 'Groom & Bride',
    titleEm: 'Family Introduction',
    brand: 'Jasbika',
    monogram: 'I & R',
    groom: {
      key: 'groom',
      short: 'Ijaz',
      full: 'Ijaz Khan. S',
      qualification: 'MCA',
      parentsTitle: 'Son of',
      father: 'Mr. Sheik Ali',
      mother: 'Mrs. Rajabu Nisha',
      parentsSummary: 'Beloved son of Mr. Sheik Ali & Mrs. Rajabu Nisha',
      label: 'The Groom',
    },
    bride: {
      key: 'bride',
      short: 'Rasbika',
      full: 'Rasbika Banu. M',
      qualification: 'Muballiga & B.Com (CA)',
      parentsTitle: 'Daughter of',
      father: 'Mr. Mohammed Rafeeq',
      mother: 'Mrs. Jasmine Begum',
      parentsSummary: 'Beloved daughter of Mr. Mohammed Rafeeq & Mrs. Jasmine Begum',
      label: 'The Bride',
    },
  },

  beginning: {
    enabled: true,
    eyebrow: 'Sacred Bond of Nikah',
    title: 'A Beautiful',
    titleEm: 'Beginning',
    lead: 'With prayers in our hearts and the warmth of our families, we embark on this sacred journey of Nikah. We seek your heartfelt duas as we unite under the blessings and mercy of Allah.',
    sublead: '“Two hearts, one beautiful journey. May Allah bless our days with love and barakah.”',
    brand: 'Jasbika',
  },

  countdown: {
    enabled: true,
    eyebrow: 'Save Our Date',
    title: 'The Blessed',
    titleEm: 'Countdown',
    day: 'SATURDAY',
    dateNum: '26',
    monthYear: 'DECEMBER 2026',
    targetTime: '5:30 PM IST',
    doneMessage: 'Alhamdulillah — A Beautiful New Chapter Begins.',
  },

  events: {
    enabled: true,
    eyebrow: 'Sacred Celebration',
    title: 'Event',
    titleEm: 'Schedule',
    lead: 'Every blessed moment, shared with our beloved family and friends.',
    items: [
      {
        id: 'welcome',
        index: '01',
        title: 'A Warm Welcome',
        timeLabel: '12:30 PM',
        description:
          'With warm hearts and heartfelt duas, we welcome our beloved family and friends to share in this blessed celebration.',
        iso: '2026-12-26T12:30:00+05:30',
        venue: 'ECR Masjid, Kottaipattinam',
        mapUrl: 'https://maps.app.goo.gl/99cch99DEdXFG6nA9',
      },
      {
        id: 'feast',
        index: '02',
        title: 'Wedding Feast',
        timeLabel: '1:30 PM',
        description:
          'Join us for a delightful wedding feast as we celebrate togetherness, gratitude, and the blessings of Allah.',
        iso: '2026-12-26T13:30:00+05:30',
        venue: 'ECR Masjid, Kottaipattinam',
        mapUrl: 'https://maps.app.goo.gl/99cch99DEdXFG6nA9',
      },
      {
        id: 'nikah',
        index: '03',
        title: 'Nikah Ceremony',
        timeLabel: '5:30 PM',
        description:
          'With the blessings of Allah and the love of our families, we begin a beautiful new chapter through the sacred bond of Nikah.',
        iso: '2026-12-26T17:30:00+05:30',
        venue: 'ECR Masjid, Kottaipattinam',
        mapUrl: 'https://maps.app.goo.gl/99cch99DEdXFG6nA9',
      },
      {
        id: 'duas',
        index: '04',
        title: 'Dua & Blessings',
        timeLabel: '5:30 PM',
        description:
          'Please join us in making heartfelt duas for a marriage filled with peace, mercy, understanding, and barakah.',
        iso: '2026-12-26T17:30:00+05:30',
        venue: 'ECR Masjid, Kottaipattinam',
        mapUrl: 'https://maps.app.goo.gl/99cch99DEdXFG6nA9',
      },
    ],
  },

  venue: {
    eyebrow: 'Wedding Venue',
    title: 'ECR Masjid, Kottaipattinam',
    subtitle: 'Where our sacred ceremony takes place',
    name: 'ECR Masjid, Kottaipattinam',
    date: 'Saturday, 26 December 2026',
    mapUrl: 'https://maps.app.goo.gl/99cch99DEdXFG6nA9',
    buttonLabel: 'Get Directions',
  },

  wishes: {
    enabled: true,
    eyebrow: 'Heartfelt Duas',
    title: 'Send Your Love',
    titleEm: '& Duas',
    lead: 'Your kind words, heartfelt wishes, and duas mean the world to us.',
    buttonLabel: 'Send Wishes on WhatsApp',
    copyLabel: 'Copy Dua Message',
    shareLabel: 'Share Invitation',
    sampleMessage:
      'Assalamu Alaikum Ijaz & Rasbika! May Allah bless your Nikah with love, mercy, happiness, and endless barakah. May He unite your hearts in goodness and grant you a beautiful life together. Ameen.',
  },

  finale: {
    enabled: true,
    heading: 'WITH LOVE & DUAS',
    subheading: 'To Our Family & Friends',
    p1: 'Your presence will make our special day even more meaningful.',
    p2: 'Please keep us in your duas as we begin this beautiful journey together.',
    p3: "We can't wait to celebrate with you.",
    names: 'Ijaz & Rasbika',
    date: '26 December 2026',
    brand: 'Jasbika',
  },

  music: {
    src: 'assets/audio/wedding-background.mpeg',
    title: 'Jasbika Nikah Theme',
    artist: 'Wedding Instrumental',
    volume: 0.5,
  },

  nav: {
    brand: 'Jasbika',
    monogram: 'I & R',
    ctaLabel: 'Send Duas',
    items: [
      { label: 'Blessings', href: '#blessings' },
      { label: 'Family', href: '#couple' },
      { label: 'Date & Countdown', href: '#date' },
      { label: 'Schedule', href: '#events' },
      { label: 'Venue', href: '#venue' },
      { label: 'Duas & Wishes', href: '#wishes' },
    ],
  },
};

/* ---------- Derived helpers ---------- */

export const WEDDING_DATE = new Date(INVITE.meta.date);

export function formatDisplayDate(
  iso: string = INVITE.meta.date,
  timezone = INVITE.meta.timezone,
  locale = 'en-IN',
): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatLongDate(
  iso: string = INVITE.meta.date,
  timezone = INVITE.meta.timezone,
): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  }).format(new Date(iso));
}

function toGCalStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Google Calendar "add event" URL for any configured event */
export function calendarUrlFor(
  iso: string = INVITE.meta.date,
  title: string = 'Nikah Ceremony of Ijaz & Rasbika (Jasbika)',
  details: string = 'ECR Masjid, Kottaipattinam. May Allah bless their union.',
  location: string = 'ECR Masjid, Kottaipattinam',
): string {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toGCalStamp(start)}/${toGCalStamp(end)}`,
    details,
    location,
    ctz: INVITE.meta.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Flat .ics file download */
export function icsDataUrl(
  iso: string = INVITE.meta.date,
  title: string = 'Nikah Ceremony of Ijaz & Rasbika',
  details: string = 'Jasbika Wedding at ECR Masjid, Kottaipattinam',
  location: string = 'ECR Masjid, Kottaipattinam',
): string {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const stamp = (d: Date) => toGCalStamp(d);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jasbika Islamic Nikah Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${start.getTime()}@jasbika-invitation`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

/** WhatsApp direct / universal link generator */
export function getWhatsAppUrl(
  phone: string = INVITE.meta.whatsapp,
  message: string = INVITE.meta.whatsappMessage,
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  // Universal share link if no phone number configured
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
