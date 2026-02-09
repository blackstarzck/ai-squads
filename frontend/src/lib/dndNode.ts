/**
 * 사이드 패널 → 캔버스 드래그 앤 드롭에 사용하는 공용 MIME 타입과 페이로드 인터페이스
 */

/** dataTransfer 에 사용하는 MIME 타입 */
export const DND_NODE_MIME = 'application/aisync-node';

/** 드래그 페이로드 */
export interface DndNodePayload {
  /** 노드 종류 (page, component, data, muiComponent) */
  nodeType: string;
  /** React Flow 노드 type (action, function, data, mui) */
  flowType: string;
  /** 기본 라벨 */
  label: string;
  /** MUI 전용 – 컴포넌트 키 */
  muiComponentType?: string;
  /** MUI 전용 – 카테고리 */
  muiCategory?: string;
  /** 컨테이너 여부 (width/height 설정용) */
  isContainer?: boolean;
  /** 기본 너비 */
  width?: number;
  /** 기본 높이 */
  height?: number;
}

/** 드래그 시작 시 호출하는 헬퍼 */
export function setDndPayload(
  e: React.DragEvent,
  payload: DndNodePayload,
) {
  e.dataTransfer.setData(DND_NODE_MIME, JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'move';
}

/** 드롭 시 페이로드 파싱 */
export function getDndPayload(
  e: React.DragEvent,
): DndNodePayload | null {
  const raw = e.dataTransfer.getData(DND_NODE_MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DndNodePayload;
  } catch {
    return null;
  }
}
