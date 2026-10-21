import axios from 'axios';
import https from 'node:https';

const agent = new https.Agent({
  rejectUnauthorized: false,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path, ...restParams } = req.query;
    const pathStr = Array.isArray(path) ? path.join('/') : (path || '');
    const targetUrl = `https://platon.grc.upv.es/sensingtools-api/${pathStr}`;

    const response = await axios.get(targetUrl, {
      params: restParams,
      httpsAgent: agent,
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
