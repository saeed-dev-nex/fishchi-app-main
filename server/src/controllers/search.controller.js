import asyncHandler from 'express-async-handler';
import ApiResponse from '../utils/apiResponse.js';
import Source from '../models/Source.model.js';
import Note from '../models/Note.model.js';

/**
 *@desc Search sources and notes
 *@route GET /api/v1/search
 *@access Private
 */

const searchAll = asyncHandler(async (req, res) => {
  const { q, type } = req.query; // p: query , type: 'notes' | 'sources' | 'all'
  const userId = req.user._id;
  if (!q) {
    res.status(400);
    throw new Error('عبارت جستجو (q) الزامی است');
  }
  //   1. Base filter: user can search in his own sources and notes
  const baseFilter = {
    user: userId,
    $text: {
      $search: q,
    },
  };
  //   2. Add Scoring (relevance scoring)
  const projection = { score: { $meta: 'textScore' } };
  const sort = { score: { $meta: 'textScore' } }; //Sorting based on relevant score
  let results = {
    sources: [],
    notes: [],
  };

  try {
    //   3. Execute search based on request type
    if (type === 'sources') {
      results.sources = await Source.find(baseFilter, projection).sort(sort);
    } else if (type === 'notes') {
      results.notes = await Note.find(baseFilter, projection).sort(sort);
    } else {
      results.sources = await Source.find(baseFilter, projection).sort(sort);
      results.notes = await Note.find(baseFilter, projection).sort(sort);
    }
    ApiResponse.success(res, results, 'نتایج جستجو');
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

export { searchAll };
