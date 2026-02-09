import { create } from 'zustand';
import { ProjectState } from '@/types';

export const useProjectStore = create<ProjectState>((set) => ({
  projectName: 'Untitled Project',
  version: 'v0.1.0',
  riskScore: 1,
  agentStatus: 'idle',
  setProjectName: (name) => set({ projectName: name }),
  setVersion: (version) => set({ version }),
  setRiskScore: (score) => set({ riskScore: score }),
  setAgentStatus: (status) => set({ agentStatus: status }),
}));
