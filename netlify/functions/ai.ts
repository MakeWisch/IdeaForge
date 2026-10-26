import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { executeAITask } from "../../server/ai/aiService";
import { registry } from "../../server/ai/providerRegistry";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ""
    };
  }

  // Handle status inquiry (GET /api/ai/status or GET /.netlify/functions/ai)
  if (event.httpMethod === "GET") {
    try {
      const status = registry.getStatus();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(status)
      };
    } catch (err: any) {
      console.error("Netlify function status error:", err);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          error: err?.message || "Failed to retrieve provider status",
          errorCode: "STATUS_ERROR"
        })
      };
    }
  }

  // Handle AI task execution (POST)
  if (event.httpMethod === "POST") {
    try {
      let body: any = {};
      if (event.body) {
        const rawBody = event.isBase64Encoded
          ? Buffer.from(event.body, "base64").toString("utf-8")
          : event.body;
        body = JSON.parse(rawBody);
      }

      const result = await executeAITask(body);
      const statusCode = result.success ? 200 : (result.errorCode === "AUTH_ERROR" ? 401 : 500);

      return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(result)
      };
    } catch (err: any) {
      console.error("Netlify function /ai execution error:", err);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          error: err?.message || "Internal serverless execution error",
          errorCode: "SERVER_ERROR"
        })
      };
    }
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: false,
      error: `Method ${event.httpMethod} not allowed. Please use POST or GET.`,
      errorCode: "METHOD_NOT_ALLOWED"
    })
  };
};
