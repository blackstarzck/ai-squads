import type { Node } from '@xyflow/react';

// 그리드 설정
export const GRID_CONFIG = {
  // 자식 노드 크기 (DataNode 기준)
  CHILD_WIDTH: 288, // w-72 = 18rem = 288px
  CHILD_HEIGHT: 100, // DataNode 높이 약 100px (패딩 포함)
  
  // 그리드 간격
  GAP_X: 12,
  GAP_Y: 12,
  
  // 컨테이너 패딩
  PADDING_TOP: 75, // 헤더 영역 아래
  PADDING_LEFT: 12,
  PADDING_RIGHT: 12,
  PADDING_BOTTOM: 12,
  
  // 컨테이너 최소 크기
  MIN_CONTAINER_WIDTH: 320,
  MIN_CONTAINER_HEIGHT: 180,
  
  // 기본 열 수
  DEFAULT_COLS: 1,
};

interface GridSlot {
  row: number;
  col: number;
  x: number;
  y: number;
}

/**
 * 컨테이너 크기에 맞는 그리드 슬롯 목록 생성
 */
export function getGridSlots(
  containerWidth: number,
  containerHeight: number
): GridSlot[] {
  const { 
    CHILD_WIDTH, 
    CHILD_HEIGHT, 
    GAP_X, 
    GAP_Y, 
    PADDING_TOP, 
    PADDING_LEFT, 
    PADDING_RIGHT, 
    PADDING_BOTTOM 
  } = GRID_CONFIG;
  
  // 사용 가능한 영역
  const availableWidth = containerWidth - PADDING_LEFT - PADDING_RIGHT;
  const availableHeight = containerHeight - PADDING_TOP - PADDING_BOTTOM;
  
  // 한 행에 들어갈 수 있는 열 수
  const cols = Math.max(1, Math.floor((availableWidth + GAP_X) / (CHILD_WIDTH + GAP_X)));
  // 들어갈 수 있는 행 수
  const rows = Math.max(1, Math.floor((availableHeight + GAP_Y) / (CHILD_HEIGHT + GAP_Y)));
  
  const slots: GridSlot[] = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      slots.push({
        row,
        col,
        x: PADDING_LEFT + col * (CHILD_WIDTH + GAP_X),
        y: PADDING_TOP + row * (CHILD_HEIGHT + GAP_Y),
      });
    }
  }
  
  return slots;
}

/**
 * 현재 자식 노드들이 차지하고 있는 슬롯 인덱스 계산
 */
