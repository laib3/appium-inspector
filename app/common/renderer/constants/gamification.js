// Columns in the Gamification information table
export const GAMIFICATION_INFO_PROPS = {
  // interacted_widgets: 'Number of Interacted Widgets',
  session_length: 'Session Length',
  active_appId: 'Currently Active App ID',
  // last_interacted_widget: 'Last interacted widget'
};

export const GAMIFICATION_INFO_TABLE_PARAMS = {
  OUTER_KEY: 'gamificationInfo',
  SESSION_KEY: 'gamificationDetails',
  SCROLL_DISTANCE_Y: 104,
  COLUMN_WIDTH: 200,
};

export const PAGE_THRESHOLD = 15;
export const COVERAGE_THRESHOLD = 50;

export const GAMIFICATION_BADGES = [
  { id: "first-interaction", title: "First Interaction", description: "You performed your first interaction!"},
  { id: "page-explorer", title: "Page Explorer", description: `You explored more than ${PAGE_THRESHOLD} pages!` },
  { id: "record-breaker", title: "Record Breaker", description: "You performed a new record!"},
  { id: "your-name", title: "Your Name", description: "You changed your username once!"},
  { id: "high-coverage", title: "High Coverage", description: `You gained more than ${COVERAGE_THRESHOLD}% coverage on a single page!`},
];
