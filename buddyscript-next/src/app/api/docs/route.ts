import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@/lib/swagger";

export async function GET() {
  const html = swaggerUi.generateHTML(swaggerSpec);
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

