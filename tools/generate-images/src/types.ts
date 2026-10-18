export interface ManifestEntry {
  category: string;
  name: string;
  prompt: string;
  seed?: number;
}

export interface TrailerSharedPlan {
  id: string;
  shared: true;
}

export interface TrailerClipPlan {
  id: string;
  kind: "clip";
  prompt: string;
  seed?: number;
}

export interface TrailerOtherPlan {
  id: string;
  kind: "screen" | "image" | "black";
}

export type TrailerPlan = TrailerSharedPlan | TrailerClipPlan | TrailerOtherPlan;

export interface TrailerManifest {
  trailer: string;
  plans: TrailerPlan[];
}

export interface ApiWorkflowNode {
  class_type: string;
  inputs: Record<string, unknown>;
}

export type ApiWorkflow = Record<string, ApiWorkflowNode>;
