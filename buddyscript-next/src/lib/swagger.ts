import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "BuddyScript API",
        version: "1.0.0",
        description:
          "API documentation for BuddyScript social media application. This API provides endpoints for user authentication, posts, comments, likes, and image uploads.",
        contact: {
          name: "BuddyScript Team",
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api",
          description: "API Server",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter your JWT token in the format: Bearer <token>",
          },
        },
        schemas: {
          User: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
                description: "User ID",
              },
              firstName: {
                type: "string",
                description: "User's first name",
              },
              lastName: {
                type: "string",
                description: "User's last name",
              },
              email: {
                type: "string",
                format: "email",
                description: "User's email address",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Account creation timestamp",
              },
            },
          },
          Post: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
              },
              content: {
                type: "string",
                maxLength: 500,
              },
              imageUrl: {
                type: "string",
                format: "uri",
                nullable: true,
              },
              isPublic: {
                type: "boolean",
              },
              userId: {
                type: "string",
                format: "uuid",
              },
              user: {
                $ref: "#/components/schemas/User",
              },
              likesCount: {
                type: "integer",
              },
              commentsCount: {
                type: "integer",
              },
              isLikedByUser: {
                type: "boolean",
              },
              createdAt: {
                type: "string",
                format: "date-time",
              },
            },
          },
          Comment: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
              },
              content: {
                type: "string",
                maxLength: 1000,
              },
              userId: {
                type: "string",
                format: "uuid",
              },
              postId: {
                type: "string",
                format: "uuid",
              },
              parentCommentId: {
                type: "string",
                format: "uuid",
                nullable: true,
              },
              user: {
                $ref: "#/components/schemas/User",
              },
              likesCount: {
                type: "integer",
              },
              repliesCount: {
                type: "integer",
              },
              isLikedByUser: {
                type: "boolean",
              },
              createdAt: {
                type: "string",
                format: "date-time",
              },
            },
          },
          Error: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Error message",
              },
            },
          },
          ValidationError: {
            type: "object",
            properties: {
              errors: {
                type: "object",
                additionalProperties: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                description: "Field-level validation errors",
              },
            },
          },
        },
      },
      tags: [
        {
          name: "Authentication",
          description: "User authentication endpoints",
        },
        {
          name: "Posts",
          description: "Post management endpoints",
        },
        {
          name: "Comments",
          description: "Comment management endpoints",
        },
        {
          name: "Likes",
          description: "Like management endpoints",
        },
        {
          name: "Upload",
          description: "File upload endpoints",
        },
      ],
    },
  });
  return spec;
};

