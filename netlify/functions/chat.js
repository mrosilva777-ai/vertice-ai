exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };
  try {
    const { system, user, max_tokens } = JSON.parse(event.body);
    if (!user) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing user message" }) };
    }
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: max_tokens || 1500,
        messages: [
          { role: "system", content: system || "Você é um assistente de marketing digital." },
          { role: "user", content: user }
        ],
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      return { statusCode: response.status, headers, body: JSON.stringify({ error: err.error?.message || "API error" }) };
    }
    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: data.choices?.[0]?.message?.content || "" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
