import { calculateRequiredLectures, calculateSafeSkips } from '../utils/calcUtils.js';

/**
 * Prediction Service - Specialized intelligence engine for required lecture forecasting,
 * safe skip estimation, and trend trajectory projections.
 */
export const PredictionService = {
  /**
   * Calculate detailed attendance target trajectory
   * @param {number} present Count of present lectures
   * @param {number} marked Count of total marked lectures (present + absent)
   * @param {number} targetPct Target attendance percentage (e.g. 75)
   * @param {number} remainingLectures Count of remaining scheduled lectures
   * @returns {Object} Comprehensive trajectory analysis
   */
  analyzeTrajectory(present = 0, marked = 0, targetPct = 75, remainingLectures = 0) {
    const required = calculateRequiredLectures(present, marked, targetPct);
    const skips = calculateSafeSkips(present, marked, targetPct, remainingLectures);

    // Calculate maximum possible attendance percentage if user attends 100% of remaining lectures
    const maxAttainablePresent = present + remainingLectures;
    const maxAttainableMarked = marked + remainingLectures;
    const maxAttainablePercentage = maxAttainableMarked > 0
      ? Math.round((maxAttainablePresent / maxAttainableMarked) * 100 * 100) / 100
      : 0;

    // Check if reaching target is mathematically possible
    const isTargetFeasible = maxAttainablePercentage >= targetPct;

    return {
      currentPercentage: required.currentPercentage,
      targetPercentage: targetPct,
      requiredLectures: required.requiredLectures,
      safeSkips: skips.safeSkips,
      effectiveSafeSkips: skips.effectiveSafeSkips,
      remainingLectures,
      maxAttainablePercentage,
      isTargetFeasible,
      status: !isTargetFeasible
        ? 'mathematically_unreachable'
        : required.isTargetAchieved
          ? 'target_achieved'
          : 'recovery_required',
      message: !isTargetFeasible
        ? `Target ${targetPct}% cannot be reached this semester even with 100% attendance in remaining lectures.`
        : required.message,
    };
  }
};
