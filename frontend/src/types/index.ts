import { Edge, Node } from '@xyflow/react';

export type AgentStatus = 'planning' | 'designing' | 'coding' | 'qa' | 'idle';

export interface Project {
  id: string;
  name: string;
  updatedAt: string; // ISO date string
  createdAt: string;
}

/** 페이지별 콘텐츠 항목 */
export interface PageContentItem {
  id: string;
  label: string;
  description: string;
}

/** 페이지별 PRD / 화면구성 / 와이어프레임 데이터 */
export interface PageContent {
  prd: PageContentItem[];
  screenLayout: PageContentItem[];
  wireframe: PageContentItem[];
}

/** 현재 선택된 페이지 콘텐츠 항목 참조 */
export interface SelectedPageContentRef {
  pageId: string;
  section: keyof PageContent;
  itemId: string;
}

/** pageId → PageContent 매핑 */
export interface PageContentState {
  /** pageId별 콘텐츠 */
  contents: Record<string, PageContent>;
  /** 현재 편집 중인 콘텐츠 항목 */
  selectedItem: SelectedPageContentRef | null;
  /** 특정 페이지의 특정 섹션에 항목 추가 */
  addItem: (pageId: string, section: keyof PageContent, item: PageContentItem) => void;
  /** 특정 페이지의 특정 섹션에서 항목 제거 */
  removeItem: (pageId: string, section: keyof PageContent, itemId: string) => void;
  /** 특정 항목의 label/description 수정 */
  updateItem: (pageId: string, section: keyof PageContent, itemId: string, data: Partial<Pick<PageContentItem, 'label' | 'description'>>) => void;
  /** 페이지 삭제 시 콘텐츠도 정리 */
  removePage: (pageId: string) => void;
  /** 편집할 항목 선택/해제 */
  setSelectedItem: (ref: SelectedPageContentRef | null) => void;
}

export interface ProjectState {
  projectName: string;
  version: string;
  riskScore: number;
  agentStatus: AgentStatus;
  /** 현재 선택된 프로젝트 ID */
  currentProjectId: string | null;
  /** 현재 선택된 페이지 ID */
  currentPageId: string | null;
  /** 과거 생성된 프로젝트 목록 */
  projects: Project[];
  setProjectName: (name: string) => void;
  setVersion: (version: string) => void;
  setRiskScore: (score: number) => void;
  setAgentStatus: (status: AgentStatus) => void;
  setCurrentProject: (id: string) => void;
  setCurrentPage: (id: string | null) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
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
  /** 프로젝트별 캔버스 데이터 백업 */
  projectCanvasData: Record<string, { nodes: Node[]; edges: Edge[] }>;
  /** 클립보드에 복사된 노드/엣지 */
  clipboard: { nodes: Node[]; edges: Edge[] } | null;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  removeNode: (id: string) => void;
  removeNodes: (ids: string[]) => void;
  setSelectedNode: (node: Node | null) => void;
  setHighlightedNode: (id: string | null) => void;
  setNodeParent: (childId: string, parentId: string | null, relativePosition: { x: number; y: number }) => void;
  resizeNode: (id: string, width: number, height: number) => void;
  /** 선택된 노드를 클립보드에 복사 */
  copyNodes: () => void;
  /** 클립보드의 노드를 붙여넣기 */
  pasteNodes: () => void;
  /** 프로젝트 전환 시 호출 — 현재 데이터 저장 & 대상 프로젝트 데이터 로드 */
  switchProject: (fromId: string | null, toId: string | null) => void;
  /** 프로젝트 삭제 시 캔버스 데이터 정리 */
  removeProjectData: (projectId: string) => void;
}

/** MUI 컴포넌트 카테고리 */
export type MuiComponentCategory = 'layout' | 'inputs' | 'dataDisplay' | 'navigation' | 'feedback' | 'surfaces';

/** MUI 컴포넌트 레지스트리 항목 */
export interface MuiComponentDef {
  key: string;
  label: string;
  labelKo: string;
  category: MuiComponentCategory;
  icon: React.ElementType;
  isContainer: boolean;
  defaultProps?: Record<string, unknown>;
  renderPreview: () => React.ReactElement;
}

/** MUI 카테고리 메타데이터 */
export interface MuiCategoryMeta {
  id: MuiComponentCategory;
  label: string;
  labelKo: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}
