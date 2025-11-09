import asyncHandler from "express-async-handler";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-csl";
import Source from "../models/Source.model.js";
import ApiResponse from "../utils/apiResponse.js";
import { mapSourceToCSL } from "../utils/cslMapper.js";
import {
  formatBibliography,
  formatCitations,
  resetVancouverNumbering,
  getVancouverOrder,
  setVancouverOrder,
} from "../utils/citationEngine.js";
/**
 * @desc Export sources to DOCX
 * @route POST /api/v1/export/docx
 * @access Private
 */
const exportToDocx = asyncHandler(async (req, res) => {
  console.log(" ------------- start export to docx handler ------------");

  console.log(req.body);
  // get sources Ids and citation style from body
  const { sourceIds: sourceIds, style = "apa" } = req.body;

  if (!sourceIds || !style) {
    res.status(400);
    throw new Error("sourceIds و style الزامی هستند");
  }

  //   1. Get sources from database
  const sources = await Source.find({ _id: { $in: sourceIds } });
  //   2. check current user (logged in user) is owner of selected sources
  for (const source of sources) {
    if (source.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error(`شما مجاز به دسترسی به منبع با ID: ${source._id} نیستید`);
    }
  }
  // 3. Generate cites using citation-js
  const citationParagraphs = sources.map((source) => {
    let clsData =
      source.rawCSL && Object.keys(source.rawCSL).length > 0
        ? source.rawCSL
        : mapSourceToCSL(source);
    const cite = new Cite(clsData);
    const citationText = cite.format("bibliography", {
      format: "text",
      template: style,
      lang: "en-US",
    });
    // Create a paragraph for each citation
    return new Paragraph({
      text: citationText,
      style: "ListParagraph",
    });
  });
  //   4. Create a document and add citation paragraphs
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "فهرست منابع",
            heading: HeadingLevel.HEADING_1,
            alignment: "right",
          }),
          ...citationParagraphs,
        ],
      },
    ],
  });

  // 5. convert document to buffer
  const buffer = await Packer.toBuffer(doc);
  // 6. set headers for response
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="bibliography.docx"',
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  // 7. send file
  res.send(buffer);
});
/**
 * @desc    Format a citation for Word Add-in
 * @route   POST /api/v1/export/format-citation
 * @access  Private
 */
const formatCitationForWord = asyncHandler(async (req, res) => {
  try {
    console.log("=== FORMAT CITATION REQUEST ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?._id);

    const {
      sourceId,
      style = "apa",
      citationOrder = [],
      resetVancouverOrder = false,
    } = req.body;
    const userId = req.user._id;

    // Input validation
    if (!sourceId) {
      console.log("❌ Missing sourceId in request");
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Source ID is required"));
    }

    if (!userId) {
      console.log("❌ Missing user ID in request");
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    console.log(`🔍 Looking for source: ${sourceId} for user: ${userId}`);

    // 1. Find the source document from the database
    const source = await Source.findOne({ _id: sourceId, user: userId });
    if (!source) {
      console.log("❌ Source not found or access denied");
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Source not found"));
    }

    console.log("✅ Source found:", source.title);

    // 2. Map the MongoDB document to CSL-JSON format
    console.log("📝 Mapping source to CSL format...");
    let cslItem;
    try {
      cslItem = mapSourceToCSL(source);
      cslItem.id = source._id.toString(); // Ensure CSL item has an 'id'
      console.log("✅ CSL mapping successful");
      console.log("CSL item:", JSON.stringify(cslItem, null, 2));
    } catch (mappingError) {
      console.error("❌ CSL mapping failed:", mappingError);
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            null,
            `CSL mapping error: ${mappingError.message}`,
          ),
        );
    }

    // 3. Format the citation
    console.log(`🎨 Formatting citation with style: ${style}`);

    // Detect language from source
    let lang = "en-US";
    if (
      source.language === "persian" ||
      source.language === "fa" ||
      source.language === "fa-IR"
    ) {
      lang = "fa-IR";
    }

    let inText, bibliography;

    try {
      // Handle Vancouver numbering options
      const options = {
        resetNumbering: resetVancouverOrder,
        citationOrder: citationOrder,
        sourceLanguage: source.language, // Pass source language for localization
      };

      const result = formatCitations(
        [cslItem], // All items context
        style, // e.g., 'apa'
        [sourceId.toString()], // Specific item(s) to cite
        lang,
        options, // Pass formatting options
      );

      inText = result.inText;
      bibliography = result.bibliography;

      console.log("✅ Citation formatting successful");
      console.log("In-text:", inText);
      console.log("Bibliography:", bibliography);
    } catch (formatError) {
      console.error("❌ Citation formatting failed:", formatError);
      // Provide fallback formatting
      inText = `(${source.authors?.[0]?.lastname || "Unknown"}, ${source.year || "n.d."})`;
      bibliography = `${source.authors?.map((a) => `${a.lastname}, ${a.firstname?.[0]}.`).join(", ") || "Unknown author"}. (${source.year || "n.d."}). ${source.title || "Untitled"}.`;
      console.log("📋 Using fallback formatting");
    }

    const responseData = {
      sourceId: sourceId,
      style: style,
      inText: inText, // e.g., "(Doe, 2025)"
      bibliography: bibliography, // e.g., "Doe, J. (2025). My Book..."
    };

    console.log("✅ Sending response:", responseData);

    return res
      .status(200)
      .json(
        new ApiResponse(200, responseData, "Citation formatted successfully"),
      );
  } catch (error) {
    console.error("❌ Unexpected error in formatCitationForWord:", error);
    console.error("Stack trace:", error.stack);
    return res
      .status(500)
      .json(new ApiResponse(500, null, `Server error: ${error.message}`));
  }
});

