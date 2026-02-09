import type { Node, Edge } from '@xyflow/react';

/**
 * 노드에 의미 있는 데이터가 없는 "빈 노드"인지 판별합니다.
 *
 * 빈 노드 기준:
 * - 엣지(연결선)가 하나라도 연결되어 있으면 빈 노드가 아닙니다.
 * - description 이 존재하면 빈 노드가 아닙니다.
 * - selectedTable 이 존재하면 빈 노드가 아닙니다. (모든 노드에 데이터 연결 가능)
 * - 노드 타입별 추가 기준:
 *   - page: label 이 기본값('새 화면')이면 빈 노드
 *   - component: label 이 기본값('새 구성요소')이고 code 가 없으면 빈 노드
 *   - function: code 가 없으면 빈 노드
 *   - data: selectedTable 이 없으면 빈 노드 (위에서 이미 체크)
 *   - muiComponent: description 없으면 빈 노드 (위에서 이미 체크)
 */
export function isEmptyNode(node: Node, edges: Edge[]): boolean {
  const d = node.data as Record<string, unknown> | undefined;
  if (!d) return true;

  // 엣지가 연결되어 있으면 데이터 있는 노드로 간주
  const hasEdges = edges.some(
    (e) => e.source === node.id || e.target === node.id,
  );
  if (hasEdges) return false;

  // description 이 있으면 빈 노드 아님
  const desc = String(d.description ?? '').trim();
  if (desc) return false;

  // 모든 노드 타입: selectedTable 이 있으면 빈 노드 아님
  if (d.selectedTable) return false;

  const nodeType = String(d.nodeType ?? '');

  switch (nodeType) {
    case 'page':
      return !d.label || d.label === '새 화면';
    case 'component':
      return (!d.label || d.label === '새 구성요소') && !d.code;
    case 'function':
      return !d.code;
    case 'data':
      return !d.selectedTable;
    case 'muiComponent':
      // description 이 없으면 빈 노드 (위에서 이미 확인)
      return true;
    default:
      return true;
  }
}

/**
 * 노드 배열을 빈 노드 / 데이터 있는 노드로 분류합니다.
 */
export function partitionNodesByEmpty(
  nodes: Node[],
  edges: Edge[],
): { emptyNodes: Node[]; dataNodes: Node[] } {
  const emptyNodes: Node[] = [];
  const dataNodes: Node[] = [];

  for (const node of nodes) {
    if (isEmptyNode(node, edges)) {
      emptyNodes.push(node);
    } else {
      dataNodes.push(node);
    }
  }

  return { emptyNodes, dataNodes };
}
