

export interface AnalysisDigitalRight {
  id: string;
  name: string;
  description: string;
  digital_right: string;
  results: string | ClusterResult;
}

export interface ClusterResult {
  clusters: string; 
  k: string;
}

export function createAnalysisDigitalRight(params: Partial<AnalysisDigitalRight>) {
  return {

  } as AnalysisDigitalRight;
}
