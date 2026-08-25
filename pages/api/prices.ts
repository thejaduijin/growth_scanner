import type { NextApiRequest, NextApiResponse } from 'next';

type PriceData = {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceData[] | { error: string }>
) {
  const { symbols } = req.query;
  if (!symbols || typeof symbols !== 'string') {
    return res.status(400).json({ error: 'Missing symbols' });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) throw new Error('Yahoo Finance error');

    const data = await response.json();
    const results = data.quoteResponse?.result || [];

    const prices: PriceData[] = results.map((r: any) => ({
      symbol: r.symbol,
      price: r.regularMarketPrice,
      change: r.regularMarketChange,
      changePercent: r.regularMarketChangePercent,
    }));

    res.status(200).json(prices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
}