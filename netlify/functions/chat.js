exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { system, user, model, max_tokens } = JSON.parse(event.body);

    if (!user) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing user message" }) };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: max_tokens || 1500,
        system: system || "Você é um assistente de marketing digital especializado em microempresas brasileiras.",
        messages: [{ role: "user", content: user }],
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
      body: JSON.stringify({ text: data.content?.[0]?.text || "" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