/**
 * @desc    Test format citation without authentication (for debugging)
 * @route   POST /api/v1/export/format-citation-test
 * @access  Public (temporary)
 */
const formatCitationForWordTest = asyncHandler(async (req, res) => {
  try {
    console.log("=== FORMAT CITATION TEST REQUEST ===");
    console.log("Request body:", req.body);

    const { sourceId, style = "apa" } = req.body;

    // Input validation
    if (!sourceId) {
      console.log("❌ Missing sourceId in request");
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Source ID is required"));
    }

    console.log(`🔍 Looking for source: ${sourceId}`);

    // 1. Find the source document from the database (without user filter for testing)
    const source = await Source.findById(sourceId);
    if (!source) {
      console.log("❌ Source not found");
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Source not found"));
    }

    console.log("✅ Source found:", source.title);

    // 2. Map the MongoDB document to CSL-JSON format
    console.log("📝 Mapping source to CSL format...");
    let cslItem;
    const lang = source.language === "persian" ? "fa-IR" : "en-US";
    try {
      cslItem = mapSourceToCSL(source);
      cslItem.id = source._id.toString(); // Ensure CSL item has an 'id'
      console.log("✅ CSL mapping successful");
      console.log("CSL item:", JSON.stringify(cslItem, null, 2));
    } catch (mappingError) {
      console.error("❌ CSL mapping failed:", mappingError);
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            null,
            `CSL mapping error: ${mappingError.message}`,
          ),
        );
    }

    // 3. Format the citation
    console.log(`🎨 Formatting citation with style: ${style}`);
    let inText, bibliography;
    try {
      const result = formatCitations(
        [cslItem], // All items context
        style, // e.g., 'apa'
        [sourceId.toString()], // Specific item(s) to cite
        lang, // Locale
      );
      inText = result.inText;
      bibliography = result.bibliography;
      console.log("✅ Citation formatting successful");
      console.log("In-text:", inText);
      console.log("Bibliography:", bibliography);
    } catch (formatError) {
      console.error("❌ Citation formatting failed:", formatError);
      // Provide fallback formatting
      inText = `(${source.authors?.[0]?.lastname || "Unknown"}, ${source.year || "n.d."})`;
      bibliography = `${source.authors?.map((a) => `${a.lastname}, ${a.firstname?.[0]}.`).join(", ") || "Unknown author"}. (${source.year || "n.d."}). ${source.title || "Untitled"}.`;
      console.log("📋 Using fallback formatting");
    }

    const responseData = {
      sourceId: sourceId,
      style: style,
      inText: inText, // e.g., "(Doe, 2025)"
      bibliography: bibliography, // e.g., "Doe, J. (2025). My Book..."
      debug: {
        sourceTitle: source.title,
        sourceType: source.type,
        authorCount: source.authors?.length || 0,
      },
    };

    console.log("✅ Sending response:", responseData);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseData,
          "Citation formatted successfully (test)",
        ),
      );
  } catch (error) {
    console.error("❌ Unexpected error in formatCitationForWordTest:", error);
    console.error("Stack trace:", error.stack);
    return res
      .status(500)
      .json(new ApiResponse(500, null, `Server error: ${error.message}`));
  }
});
/**
 * @desc    Format a full bibliography for Word Add-in
 * @route   POST /api/v1/export/format-bibliography
 * @access  Private
 * [NO CHANGE NEEDED] This controller already accepts 'lang' from the client.
 */
