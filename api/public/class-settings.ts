export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    className: '3-Day Free Canva Design Class',
    classTitle: '3-DAY FREE CANVA DESIGN CLASS',
    classSubtitle: "Learn how to use Canva to create clean, attractive and professional designs with your smartphone or laptop — even if you've never designed before.",
    classDescription: "Learn how to use Canva to create clean, attractive and professional designs with your smartphone or laptop — even if you've never designed before.",
    subtitle: "Learn how to use Canva to create clean, attractive and professional designs with your smartphone or laptop — even if you've never designed before.",
    description: "Learn how to use Canva to create clean, attractive and professional designs with your smartphone or laptop — even if you've never designed before.",
    classDate: 'Friday 5th – Sunday 7th September, 2026',
    classTime: '8:00 PM – 9:30 PM (WAT)',
    classStartTime: '8:00 PM',
    classEndTime: '9:30 PM',
    startTime: '8:00 PM',
    endTime: '9:30 PM',
    timezone: 'WAT (UTC+1)',
    classLink: 'https://meet.google.com/cda-canva-live',
    whatsappGroupLink: 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
    whatsapp_group_link: 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
    registrationStatus: 'OPEN',
    registration_status: 'OPEN',
    registrationDeadline: 'September 5, 2026, 7:59 PM',
    registration_deadline: 'September 5, 2026, 7:59 PM',
    availableSlots: 500,
    available_slots: 500,
    registeredCount: 428,
    totalRegistered: 428,
    total_registered: 428,
    ctaButtonText: 'RESERVE MY FREE SPOT',
    cta_button_text: 'RESERVE MY FREE SPOT',
    ctaButtonLink: '#register',
    cta_button_link: '#register',
    metaPixelId: '1065001129595286',
    meta_pixel_id: '1065001129595286',
    automationEnabled: true,
    automation_enabled: true,
    countdownTargetDate: '2026-09-05T20:00:00',
    countdown_target_date: '2026-09-05T20:00:00',
    founderImageUrl: '/sulaiman.jpg',
  });
}
