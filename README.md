# OKX On-Chain Earn Monitor

Monitor OKX On-Chain Earn platform limits in real-time with historical graphs.

## Features

- Real-time platform limit monitoring
- Historical data visualization
- Support for multiple tokens (OKSOL, BETH, etc.)
- Auto-refresh every minute

## Deployment

### Option 1: Vercel (Recommended)

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Import this repository
3. Deploy!

### Option 2: Local

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/okx-monitor.git
cd okx-monitor

# Open in browser (you need to be logged into OKX)
open index.html
# Or serve locally:
npx serve .
```

## Usage

1. Open the deployed site
2. Make sure you're logged into OKX
3. Select your token from the dropdown
4. View real-time platform limits and historical graphs

## Note

This tool requires you to be logged into OKX in the same browser due to API authentication requirements.

## Token IDs

- OKSOL: 880
- BETH: 250
