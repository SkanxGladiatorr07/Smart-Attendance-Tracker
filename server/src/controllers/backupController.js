import { BackupService } from '../services/backupService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Controller handlers for Backup & Restore endpoints
 */

/**
 * @desc    Export full database backup as JSON download
 * @route   GET /api/backup/export
 * @access  Public
 */
export const exportBackup = asyncHandler(async (req, res) => {
  const backupData = await BackupService.exportBackup();
  const dateStr = new Date().toISOString().split('T')[0];

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="attendai_backup_${dateStr}.json"`);
  res.status(200).json(backupData);
});

/**
 * @desc    Import database backup from JSON body or uploaded file payload
 * @route   POST /api/backup/import
 * @access  Public
 */
export const importBackup = asyncHandler(async (req, res) => {
  const overwrite = req.query.overwrite === 'true' || req.body?.overwrite === true;
  const payload = req.body?.data || req.body;

  const result = await BackupService.importBackup(payload, { overwrite });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
