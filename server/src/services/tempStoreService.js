// In-memory temporary cache map
const tempStore = new Map();

// Default 1 hour expiration in milliseconds
const DEFAULT_TTL_MS = 60 * 60 * 1000;

/**
 * Generate a unique analysis ID
 */
export const generateAnalysisId = () => {
  return `analysis_cal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Saves analyzed calendar data to temporary store
 * @param {string} analysisId 
 * @param {Object} calendarData 
 * @param {Object} fileMetadata 
 * @returns {Object} Staged entry
 */
export const saveTempCalendar = (analysisId, calendarData, fileMetadata = {}) => {
  const entry = {
    analysisId,
    status: 'staged', // 'staged' | 'confirmed'
    calendarData,
    fileMetadata,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + DEFAULT_TTL_MS
  };

  tempStore.set(analysisId, entry);
  return entry;
};

/**
 * Retrieves temporary calendar data by analysisId
 * @param {string} analysisId 
 * @returns {Object|null}
 */
export const getTempCalendar = (analysisId) => {
  const entry = tempStore.get(analysisId);
  if (!entry) return null;

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    tempStore.delete(analysisId);
    return null;
  }

  return entry;
};

/**
 * Removes temporary calendar entry
 * @param {string} analysisId 
 */
export const removeTempCalendar = (analysisId) => {
  return tempStore.delete(analysisId);
};

/**
 * Sweeps expired items periodically
 */
export const cleanExpiredTempStore = () => {
  const now = Date.now();
  for (const [id, entry] of tempStore.entries()) {
    if (now > entry.expiresAt) {
      tempStore.delete(id);
    }
  }
};

// Run garbage collection sweep every 15 minutes
setInterval(cleanExpiredTempStore, 15 * 60 * 1000);
