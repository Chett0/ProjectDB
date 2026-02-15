import swaggerJsdoc from "swagger-jsdoc";
import { config } from 'dotenv';
import path from "path/win32";

config();
const PORT = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TAW Project API",
      version: "1.0.0",
      description: "API documentation for the TAW Project",
      security : [{
        bearerAuth: []
      }]
    },
    components: {
      securitySchemes: {
        bearerAuth: { // This name is used as a reference below
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // This applies security globally to all endpoints
    security: [{
      bearerAuth: [],
    }],
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js"), path.join(__dirname, "../dtos/*.ts")], // where your endpoint comments live
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
