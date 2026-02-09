/**
 * Video catalog for NATIVE (iOS/Android) only. Uses local mp4 requires.
 * Resolved when bundling for app. Web uses videoCatalog.web.ts (no mp4 refs).
 */

export type VideoId =
  | 'M1INTRO'
  | 'M1Factoring'
  | 'M1BExtractingSquareRoots'
  | 'M1CompletingTheSquare'
  | 'M1QuadraticFormula'
  | 'M2TriangleTriples'
  | 'M3ATriangleSimilarities'
  | 'M3BObliqueTriangles'
  | 'M4AreaOfTriangle'
  | 'M5Variation';

export type VideoSource = number;

interface NativeEntry {
  id: VideoId;
  localRequire: number;
}

const VIDEO_CATALOG_NATIVE: Record<VideoId, NativeEntry> = {
  M1INTRO: {
    id: 'M1INTRO',
    localRequire: require('../assets/images/videos/M1INTRO.mp4'),
  },
  M1CompletingTheSquare: {
    id: 'M1CompletingTheSquare',
    localRequire: require('../assets/images/videos/M1Completing The Square.mp4'),
  },
  M1Factoring: {
    id: 'M1Factoring',
    localRequire: require('../assets/images/videos/M1Factoring.mp4'),
  },
  M1QuadraticFormula: {
    id: 'M1QuadraticFormula',
    localRequire: require('../assets/images/videos/M1Quadratic Formula.mp4'),
  },
  M2TriangleTriples: {
    id: 'M2TriangleTriples',
    localRequire: require('../assets/images/videos/M2TriangleTriples.mp4'),
  },
  M1BExtractingSquareRoots: {
    id: 'M1BExtractingSquareRoots',
    localRequire: require('../assets/images/videos/M1BExtracting Square Roots.mp4'),
  },
  M3ATriangleSimilarities: {
    id: 'M3ATriangleSimilarities',
    localRequire: require('../assets/images/videos/M3ATriangle Similarities.mp4'),
  },
  M3BObliqueTriangles: {
    id: 'M3BObliqueTriangles',
    localRequire: require('../assets/images/videos/M3BOblique Triangles.mp4'),
  },
  M4AreaOfTriangle: {
    id: 'M4AreaOfTriangle',
    localRequire: require('../assets/images/videos/M4arjay.mp4'),
  },
  M5Variation: {
    id: 'M5Variation',
    localRequire: require('../assets/images/videos/M5arjay.mp4'),
  },
};

const VALID_VIDEO_IDS = Object.keys(VIDEO_CATALOG_NATIVE) as VideoId[];

export function getVideoSource(videoId: VideoId): VideoSource {
  const entry = VIDEO_CATALOG_NATIVE[videoId];
  if (!entry) {
    throw new Error(
      `Unknown videoId "${videoId}". Valid videoIds: ${VALID_VIDEO_IDS.join(', ')}.`
    );
  }
  return entry.localRequire;
}