const formatBibliographyForWord = asyncHandler(async (req, res) => {
  try {
    console.log("=== FORMAT BIBLIOGRAPHY REQUEST ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?._id);
    console.log("Auth header present:", !!req.headers.authorization);

    // Validate user authentication
    if (!req.user || !req.user._id) {
      console.log("❌ No authenticated user found");
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Authentication required"));
    }

    // Client will send 'lang', defaulting to 'fa-IR' if not provided
    const {
      sourceIds,
      style = "apa",
      lang = "fa-IR",
      citationOrder = [],
    } = req.body;
    const userId = req.user._id;

    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      console.log("❌ Missing or invalid sourceIds in request");
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Source IDs array is required"));
    }

    console.log(
      `🔍 Looking for ${sourceIds.length} sources for user: ${userId}`,
    );

    // Find sources from the database
    const sources = await Source.find({
      _id: { $in: sourceIds },
      user: userId,
    });

    if (sources.length === 0) {
      console.log("❌ No matching sources found");
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No matching sources found"));
    }

    console.log(`✅ Found ${sources.length} sources`);

    // Map sources to CSL format with language detection
    const cslItems = sources.map((source) => {
      try {
        const cslItem = mapSourceToCSL(source);
        cslItem.id = source._id.toString();

        // Add language information for localization
        if (
          source.language === "persian" ||
          source.language === "fa" ||
          source.language === "fa-IR"
        ) {
          cslItem.language = "fa-IR";
        } else {
          cslItem.language = "en-US";
        }

        return cslItem;
      } catch (mappingError) {
        console.error(
          `❌ CSL mapping failed for source ${source._id}:`,
          mappingError,
        );
        throw mappingError;
      }
    });

    console.log("✅ CSL mapping successful for all sources");

    // Determine final language for bibliography
    let finalLang = lang;

    // If lang is auto, detect from sources
    if (lang === "auto") {
      const persianSources = sources.filter(
        (s) =>
          s.language === "persian" ||
          s.language === "fa" ||
          s.language === "fa-IR",
      );
      finalLang =
        persianSources.length > sources.length / 2 ? "fa-IR" : "en-US";
    }

    console.log(
      `📝 Formatting bibliography with style: ${style}, language: ${finalLang}`,
    );

    // 3. Format the bibliography using the detected/specified language
    const options = {
      citationOrder: citationOrder,
      sources: sources, // Pass original sources for additional context
    };

    const bibliographyHtml = formatBibliography(
      cslItems,
      style,
      finalLang,
      options,
    );

    console.log("✅ Bibliography formatting successful");
    console.log(
      `📄 Bibliography HTML length: ${bibliographyHtml.length} characters`,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { html: bibliographyHtml },
          "Bibliography formatted successfully",
        ),
      );
  } catch (error) {
    console.error("❌ Unexpected error in formatBibliographyForWord:", error);
    console.error("Stack trace:", error.stack);
    return res
      .status(500)
      .json(new ApiResponse(500, null, `Server error: ${error.message}`));
  }
});

/**
 * @desc    Manage Vancouver citation numbering
 * @route   POST /api/v1/export/manage-vancouver-numbering
 * @access  Private
 */
const manageVancouverNumbering = asyncHandler(async (req, res) => {
  try {
    const { action, orderMap } = req.body;

    switch (action) {
      case "reset":
        resetVancouverNumbering();
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              null,
              "Vancouver numbering reset successfully",
            ),
          );

      case "get":
        const currentOrder = getVancouverOrder();
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { order: Object.fromEntries(currentOrder) },
              "Current Vancouver order retrieved",
            ),
          );

      case "set":
        if (!orderMap) {
          return res
            .status(400)
            .json(
              new ApiResponse(
                400,
                null,
                "Order map is required for 'set' action",
              ),
            );
        }
        setVancouverOrder(new Map(Object.entries(orderMap)));
        return res
          .status(200)
          .json(
            new ApiResponse(200, null, "Vancouver order updated successfully"),
          );

      default:
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              "Invalid action. Use 'reset', 'get', or 'set'",
            ),
          );
    }
  } catch (error) {
    console.error("❌ Error managing Vancouver numbering:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, `Server error: ${error.message}`));
  }
});

export {
  exportToDocx,
  formatCitationForWord,
  formatCitationForWordTest,
  formatBibliographyForWord,
  manageVancouverNumbering,
};