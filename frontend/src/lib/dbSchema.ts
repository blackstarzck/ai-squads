// schema.sql 기반 정적 테이블/컬럼 정의
export const DB_SCHEMA: Record<string, { label: string; columns: { name: string; type: string }[] }> = {
  projects: {
    label: '프로젝트',
    columns: [
      { name: 'id', type: 'UUID' },
      { name: 'name', type: 'TEXT' },
      { name: 'description', type: 'TEXT' },
      { name: 'version', type: 'TEXT' },
      { name: 'risk_score', type: 'INTEGER' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
      { name: 'updated_at', type: 'TIMESTAMPTZ' },
    ],
  },
  nodes: {
    label: '노드',
    columns: [
      { name: 'id', type: 'UUID' },
      { name: 'project_id', type: 'UUID' },
      { name: 'type', type: 'TEXT' },
      { name: 'label', type: 'TEXT' },
      { name: 'position_x', type: 'FLOAT' },
      { name: 'position_y', type: 'FLOAT' },
      { name: 'data', type: 'JSONB' },
      { name: 'status', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
      { name: 'updated_at', type: 'TIMESTAMPTZ' },
    ],
  },
  edges: {
    label: '연결',
    columns: [
      { name: 'id', type: 'UUID' },
      { name: 'project_id', type: 'UUID' },
      { name: 'source_id', type: 'UUID' },
      { name: 'target_id', type: 'UUID' },
      { name: 'label', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ],
  },
  decision_logs: {
    label: '의사결정 로그',
    columns: [
      { name: 'id', type: 'UUID' },
      { name: 'project_id', type: 'UUID' },
      { name: 'node_id', type: 'UUID' },
      { name: 'version', type: 'TEXT' },
      { name: 'background', type: 'TEXT' },
      { name: 'considerations', type: 'TEXT' },
      { name: 'final_decision', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ],
  },
  chat_messages: {
    label: '채팅 메시지',
    columns: [
      { name: 'id', type: 'UUID' },
      { name: 'project_id', type: 'UUID' },
      { name: 'role', type: 'TEXT' },
      { name: 'content', type: 'TEXT' },
      { name: 'agent_type', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ],
  },
};
