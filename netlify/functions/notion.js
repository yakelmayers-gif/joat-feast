const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;
const NOTION_VERSION = "2022-06-28";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const path = event.queryStringParameters?.path || "";
  const method = event.httpMethod;

  let url = "";
  if (path === "query") url = `https://api.notion.com/v1/databases/${DB_ID}/query`;
  else if (path === "create") url = `https://api.notion.com/v1/pages`;
  else if (path.startsWith("update/")) url = `https://api.notion.com/v1/pages/${path.replace("update/", "")}`;
  else if (path.startsWith("delete/")) url = `https://api.notion.com/v1/pages/${path.replace("delete/", "")}`;
  else return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown path" }) };

  const notionMethod = path === "query" ? "POST" : path === "create" ? "POST" : "PATCH";

  let body = undefined;
  if (path === "query") body = JSON.stringify({ sorts: [{ property: "Order", direction: "ascending" }] });
  else if (event.body) body = event.body;

  try {
    const res = await fetch(url, {
      method: notionMethod,
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      },
      body
    });
    const data = await res.json();
    return { statusCode: res.status, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
