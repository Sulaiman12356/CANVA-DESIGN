export default async function handler(req: any, res: any) {
  // CORS configuration for Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const fullName = (body.fullName || body.full_name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const whatsappNumber = (body.whatsappNumber || body.whatsapp || '').trim();
    const device = body.device || 'Smartphone';
    const canvaExperience = body.canvaExperience || body.canva_experience || 'Beginner';
    const learningInterest = body.learningInterest || body.learning_interest || 'Flyer Design & Visual Branding';

    if (!fullName || !email || !whatsappNumber) {
      return res.status(400).json({
        error: 'Full name, email address, and WhatsApp phone number are required.',
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `CDA-2026-${randomSuffix}`;
    const participantId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const participant = {
      id: participantId,
      full_name: fullName,
      email: email,
      whatsapp: whatsappNumber,
      device: device,
      canva_experience: canvaExperience,
      learning_interest: learningInterest,
      registration_date: now.toISOString().split('T')[0],
      registration_time: now.toTimeString().split(' ')[0],
      utm_source: body.utmSource || body.utm_source || 'Direct',
      utm_medium: body.utmMedium || body.utm_medium || 'none',
      utm_campaign: body.utmCampaign || body.utm_campaign || 'Canva Free Class',
      utm_content: body.utmContent || body.utm_content || '',
      utm_term: body.utmTerm || body.utm_term || '',
      ticket_number: ticketNumber,
      status: 'REGISTERED',
      whatsapp_joined: false,
      attendance_day_1: false,
      attendance_day_2: false,
      attendance_day_3: false,
      masterclass_interest: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: 'Registration successful! Welcome to the 3-Day Free Canva Design Class.',
      participant,
      ticketNumber,
      whatsappGroupLink: 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
      automationStatus: 'ACTIVE',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Server error during registration',
    });
  }
}
