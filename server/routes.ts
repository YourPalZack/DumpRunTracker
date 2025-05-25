import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertDumpRunSchema,
  insertDumpRunParticipantSchema,
  insertPickupRequestSchema,
  insertChatMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  const httpServer = createServer(app);

  // Set up WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Broadcast the message to all clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });

        // Store the message in the database
        if (data.type === 'chat_message' && data.dumpRunId && data.userId && data.message) {
          storage.createChatMessage({
            dumpRunId: data.dumpRunId,
            userId: data.userId,
            message: data.message
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
  });

  // Dump Sites API
  app.get("/api/dump-sites", async (req, res) => {
    try {
      const dumpSites = await storage.getAllDumpSites();
      res.json(dumpSites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dump sites" });
    }
  });

  // Dump Runs API
  app.get("/api/dump-runs", async (req, res) => {
    try {
      const dumpRuns = await storage.getAllDumpRuns();
      res.json(dumpRuns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dump runs" });
    }
  });

  app.get("/api/dump-runs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dumpRun = await storage.getDumpRunWithDetails(id);
      if (!dumpRun) {
        return res.status(404).json({ error: "Dump run not found" });
      }
      res.json(dumpRun);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dump run" });
    }
  });

  app.post("/api/dump-runs", authenticateUser, async (req, res) => {
    try {
      const validatedData = insertDumpRunSchema.parse({
        ...req.body,
        organizerId: req.user?.id
      });
      
      const dumpRun = await storage.createDumpRun(validatedData);
      res.status(201).json(dumpRun);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create dump run" });
    }
  });

  app.post("/api/dump-runs/:id/join", authenticateUser, async (req, res) => {
    try {
      const dumpRunId = parseInt(req.params.id);
      const userId = req.user?.id;

      const validatedData = insertDumpRunParticipantSchema.parse({
        dumpRunId,
        userId,
        ...req.body
      });
      
      const participant = await storage.joinDumpRun(validatedData);
      
      // Create activity for organizer
      const dumpRun = await storage.getDumpRun(dumpRunId);
      if (dumpRun) {
        await storage.createActivity({
          userId: dumpRun.organizerId,
          type: "request_received",
          content: `Someone requested to join your "${dumpRun.title}" dump run`,
          relatedEntityId: dumpRunId,
          relatedEntityType: "dumpRun"
        });
      }
      
      res.status(201).json(participant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to join dump run" });
    }
  });

  app.patch("/api/dump-runs/:runId/participants/:participantId", authenticateUser, async (req, res) => {
    try {
      const runId = parseInt(req.params.runId);
      const participantId = parseInt(req.params.participantId);
      
      // Verify user is organizer
      const dumpRun = await storage.getDumpRun(runId);
      if (!dumpRun || dumpRun.organizerId !== req.user?.id) {
        return res.status(403).json({ error: "Not authorized to update participants" });
      }
      
      const status = req.body.status;
      if (status !== "approved" && status !== "rejected") {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const participant = await storage.updateDumpRunParticipant(participantId, { status });
      
      // Create activity for participant
      if (participant) {
        await storage.createActivity({
          userId: participant.userId,
          type: status === "approved" ? "request_approved" : "request_rejected",
          content: `Your request to join "${dumpRun.title}" was ${status}`,
          relatedEntityId: runId,
          relatedEntityType: "dumpRun"
        });
      }
      
      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to update participant status" });
    }
  });

  // Pickup Requests API
  app.post("/api/pickup-requests", authenticateUser, async (req, res) => {
    try {
      const validatedData = insertPickupRequestSchema.parse({
        ...req.body,
        userId: req.user?.id
      });
      
      const pickupRequest = await storage.createPickupRequest(validatedData);
      res.status(201).json(pickupRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create pickup request" });
    }
  });

  app.get("/api/pickup-requests", authenticateUser, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const pickupRequests = await storage.getPickupRequestsByUser(userId);
      res.json(pickupRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pickup requests" });
    }
  });

  // My Runs API
  app.get("/api/my-dump-runs", authenticateUser, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const dumpRuns = await storage.getUserDumpRuns(userId);
      res.json(dumpRuns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user dump runs" });
    }
  });

  app.get("/api/my-joined-runs", authenticateUser, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const joinedRuns = await storage.getUserJoinedRuns(userId);
      res.json(joinedRuns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch joined runs" });
    }
  });

  // Activities API
  app.get("/api/activities", authenticateUser, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const activities = await storage.getUserActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.patch("/api/activities/:id/read", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      
      const activity = await storage.getActivity(id);
      if (!activity || activity.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to update this activity" });
      }
      
      const updatedActivity = await storage.markActivityAsRead(id);
      res.json(updatedActivity);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark activity as read" });
    }
  });

  // Chat Messages API
  app.get("/api/dump-runs/:id/messages", authenticateUser, async (req, res) => {
    try {
      const dumpRunId = parseInt(req.params.id);
      const messages = await storage.getDumpRunMessages(dumpRunId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/dump-runs/:id/messages", authenticateUser, async (req, res) => {
    try {
      const dumpRunId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      const validatedData = insertChatMessageSchema.parse({
        dumpRunId,
        userId,
        message: req.body.message
      });
      
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create chat message" });
    }
  });

  return httpServer;
}

function authenticateUser(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
