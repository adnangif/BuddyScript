import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "BuddyScript API",
    version: "1.0.0",
    description: "API documentation for BuddyScript social app",
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/app/api/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

