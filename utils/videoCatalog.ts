/**
 * Stub for TypeScript/IDE module resolution. No local mp4.
 * Web build uses videoCatalog.web.ts; native uses videoCatalog.native.ts.
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

export type VideoSource = number | { uri: string };

export function getVideoSource(_videoId: VideoId): VideoSource {
  throw new Error('Use platform-specific videoCatalog (.web or .native)');
}
