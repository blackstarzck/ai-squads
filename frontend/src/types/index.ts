import { Edge, Node } from '@xyflow/react';

export type AgentStatus = 'planning' | 'designing' | 'coding' | 'qa' | 'idle';

export interface ProjectState {
  projectName: string;
  version: string;
  riskScore: number;
  agentStatus: AgentStatus;
  setProjectName: (name: string) => void;
  setVersion: (version: string) => void;
  setRiskScore: (score: number) => void;
  setAgentStatus: (status: AgentStatus) => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (message: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
}

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  highlightedNodeId: string | null; // 드래그 중 하이라이트 대상
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  removeNode: (id: string) => void;
  setSelectedNode: (node: Node | null) => void;
  setHighlightedNode: (id: string | null) => void;
  setNodeParent: (childId: string, parentId: string | null, relativePosition: { x: number; y: number }) => void;
  resizeNode: (id: string, width: number, height: number) => void;
}
