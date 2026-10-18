export interface ManifestEntry {
  category: string;
  name: string;
  prompt: string;
  seed?: number;
}

export interface ApiWorkflowNode {
  class_type: string;
  inputs: Record<string, unknown>;
}

export type ApiWorkflow = Record<string, ApiWorkflowNode>;
