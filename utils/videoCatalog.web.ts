/**
 * Video catalog for WEB only. No local mp4 files; uses Cloudinary URLs.
 * Resolved when bundling for web (e.g. Vercel). Native uses videoCatalog.native.ts.
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

export type VideoSource = { uri: string };

interface WebEntry {
  id: VideoId;
  webUrl: string;
}

const VIDEO_CATALOG_WEB: Record<VideoId, WebEntry> = {
  M1INTRO: {
    id: 'M1INTRO',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644152/M1INTRO_dunemg.mp4',
  },
  M1CompletingTheSquare: {
    id: 'M1CompletingTheSquare',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644130/M1Completing_The_Square_lshizi.mp4',
  },
  M1Factoring: {
    id: 'M1Factoring',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644130/M1Factoring_pcrvdp.mp4',
  },
  M1QuadraticFormula: {
    id: 'M1QuadraticFormula',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644117/M1Quadratic_Formula_vo5sl1.mp4',
  },
  M2TriangleTriples: {
    id: 'M2TriangleTriples',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644114/M2TriangleTriples_sm73ss.mp4',
  },
  M1BExtractingSquareRoots: {
    id: 'M1BExtractingSquareRoots',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644076/M1BExtracting_Square_Roots_ttcvmt.mp4',
  },
  M3ATriangleSimilarities: {
    id: 'M3ATriangleSimilarities',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644054/M3_A._Triangle_Similarities_dlukvb.mp4',
  },
  M3BObliqueTriangles: {
    id: 'M3BObliqueTriangles',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644042/M3_B._Oblique_Triangles_vuhjds.mp4',
  },
  M4AreaOfTriangle: {
    id: 'M4AreaOfTriangle',
    webUrl: 'https://res.cloudinary.com/dfiiso9ad/video/upload/v1770644040/M4_Area_Of_Triangle_wmldfa.mp4',
  },
  M5Variation: {
    id: 'M5Variation',
    webUrl: '',
  },
};

const VALID_VIDEO_IDS = Object.keys(VIDEO_CATALOG_WEB) as VideoId[];

export function getVideoSource(videoId: VideoId): VideoSource {
  const entry = VIDEO_CATALOG_WEB[videoId];
  if (!entry) {
    throw new Error(
      `Unknown videoId "${videoId}". Valid videoIds: ${VALID_VIDEO_IDS.join(', ')}.`
    );
  }
  if (!entry.webUrl) {
    const withWeb = VALID_VIDEO_IDS.filter((id) => VIDEO_CATALOG_WEB[id].webUrl);
    throw new Error(
      `Video "${videoId}" has no web URL. Valid web videoIds: ${withWeb.join(', ')}.`
    );
  }
  return { uri: entry.webUrl };
}
