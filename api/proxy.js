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
    const { token = 'OKSOL' } = req.query;
    
    // Token currency IDs
    const tokenIds = {
        'OKSOL': 880,
        'BETH': 250,
        'BTC': 1,
        'ETH': 2,
        'SOL': 9
    };
    
    const currencyId = tokenIds[token] || 880;
    
    // Try different endpoints
    const endpoints = [
        `/v3/defi-staking/earn/lst/holding-summary?currencyId=${currencyId}&savingType=5001`,
        `/api/v5/finance/savings/orders?ccy=BETH`,
        `/api/v5/finance/savings/orders`
    ];
    
    const timestamp = new Date().toISOString();
    
    for (const path of endpoints) {
        try {
            const signature = generateSignature(timestamp, 'GET', path);
            
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
                return res.status(200).json(data);
            }
        } catch (e) {
            console.log(`Failed ${path}:`, e.message);
        }
    }
    
    // If all endpoints fail, try the public endpoint anyway
    try {
        const url = `https://www.okx.com/v3/defi-staking/earn/lst/holding-summary?currencyId=${currencyId}&savingType=5001`;
        const response = await fetch(url);
        const data = await response.json();
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        if (response.ok && data.code === '0') {
            return res.status(200).json(data);
        }
    } catch (e) {
        // Last resort failed
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
        error: 'API key lacks Finance/Earn permissions. User needs to enable Finance read permission in OKX API settings.' 
    });
}
