export default async function handler(req, res, memory = []) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API_KEY environment variable" });
  }

  try {
    const { prompt } = req.body ?? {};
    if (!prompt) {
      return res
        .status(400)
        .json({ error: "Missing 'prompt' in request body." });
    }
    const recent = memory.slice(-MEMORY_LIMIT);
    const persona = `You are ecomers website Assisten Product V3 AI`;

    const upstream = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages: [
          { role: "system", content: persona },
          ...recent,
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!upstream.ok) {
      const details = await upstream.text();
      return res
        .status(upstream.status)
        .json({ error: "Failed to fetch from Mistral AI", details });
    }

    const data = await upstream.json();
    return res
      .status(200)
      .json({ response: data.choices?.[0]?.message?.content ?? null });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}