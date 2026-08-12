// Vercel Serverless Function
// This runs on the server, never in the browser — so ANTHROPIC_API_KEY
// stays hidden from anyone viewing the page source or network tab.

const SYSTEM_PROMPT = `You are an expert Shutterstock contributor metadata assistant.
Given a single image, respond with ONLY a raw JSON object — no markdown code fences, no preamble, no explanation. Structure exactly:

{
  "title": "one clear sentence describing the main subject, action, and context of the image. No brand names, no trademarks, no assumptions about mood or intent — describe what is visibly there.",
  "keywords": ["30 to 45 lowercase English keywords ordered by relevance: main subject first, then action/context, then mood/concept, then technical terms like indoor, outdoor, daylight, copy space, close-up, etc. No duplicate or irrelevant keywords."],
  "flags": ["short notes on anything visible that may need clearance before upload: recognizable logos, trademarks, identifiable people (property/model release), private property, or copyrighted artwork. Return an empty array if none."]
}

Respond in English only for title and keywords, since Shutterstock buyers search primarily in English.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY belum ditetapkan di server. Tambah dalam Vercel Environment Variables.' });
    return;
  }

  const { base64, mediaType } = req.body || {};
  if (!base64 || !mediaType) {
    res.status(400).json({ error: 'Missing image data (base64 / mediaType).' });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              { type: 'text', text: 'Generate the Shutterstock metadata JSON for this image.' }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
      return;
    }

    const textBlock = (data.content || []).find(b => b.type === 'text');
    if (!textBlock) {
      res.status(500).json({ error: 'No text response from model.' });
      return;
    }

    const cleaned = textBlock.text.trim()
      .replace(/^```json/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process image', detail: String(err) });
  }
}
