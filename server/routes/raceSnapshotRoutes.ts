// server/routes/raceSnapshotRoutes.ts
import express from 'express';
import raceSnapshotService from '../services/raceSnapshotService';

const router = express.Router();

// GET /api/race-snapshots/list?type=monthly
router.get('/list', async (req, res, next) => {
  const raceType = req.query.type as string;

  if (!raceType) {
    return res.status(400).json({ message: 'Query parameter "type" is required (e.g., "monthly").' });
  }

  try {
    const snapshotList = await raceSnapshotService.getSnapshotListByType(raceType);
    res.json(snapshotList);
  } catch (error) {
    console.error(`API Error: Failed to get snapshot list for type ${raceType}`, error);
    next(error);
  }
});

// GET /api/race-snapshots/:id
router.get('/:id', async (req, res, next) => {
  const snapshotId = parseInt(req.params.id, 10);

  if (isNaN(snapshotId)) {
    return res.status(400).json({ message: 'Snapshot ID must be a number.' });
  }

  try {
    const snapshotData = await raceSnapshotService.getSnapshotById(snapshotId);
    if (snapshotData) {
      res.json(snapshotData);
    } else {
      res.status(404).json({ message: 'Snapshot not found.' });
    }
  } catch (error) {
    console.error(`API Error: Failed to get snapshot by ID ${snapshotId}`, error);
    next(error);
  }
});

export default router; 