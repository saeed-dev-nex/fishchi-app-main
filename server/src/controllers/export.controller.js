import asyncHandler from 'express-async-handler';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-csl';
import Source from '../models/Source.model.js';
import ApiResponse from '../utils/apiResponse.js';
import { mapSourceToCSL } from '../utils/cslMapper.js';

/**
 * @desc Export sources to DOCX
 * @route POST /api/v1/export/docx
 * @access Private
 */
const exportToDocx = asyncHandler(async (req, res) => {
  console.log(' ------------- start export to docx handler ------------');

  console.log(req.body);
  // get sources Ids and citation style from body
  const { sourceIds: sourceIds, style = 'apa' } = req.body;

  if (!sourceIds || !style) {
    res.status(400);
    throw new Error('sourceIds و style الزامی هستند');
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
    const citationText = cite.format('bibliography', {
      format: 'text',
      template: style,
      lang: 'en-US',
    });
    // Create a paragraph for each citation
    return new Paragraph({
      text: citationText,
      style: 'ListParagraph',
    });
  });
  //   4. Create a document and add citation paragraphs
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'فهرست منابع',
            heading: HeadingLevel.HEADING_1,
            alignment: 'right',
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
    'Content-Disposition',
    'attachment; filename="bibliography.docx"'
  );
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
  // 7. send file
  res.send(buffer);
});
export { exportToDocx };
