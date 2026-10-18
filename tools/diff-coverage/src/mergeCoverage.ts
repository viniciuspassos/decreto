import istanbulLibCoverage, {
  type CoverageMap,
  type CoverageMapData,
} from "istanbul-lib-coverage";

const { createCoverageMap } = istanbulLibCoverage;

/** Merges several `coverage-final.json` contents into a single coverage map. */
export function mergeCoverage(dataObjects: CoverageMapData[]): CoverageMap {
  const map = createCoverageMap({});
  for (const data of dataObjects) {
    map.merge(data);
  }
  return map;
}
