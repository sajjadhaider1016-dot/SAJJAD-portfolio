// Vercel function: hands the contact form its Web3Forms access key, as the previous site did.
// Set the key in the Vercel project's environment variables as WEB3FORMS_ACCESS_KEY.
export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || process.env.WEB3FORMS_KEY;
  res.setHeader('Cache-Control', 'no-store');
  return accessKey ? res.status(200).json({ accessKey }) : res.status(503).json({ error: 'Contact delivery is not configured' });
}
