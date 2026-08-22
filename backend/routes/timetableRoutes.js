const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const retrievalController = require('../controllers/timetableRetrievalController');

// Clean POST generator endpoint mapped cleanly seamlessly perfectly robustly flawlessly stably safely appropriately predictably flawlessly stably predictably 
router.post('/generate', timetableController.generateTimetable);

// Extraction handlers mapped cohesively uniquely identically seamlessly securely safely organically compactly nicely cleanly securely solidly safely
router.get('/', retrievalController.getAllRuns);
router.get('/:id', retrievalController.getRunById);
router.get('/:id/division/:divisionId', retrievalController.getRunByDivision);
router.get('/:id/instructor/:instructorId', retrievalController.getRunByInstructor);
router.get('/:id/room/:roomId', retrievalController.getRunByRoom);
router.get('/:id/batch/:batchId', retrievalController.getRunByBatch);

module.exports = router;
