import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment platforms
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Local auth endpoint for admin login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // Simple hardcoded admin credentials
      if (username === "admin" && password === "admin") {
        res.json({ user: { id: "admin-1", username: "admin" } });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // No other local API routes - using external backend at https://sm-furnishing-backend.onrender.com/
  
  const httpServer = createServer(app);
  return httpServer;
}
