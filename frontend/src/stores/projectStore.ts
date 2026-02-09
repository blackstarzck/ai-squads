import { create } from 'zustand';
import { ProjectState, Project } from '@/types';

// 샘플 프로젝트 목록 (나중에 Supabase에서 불러오도록 교체)
const sampleProjects: Project[] = [
  {
    id: 'proj-1',
    name: '쇼핑몰 MVP',
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2026-02-08T14:30:00Z',
  },
  {
    id: 'proj-2',
    name: '사내 예약 시스템',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-07T11:20:00Z',
  },
  {
    id: 'proj-3',
    name: '포트폴리오 사이트',
    createdAt: '2026-01-25T08:00:00Z',
    updatedAt: '2026-02-05T16:45:00Z',
  },
];

export const useProjectStore = create<ProjectState>((set) => ({
  projectName: 'Untitled Project',
  version: 'v0.1.0',
  riskScore: 1,
  agentStatus: 'idle',
  currentProjectId: null,
  currentPageId: null,
  projects: sampleProjects,
  setProjectName: (name) => set({ projectName: name }),
  setVersion: (version) => set({ version }),
  setRiskScore: (score) => set({ riskScore: score }),
  setAgentStatus: (status) => set({ agentStatus: status }),
  setCurrentProject: (id) =>
    set((state) => {
      const project = state.projects.find((p) => p.id === id);
      return {
        currentProjectId: id,
        currentPageId: null, // 프로젝트 전환 시 페이지 선택 초기화
        ...(project ? { projectName: project.name } : {}),
      };
    }),
  setCurrentPage: (id) => set({ currentPageId: id }),
  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
      currentProjectId: project.id,
      currentPageId: null,
      projectName: project.name,
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      ...(state.currentProjectId === id
        ? { currentProjectId: null, currentPageId: null, projectName: 'Untitled Project' }
        : {}),
    })),
  renameProject: (id, name) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
      ),
      ...(state.currentProjectId === id ? { projectName: name } : {}),
    })),
}));
