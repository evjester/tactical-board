export {
  detectPosition,
  getPositionName,
  getAllPositions,
  autoDetectTeamPositions,
} from './positionDetector'

export {
  detectFormation,
  findMatchingFormation,
  calculateFormationFit,
  getFormationRecommendations,
} from './formationDetector'

export {
  easings,
  lerp,
  interpolatePosition,
  interpolatePlayerPositions,
  interpolateBallPosition,
  calculateAnimationProgress,
  getTotalDuration,
  getFrameAtTime,
  createGhostPlayers,
} from './interpolation'

export {
  getSavedTactics,
  saveTactic,
  deleteTactic,
  loadTactic,
  createSavedTactic,
  exportToJson,
  importFromJson,
  downloadFile,
  downloadTacticAsJson,
  readFileAsText,
  generateId,
} from './storage'

export type { SavedTactic, TacticData } from './storage'

export {
  stageToDataUrl,
  stageToBlob,
  downloadStageAsPng,
  downloadStageAsJpeg,
  copyStageToClipboard,
} from './export'

export {
  encodeStateForUrl,
  decodeStateFromUrl,
  generateShareUrl,
  getSharedTacticFromUrl,
  copyToClipboard,
  generateShortCode,
} from './share'

export type { ShareableTactic } from './share'

export {
  getAnnotation,
  saveAnnotation,
  createAnnotation,
  addComment,
  updateComment,
  deleteComment,
  updateNotes,
  toggleCommentResolved,
  deleteAnnotation,
} from './comments'

export type { Comment, Annotation } from './comments'

export {
  getVersionHistory,
  createVersion,
  getVersion,
  deleteVersion,
  compareVersions,
  clearVersionHistory,
  getRecentVersions,
  formatVersionDate,
} from './versionHistory'

export type { TacticVersion, TacticVersionHistory } from './versionHistory'

export {
  exportAnimationAsGif,
  exportAnimationAsGifSimple,
  downloadGif,
} from './gifExport'

export type { GifExportOptions, GifExportProgress } from './gifExport'

export {
  getCustomFormations,
  saveCustomFormation,
  updateCustomFormation,
  deleteCustomFormation,
  customFormationToPositions,
  exportFormation,
  importFormation,
  suggestFormationName,
} from './customTemplates'

export type { CustomFormation } from './customTemplates'

export {
  SPEED_CURVES,
  setPlayerSpeedCurve,
  getPlayerSpeedCurve,
  getPlayerEasing,
  clearPlayerSpeedCurves,
  exportSpeedCurves,
  importSpeedCurves,
  getAvailableSpeedCurves,
} from './speedCurves'

export type { SpeedCurveType, PlayerSpeedCurve } from './speedCurves'

export {
  TOOL_ARIA_LABELS,
  announce,
  getPlayerDescription,
  getAnimationStateDescription,
  createFocusTrap,
  handleKeyboardNavigation,
  getSkipLinks,
  checkColorContrast,
  getHighContrastColor,
} from './accessibility'

export type { KeyboardNavigationOptions } from './accessibility'