export function getOccupiedSlotIndices(
  childNodes: Node[],
  containerWidth: number,
  containerHeight: number
): Set<number> {
  const slots = getGridSlots(containerWidth, containerHeight);
  const occupied = new Set<number>();
  
  childNodes.forEach((child) => {
    // 각 슬롯과의 거리를 계산하여 가장 가까운 슬롯 찾기
    let minDistance = Infinity;
    let closestSlotIndex = -1;
    
    slots.forEach((slot, index) => {
      const distance = Math.sqrt(
        Math.pow(child.position.x - slot.x, 2) + 
        Math.pow(child.position.y - slot.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSlotIndex = index;
      }
    });
    
    if (closestSlotIndex >= 0) {
      occupied.add(closestSlotIndex);
    }
  });
  
  return occupied;
}

/**
 * 빈 그리드 슬롯 중 첫 번째 찾기
 */
export function findFirstEmptySlot(
  childNodes: Node[],
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  const slots = getGridSlots(containerWidth, containerHeight);
  const occupied = getOccupiedSlotIndices(childNodes, containerWidth, containerHeight);
  
  // 첫 번째 빈 슬롯 찾기
  for (let i = 0; i < slots.length; i++) {
    if (!occupied.has(i)) {
      return { x: slots[i].x, y: slots[i].y };
    }
  }
  
  // 모든 슬롯이 차있으면 새 행에 배치
  const { PADDING_LEFT, PADDING_TOP, CHILD_HEIGHT, GAP_Y } = GRID_CONFIG;
  const newRow = Math.floor(childNodes.length / Math.max(1, slots.length)) + 1;
  
  return {
    x: PADDING_LEFT,
    y: PADDING_TOP + newRow * (CHILD_HEIGHT + GAP_Y),
  };
}

/**
 * 주어진 위치를 가장 가까운 그리드 슬롯에 스냅
 */
export function snapToGrid(
  position: { x: number; y: number },
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  const slots = getGridSlots(containerWidth, containerHeight);
  
  if (slots.length === 0) {
    return { x: GRID_CONFIG.PADDING_LEFT, y: GRID_CONFIG.PADDING_TOP };
  }
  
  // 가장 가까운 슬롯 찾기
  let minDistance = Infinity;
  let closestSlot = slots[0];
  
  slots.forEach((slot) => {
    const distance = Math.sqrt(
      Math.pow(position.x - slot.x, 2) + 
      Math.pow(position.y - slot.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestSlot = slot;
    }
  });
  
  return { x: closestSlot.x, y: closestSlot.y };
}

/**
 * 드롭 시 최적의 그리드 위치 계산
 * - 기존 자식 노드와 겹치지 않는 위치
 * - 드롭 위치에서 가장 가까운 빈 슬롯
 */
export function calculateGridPosition(
  dropPosition: { x: number; y: number },
  siblingNodes: Node[],
  containerWidth: number,
  containerHeight: number,
  droppedNodeId?: string
): { x: number; y: number } {
  // 드롭되는 노드 자신 제외
  const otherChildren = droppedNodeId 
    ? siblingNodes.filter(n => n.id !== droppedNodeId)
    : siblingNodes;
  
  const slots = getGridSlots(containerWidth, containerHeight);
  const occupied = getOccupiedSlotIndices(otherChildren, containerWidth, containerHeight);
  
  if (slots.length === 0) {
    return { x: GRID_CONFIG.PADDING_LEFT, y: GRID_CONFIG.PADDING_TOP };
  }
  
  // 드롭 위치에서 가장 가까운 빈 슬롯 찾기
  let minDistance = Infinity;
  let bestSlot = slots[0];
  
  slots.forEach((slot, index) => {
    if (occupied.has(index)) return; // 이미 차지된 슬롯 건너뛰기
    
    const distance = Math.sqrt(
      Math.pow(dropPosition.x - slot.x, 2) + 
      Math.pow(dropPosition.y - slot.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      bestSlot = slot;
    }
  });
  
  return { x: bestSlot.x, y: bestSlot.y };
}

/**
 * 컨테이너가 리사이즈될 때 자식 노드들 재배치
 */
export function redistributeChildren(
  childNodes: Node[],
  newContainerWidth: number,
  newContainerHeight: number
): Map<string, { x: number; y: number }> {
  const slots = getGridSlots(newContainerWidth, newContainerHeight);
  const newPositions = new Map<string, { x: number; y: number }>();
  
  // 기존 위치 기준으로 정렬 (왼쪽 위부터)
  const sortedChildren = [...childNodes].sort((a, b) => {
    const aScore = a.position.y * 10000 + a.position.x;
    const bScore = b.position.y * 10000 + b.position.x;
    return aScore - bScore;
  });
  
  sortedChildren.forEach((child, index) => {
    if (index < slots.length) {
      newPositions.set(child.id, { x: slots[index].x, y: slots[index].y });
    } else {
      // 슬롯이 부족하면 새 행에 배치
      const { PADDING_LEFT, PADDING_TOP, CHILD_HEIGHT, CHILD_WIDTH, GAP_X, GAP_Y } = GRID_CONFIG;
      const cols = Math.max(1, slots.length > 0 ? Math.floor((slots[slots.length - 1].col + 1)) : 1);
      const newRow = Math.floor(index / cols);
      const newCol = index % cols;
      
      newPositions.set(child.id, {
        x: PADDING_LEFT + newCol * (CHILD_WIDTH + GAP_X),
        y: PADDING_TOP + newRow * (CHILD_HEIGHT + GAP_Y),
      });
    }
  });
  
  return newPositions;
}

/**
 * 자식 노드 수에 따라 필요한 컨테이너 크기 계산
 * @param childCount 자식 노드 수
 * @param cols 열 수 (기본값: 1)
 * @returns { width, height } 필요한 컨테이너 크기
 */
export function calculateContainerSize(
  childCount: number,
  cols: number = GRID_CONFIG.DEFAULT_COLS
): { width: number; height: number } {
  const {
    CHILD_WIDTH,
    CHILD_HEIGHT,
    GAP_X,
    GAP_Y,
    PADDING_TOP,
    PADDING_LEFT,
    PADDING_RIGHT,
    PADDING_BOTTOM,
    MIN_CONTAINER_WIDTH,
    MIN_CONTAINER_HEIGHT,
  } = GRID_CONFIG;
  
  if (childCount === 0) {
    return { width: MIN_CONTAINER_WIDTH, height: MIN_CONTAINER_HEIGHT };
  }
  
  // 필요한 행 수 계산
  const rows = Math.ceil(childCount / cols);
  
  // 필요한 너비 계산
  const contentWidth = cols * CHILD_WIDTH + (cols - 1) * GAP_X;
  const width = Math.max(MIN_CONTAINER_WIDTH, contentWidth + PADDING_LEFT + PADDING_RIGHT);
  
  // 필요한 높이 계산
  const contentHeight = rows * CHILD_HEIGHT + (rows - 1) * GAP_Y;
  const height = Math.max(MIN_CONTAINER_HEIGHT, contentHeight + PADDING_TOP + PADDING_BOTTOM);
  
  return { width, height };
}
