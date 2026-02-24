// Vercel API proxy for OKX - with API key authentication
import crypto from 'crypto';

const API_KEY = '558acda2-33c7-4808-ad58-53a68b9701d2';
const SECRET = 'D248DBEFD03D9FC98DA56B233658E9E9';
const PASSPHRASE = 'QwRBHpHYCyHGK90$#v';

function generateSignature(timestamp, method, path, body = '') {
    const message = timestamp + method + path + body;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(message);
    return hmac.digest('base64');
}

export default async function handler(req, res) {
    const { token = 'SOL' } = req.query;
    
    // Token mapping - lowercase for API
    const tokenMap = {
        'SOL': 'sol',
        'OKSOL': 'oksol',
        'BETH': 'beth',
        'ETH': 'eth',
        'BTC': 'btc'
    };
    
    const apiToken = tokenMap[token] || token.toLowerCase();
    const path = `/api/v5/finance/staking-defi/${apiToken}/product-info`;
    
    const timestamp = new Date().toISOString();
    const signature = generateSignature(timestamp, 'GET', path);
    
    try {
        const response = await fetch(`https://www.okx.com${path}`, {
            method: 'GET',
            headers: {
                'OK-ACCESS-KEY': API_KEY,
                'OK-ACCESS-TIMESTAMP': timestamp,
                'OK-ACCESS-SIGN': signature,
                'OK-ACCESS-PASSPHRASE': PASSPHRASE,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        
        if (response.ok && data.code === '0') {
            // Transform the data to include token name
            const result = {
                code: '0',
                data: [{
                    ...data.data,
                    token: token,
                    platformFastRedemptionLimit: data.data.fastRedemptionDailyLimit,
                    platformFastRedemptionAvail: data.data.fastRedemptionAvail
                }]
            };
            return res.status(200).json(result);
        } else {
            return res.status(200).json(data);
        }
    } catch (error) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: error.message });
    }
}
