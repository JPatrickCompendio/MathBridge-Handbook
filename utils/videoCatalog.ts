/**
 * Shared video catalog: one source of truth for video IDs, web URLs (Cloudinary), and local requires.
 * - App/native: uses localRequire (unchanged behavior).
 * - Web: uses webUrl from Cloudinary via getVideoSource(videoId).
 * Do not reorder or move videos between lessons; catalog matches current app usage.
 */

import { Platform } from 'react-native';

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

export type VideoSource = number | { uri: string };

export interface VideoCatalogEntry {
  id: VideoId;
  webUrl: string;
  localRequire: number;
}

const VIDEO_CATALOG: Record<VideoId, VideoCatalogEntry> = {
  M1INTRO: {
    id: 'M1INTRO',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644152/M1INTRO_dunemg.mp4',
    localRequire: require('../assets/images/videos/M1INTRO.mp4'),
  },
  M1CompletingTheSquare: {
    id: 'M1CompletingTheSquare',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644130/M1Completing_The_Square_lshizi.mp4',
    localRequire: require('../assets/images/videos/M1Completing The Square.mp4'),
  },
  M1Factoring: {
    id: 'M1Factoring',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644130/M1Factoring_pcrvdp.mp4',
    localRequire: require('../assets/images/videos/M1Factoring.mp4'),
  },
  M1QuadraticFormula: {
    id: 'M1QuadraticFormula',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644117/M1Quadratic_Formula_vo5sl1.mp4',
    localRequire: require('../assets/images/videos/M1Quadratic Formula.mp4'),
  },
  M2TriangleTriples: {
    id: 'M2TriangleTriples',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644114/M2TriangleTriples_sm73ss.mp4',
    localRequire: require('../assets/images/videos/M2TriangleTriples.mp4'),
  },
  M1BExtractingSquareRoots: {
    id: 'M1BExtractingSquareRoots',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644076/M1BExtracting_Square_Roots_ttcvmt.mp4',
    localRequire: require('../assets/images/videos/M1BExtracting Square Roots.mp4'),
  },
  M3ATriangleSimilarities: {
    id: 'M3ATriangleSimilarities',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644054/M3_A._Triangle_Similarities_dlukvb.mp4',
    localRequire: require('../assets/images/videos/M3ATriangle Similarities.mp4'),
  },
  M3BObliqueTriangles: {
    id: 'M3BObliqueTriangles',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644042/M3_B._Oblique_Triangles_vuhjds.mp4',
    localRequire: require('../assets/images/videos/M3BOblique Triangles.mp4'),
  },
  M4AreaOfTriangle: {
    id: 'M4AreaOfTriangle',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644040/M4_Area_Of_Triangle_wmldfa.mp4',
    localRequire: require('../assets/images/videos/M4arjay.mp4'),
  },
  M5Variation: {
    id: 'M5Variation',
    webUrl: '', // No Cloudinary URL provided; native only
    localRequire: require('../assets/images/videos/M5arjay.mp4'),
  },
};

const VALID_VIDEO_IDS = Object.keys(VIDEO_CATALOG) as VideoId[];

/**
 * Returns the video source for the given videoId.
 * - Web: returns { uri: webUrl } (Cloudinary).
 * - App/native: returns the existing local require (unchanged).
 * @throws If videoId is not in the catalog, or on web when the entry has no webUrl.
 */
export function getVideoSource(videoId: VideoId): VideoSource {
  const entry = VIDEO_CATALOG[videoId];
  if (!entry) {
    throw new Error(
      `Unknown videoId "${videoId}". Valid videoIds: ${VALID_VIDEO_IDS.join(', ')}.`
    );
  }
  if (Platform.OS === 'web') {
    if (!entry.webUrl) {
      const withWeb = VALID_VIDEO_IDS.filter((id) => VIDEO_CATALOG[id].webUrl);
      throw new Error(
        `Video "${videoId}" has no web URL. Valid web videoIds: ${withWeb.join(', ')}.`
      );
    }
    return { uri: entry.webUrl };
  }
  return entry.localRequire;
}
