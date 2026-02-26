// Vercel API proxy for OKX - with API key authentication
import crypto from 'crypto';

function generateSignature(timestamp, method, path, body = '') {
    const SECRET = process.env.OKX_SECRET;
    if (!SECRET) {
        throw new Error('OKX_SECRET not configured');
    }
    const message = timestamp + method + path + body;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(message);
    return hmac.digest('base64');
}

export default async function handler(req, res) {
    const { token = 'SOL' } = req.query;
    
    const API_KEY = process.env.OKX_API_KEY;
    const SECRET = process.env.OKX_SECRET;
    let PASSPHRASE = process.env.OKX_PASSPHRASE;
    
    // URL decode passphrase if needed (Vercel may encode special chars)
    try {
        PASSPHRASE = decodeURIComponent(PASSPHRASE);
    } catch (e) {}
    
    if (!API_KEY || !SECRET || !PASSPHRASE) {
        return res.status(500).json({ 
            error: 'API credentials not configured',
            hasApiKey: !!API_KEY,
            hasSecret: !!SECRET,
            hasPassphrase: !!PASSPHRASE
        });
    }
    
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
            return res.status(200).json({
                code: '0',
                data: [{
                    ...data.data,
                    token: token,
                    platformFastRedemptionLimit: data.data.fastRedemptionDailyLimit,
                    platformFastRedemptionAvail: data.data.fastRedemptionAvail
                }]
            });
        } else {
            return res.status(200).json(data);
        }
    } catch (error) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: error.message });
    }
}
