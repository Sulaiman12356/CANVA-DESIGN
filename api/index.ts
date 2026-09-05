import registerHandler from './register';
import classSettingsHandler from './public/class-settings';
import healthHandler from './health';

export default async function handler(req: any, res: any) {
  // CORS configuration
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

  const url = req.url || '';

  if (url.includes('/public/class-settings')) {
    return classSettingsHandler(req, res);
  }

  if (url.includes('/register')) {
    return registerHandler(req, res);
  }

  if (url.includes('/health')) {
    return healthHandler(req, res);
  }

  return res.status(200).json({
    status: 'ok',
    message: 'Clarity Digital Academy API running',
    domain: 'canvadesigntraining.vercel.app',
    timestamp: new Date().toISOString(),
  });
}
