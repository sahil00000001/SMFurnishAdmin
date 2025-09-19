import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment platforms
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // No local API routes - using external backend at https://sm-furnishing-backend.onrender.com/
  
  const httpServer = createServer(app);
  return httpServer;
}
