// Vercel API proxy for OKX
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
  const url = `https://www.okx.com/v3/defi-staking/earn/lst/holding-summary?currencyId=${currencyId}&savingType=5001&t=${Date.now()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
