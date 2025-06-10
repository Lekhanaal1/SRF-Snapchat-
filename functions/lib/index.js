"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.updateDevoteeProfile = exports.getDevoteeStats = exports.getDevoteesByRegion = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
// Initialize Firebase Admin
admin.initializeApp();
// Enable CORS
const corsHandler = (0, cors_1.default)({ origin: true });
// Define regions for global deployment
const regions = [
    "us-central1", // North America
    "asia-east1", // Asia
    "europe-west1", // Europe
    "australia-southeast1", // Australia
    "southamerica-east1", // South America
    "asia-south1", // India
    "asia-northeast1" // Japan
];
// Helper function to create functions in multiple regions
const createGlobalFunction = (name, handler) => {
    return regions.map(region => functions.region(region).https.onRequest(async (req, res) => {
        return new Promise((resolve, reject) => {
            corsHandler(req, res, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(handler(req, res));
            });
        });
    }));
};
// Get devotees by region
exports.getDevoteesByRegion = createGlobalFunction("getDevoteesByRegion", async (req, res) => {
    var _a;
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
            const lastDocRef = await db.collection("devotees").doc(lastDoc).get();
            query = query.startAfter(lastDocRef);
        }
        const snapshot = await query.get();
        const devotees = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.json({ devotees, lastDoc: (_a = snapshot.docs[snapshot.docs.length - 1]) === null || _a === void 0 ? void 0 : _a.id });
    }
    catch (error) {
        console.error("Error fetching devotees:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get devotee statistics
exports.getDevoteeStats = createGlobalFunction("getDevoteeStats", async (req, res) => {
    try {
        const db = admin.firestore();
        const stats = {
            total: 0,
            byRegion: {},
            byContinent: {
                "North America": 0,
                "South America": 0,
                "Europe": 0,
                "Asia": 0,
                "Africa": 0,
                "Australia": 0,
                "Antarctica": 0
            }
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
                stats.byContinent[data.continent]++;
            }
        });
        res.json(stats);
    }
    catch (error) {
        console.error("Error fetching devotee stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update devotee profile
exports.updateDevoteeProfile = createGlobalFunction("updateDevoteeProfile", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const db = admin.firestore();
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
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
        await db.collection("devotees").doc(id).update(Object.assign(Object.assign({}, updates), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        res.json({ success: true });
    }
    catch (error) {
        console.error("Error updating devotee profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Health check endpoint
exports.healthCheck = createGlobalFunction("healthCheck", async (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        region: process.env.FUNCTION_REGION
    });
});
//# sourceMappingURL=index.js.map