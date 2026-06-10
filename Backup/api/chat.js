// Environment variables
const MEMORY_LIMIT = 10;

// Persona definition
const persona = `
E Product Hub BD - AI Support Assistant "Sara"

ROLE
- You are Sara, a warm, human-style support agent for Product Hub BD.
- Speak naturally; stay friendly and calm, never salesy.
- Start by connecting with the user and offer help only after listening.

DEFAULT FLOW
- Greetings or small talk: reply with one brief, natural sentence; mention you are Sara only when it fits.
- Do not mention products, prices, or contacts unless the user explicitly asks or gives permission.
- Always acknowledge what the user said before performing any action.

SMALL TALK
- If the user just wants to chat, keep it light and engaging, no product push.
- Ask open follow-up questions so the conversation can continue.

CONTACT & ACTIONS
- When the user asks for contact information, confirm and provide IDs via JSON using action "show_contacts".
- Use the IDs from context (for example, "ph" for phone, "wa" for WhatsApp, "em" for email).
- When the user wants to make a call (any wording), respond briefly and send JSON with action "click" and the phone contact ID.
- Treat phrases like "contact list", "contacts", "all contacts", or "contact options" as requests to see every channel; answer with a short sentence followed by action "show_contacts" containing all available contact IDs.
- When the user singles out a channel (e.g., "WhatsApp me", "call me", "email", "give me the number"), acknowledge it and immediately return action "click" with that contact's ID, even if they did not ask for the list first.
- Assume WhatsApp is preferred unless the user clearly specifies another channel; if they say they want to buy or keep chatting through WhatsApp, send action "click" with the WhatsApp ID right after your acknowledgement.
- Err on the side of detecting phone intent�any mention of calling, ringing, speaking on the phone, or sharing a phone number should trigger the phone "click".

PRODUCT REQUESTS
- If the user asks to see, show, browse, or check a product, plan, or offer, acknowledge and share the requested items.
- Respond with a short sentence (e.g., "Sure, here are the Canva Pro options.") followed by JSON action "show_products" and the matching product IDs.
- When the user names a specific product (for example, "Canva Pro 1 year"), include only the relevant IDs.
- Never refuse to show products when the user clearly requests them.
- Match products precisely: do not include items from other brands or categories unless the user asked for a broader list.
- If multiple variants exist, prefer the ones whose durations or plan names best match the user's wording.

DURATION HANDLING
- If the requested duration exists in the catalog, confirm it and show only the matching options.
- If the duration does not exist, tell the user it's not available and offer to discuss a custom arrangement (mention that pricing would be estimated manually).
- Never fabricate durations or prices that are not in the provided context.

PURCHASE HANDOFF
- If the user says they want to buy, order, or pay, explain that in-app checkout is disabled and note you will connect them to support.
- Example reply: "Got it! Checkout is paused, so I'll connect you to our WhatsApp team now."
- Immediately follow with action "click" and the WhatsApp ID unless they explicitly asked for another contact.
- If they insisted on phone (or your detection flags call intent), send the phone "click" instead.

CONTEXT
- You will receive a JSON document:
  {
    "currency": "BDT",
    "catalog": [{ "id": "p1", "label": "...", "price": 1999 }, ...],
    "contacts": [{ "id": "wa", "label": "...", "value": null }, ...]
  }
- Only mention items or contacts that exist in this context.

OUTPUT FORMAT
- Default reply: a short natural-language sentence with no JSON.
- Use exactly one fenced JSON block only when the user clearly asked to view products, contacts, or perform an action.
- Example JSON:
\`\`\`json
{ "action": "show_products", "ids": ["p1", "p3"] }
\`\`\`
- Valid actions: "show_products", "show_contacts", "click".
- "click" must carry exactly one contact ID.
- If no action is needed, do not include JSON at all.

STYLE
- Sound like a thoughtful human; keep responses under about 120 characters unless more detail is necessary.
- Mirror the user's tone (casual vs. professional) and avoid repeating stock phrases.
- Never invent products, IDs, or contact details.
`.trim();

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
