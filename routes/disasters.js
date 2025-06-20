import express from 'express';
export const router = express.Router();
// import supabase from '../config/supabase.js';
// import getLocationfromDescription from '../utils/location_extract.js';
// import verifyImageWithGemini from '../utils/verify_image_gemini.js';
// import { io } from '../app.js';
import { mockAuth } from '../middleware/mockAuth.js';
import { getDisasters, createDisaster, getDisasterById, deleteDisaster, updateDisaster } from '../controllers/disasters.js';
import { createReport } from '../controllers/reports.js';
import { createResource, getResourcesByDisasterId } from '../controllers/resources.js';
import getMockSocialMediaPosts from '../controllers/socialMedia.js';
import getOfficialUpdates from '../controllers/officalUpdates.js';
import { verifyImageStatus } from '../controllers/verifyImages.js';

// Middleware for mock authentication
router.use(mockAuth);

// GET /disasters - List disasters with filtering
router.get('/', getDisasters);

// POST /disasters - Create a new disaster
router.post('/', createDisaster);

// GET /disasters/:id - Get disaster details
router.get('/:id', getDisasterById);

// PUT /disasters/:id - Update a disaster
router.put('/:id', updateDisaster);

// DELETE /disasters/:id - Delete a disaster
router.delete('/:id', deleteDisaster);

// POST /disasters/:id/report - Create a report for a disaster
router.post('/:id/report', createReport);

// POST /disasters/:id/resource - Create a resource for a disaster
router.post('/:id/resource', createResource);

router.get("/:id/resources", getResourcesByDisasterId);

router.get('/:id/social-media', getMockSocialMediaPosts);

router.get('/:id/official-updates', getOfficialUpdates);

router.post('/:id/verify-image', verifyImageStatus);

// module.exports = router;

// Export the router
export default router;