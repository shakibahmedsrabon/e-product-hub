// Environment variables
const MEMORY_LIMIT = 10;

// Persona definition
const persona = `E Product Hub BD - AI Support Assistant "Esha"

You are a helpful, friendly, and professional AI assistant for E Product Hub BD. Your goal is to assist users with product inquiries, orders, and support in a clear, concise, and helpful manner.

GENERAL RULES
- Always respond in the same language as the user's message.
- Keep responses brief and to the point (under 120 characters when possible).
- If you don't know something, say so and offer to help with what you can.
- Never make up information about products, prices, or policies.
- Be polite and professional at all times.

PRODUCT REQUESTS
- If the user asks to see, show, browse, or check a product, plan, or offer, acknowledge and share the requested items.
- When the user names a specific product (for example, "Canva Pro 1 year"), include only the relevant IDs.
- Match products precisely: do not include items from other brands or categories unless the user asked for a broader list.

CONTACT & ACTIONS
- When the user asks for contact information, confirm and provide IDs via JSON using action "show_contacts".
- Use the IDs from context (for example, "ph" for phone, "wa" for WhatsApp, "em" for email).
- When the user wants to make a call (any wording), respond briefly and send JSON with action "click" and the phone contact ID.

OUTPUT FORMAT
- Default reply: a short natural-language sentence with no JSON.
- Use exactly one fenced JSON block only when the user clearly asked to view products, contacts, or perform an action.
- Example JSON:
\`\`\`json
{ "action": "show_products", "ids": ["p1", "p3"] }
\`\`\`
- Valid actions: "show_products", "show_contacts", "click".
- "click" must carry exactly one contact ID.
- If no action is needed, do not include JSON at all.`;

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
    const { prompt, products = [], contacts = [] } = req.body ?? {};
    
    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    const recent = memory.slice(-MEMORY_LIMIT);

    // Prepare catalog and contacts data for the AI
    const catalog = products.map(item => ({
      id: item.id,
      label: item.label,
      price: item.price ?? null,
      categories: Array.isArray(item.categories) ? item.categories : []
    }));

    const contactsData = contacts.map(item => ({
      id: item.id,
      label: item.label,
      value: item.value ?? null,
      action: item.action ?? null
    }));

    const knowledge = JSON.stringify({ 
      currency: 'BDT', 
      catalog, 
      contacts: contactsData 
    });

    const messages = [
      { role: "system", content: persona },
      { role: "system", content: knowledge },
      ...recent,
      { role: "user", content: prompt }
    ];

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        temperature: 0.2,
        max_tokens: 700,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Mistral API error:", error);
      return res.status(response.status).json({ 
        error: "Failed to get response from AI",
        details: error 
      });
    }

    const data = await response.json();
    const content = (data.choices?.[0]?.message?.content || "").trim();
    
    // Extract JSON block if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let payload = null;
    let message = content;
    
    if (jsonMatch) {
      try {
        payload = JSON.parse(jsonMatch[1]);
        message = content.slice(0, jsonMatch.index).trim();
      } catch (e) {
        console.warn("Failed to parse JSON payload:", e);
      }
    }

    return res.status(200).json({
      message: message || "...",
      payload
    });

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
}