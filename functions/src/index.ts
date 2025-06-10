import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";
import { Request, Response } from "express";

// Initialize Firebase Admin
admin.initializeApp();

// Enable CORS
const corsHandler = cors({ origin: true });

// Define regions for global deployment
const regions = [
  "us-central1",    // North America
  "asia-east1",     // Asia
  "europe-west1",   // Europe
  "australia-southeast1", // Australia
  "southamerica-east1",   // South America
  "asia-south1",    // India
  "asia-northeast1" // Japan
] as const;

type Continent = "North America" | "South America" | "Europe" | "Asia" | "Africa" | "Australia" | "Antarctica";

// Helper function to create functions in multiple regions
const createGlobalFunction = (
  name: string,
  handler: (req: Request, res: Response) => Promise<void>
) => {
  return regions.map(region => 
    functions.region(region).https.onRequest(async (req, res) => {
      return new Promise((resolve, reject) => {
        corsHandler(req, res, (err?: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(handler(req, res));
        });
      });
    })
  );
};

// Get devotees by region
export const getDevoteesByRegion = createGlobalFunction("getDevoteesByRegion", async (req, res) => {
  try {
    const { region, limit = 100, lastDoc } = req.query;
    const db = admin.firestore();
    
    let query = db.collection("devotees")
      .where("isApproved", "==", true)
      .where("isVisible", "==", true)
      .orderBy("createdAt", "desc")
      .limit(Number(limit));

    if (region) {
      query = query.where("region", "==", region);
    }

    if (lastDoc) {
      const lastDocRef = await db.collection("devotees").doc(lastDoc as string).get();
      query = query.startAfter(lastDocRef);
    }

    const snapshot = await query.get();
    const devotees = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ devotees, lastDoc: snapshot.docs[snapshot.docs.length - 1]?.id });
  } catch (error) {
    console.error("Error fetching devotees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get devotee statistics
export const getDevoteeStats = createGlobalFunction("getDevoteeStats", async (req, res) => {
  try {
    const db = admin.firestore();
    const stats = {
      total: 0,
      byRegion: {} as Record<string, number>,
      byContinent: {
        "North America": 0,
        "South America": 0,
        "Europe": 0,
        "Asia": 0,
        "Africa": 0,
        "Australia": 0,
        "Antarctica": 0
      } as Record<Continent, number>
    };

    const snapshot = await db.collection("devotees")
      .where("isApproved", "==", true)
      .where("isVisible", "==", true)
      .get();

    snapshot.forEach(doc => {
      const data = doc.data();
      stats.total++;
      
      // Count by region
      if (data.region) {
        stats.byRegion[data.region] = (stats.byRegion[data.region] || 0) + 1;
      }

      // Count by continent
      if (data.continent && Object.keys(stats.byContinent).includes(data.continent)) {
        stats.byContinent[data.continent as Continent]++;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error("Error fetching devotee stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update devotee profile
export const updateDevoteeProfile = createGlobalFunction("updateDevoteeProfile", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = admin.firestore();

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (decodedToken.uid !== id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Update profile
    await db.collection("devotees").doc(id).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating devotee profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
export const healthCheck = createGlobalFunction("healthCheck", async (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    region: process.env.FUNCTION_REGION
  });
}); 