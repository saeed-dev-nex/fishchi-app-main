import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  exportToDocx,
  formatBibliographyForWord,
  formatCitationForWord,
  formatCitationForWordTest,
  manageVancouverNumbering,
} from "../controllers/export.controller.js";

const router = express.Router();

// Basic test route to verify module loading
router.get("/test", (req, res) => {
  res.json({
    message: "Export routes are working",
    timestamp: new Date().toISOString(),
  });
});

router.post("/docx", protect, exportToDocx); // POST /api/v1/export/docx
router.post("/format-citation", protect, formatCitationForWord);

// Temporary test route without authentication for debugging
router.post("/format-citation-test", formatCitationForWordTest);
router.post("/format-bibliography", protect, formatBibliographyForWord);
router.post("/manage-vancouver-numbering", protect, manageVancouverNumbering);

export default router;
