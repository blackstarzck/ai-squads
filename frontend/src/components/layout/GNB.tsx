"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { usePageContentStore } from '@/stores/pageContentStore';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Play, Share2, ShieldAlert, Menu, Sun, Moon, Monitor, Plus, Folder, Trash2, Pencil, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export const GNB = () => {
  const {
    projectName,
    version,
    riskScore,
    projects,
    currentProjectId,
    setCurrentProject,
    addProject,
    removeProject,
    renameProject,
  } = useProjectStore();
  const { nodes } = useCanvasStore();
  const { removePage: removePageContent } = usePageContentStore();
  const { theme, setTheme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const getRiskColor = (score: number) => {
    if (score < 3) return 'bg-green-500';
    if (score < 7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleNewProject = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: '새 프로젝트',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProject(newProject);
  };

  const handleDeleteProject = () => {
    if (!currentProjectId) return;
    // 현재 캔버스에서 페이지 노드 ID 수집 → pageContentStore 정리
    const pageNodeIds = nodes
      .filter((n) => n.data?.nodeType === 'page')
      .map((n) => n.id);
    pageNodeIds.forEach((id) => removePageContent(id));
    // projectStore.removeProject → canvasStore subscribe가 자동으로 switchProject + removeProjectData 호출
    removeProject(currentProjectId);
    setDeleteDialogOpen(false);
  };

  const currentProjectName = projects.find((p) => p.id === currentProjectId)?.name;

  const startRenaming = () => {
    if (!currentProjectId || !currentProjectName) return;
    setRenameValue(currentProjectName);
    setIsRenaming(true);
  };

  const commitRename = () => {
    if (currentProjectId && renameValue.trim()) {
      renameProject(currentProjectId, renameValue.trim());
    }
    setIsRenaming(false);
  };

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  return (
    <TooltipProvider delayDuration={300}>
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>

          {/* 로고 */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs">
              AI
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold leading-none">AI-Sync</h1>
              <span className="text-[10px] text-muted-foreground">OpenDev</span>
            </div>
          </div>

          {/* 프로젝트 셀렉트 + 생성 버튼 */}
          <div className="flex items-center space-x-1.5 ml-2">
            {isRenaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                className="h-8 w-[180px] text-xs px-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <Select
                value={currentProjectId ?? undefined}
                onValueChange={(value) => setCurrentProject(value)}
              >
                <SelectTrigger className="h-8 w-[180px] text-xs">
                  <Folder className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="프로젝트 선택" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="text-xs">
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleNewProject}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>새 프로젝트 만들기</p>
              </TooltipContent>
            </Tooltip>

            {currentProjectId && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground"
                      onClick={startRenaming}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>프로젝트 이름 수정</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>프로젝트 삭제</p>
                  </TooltipContent>
                </Tooltip>

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>프로젝트를 삭제할까요?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{currentProjectName}&rdquo; 프로젝트와 관련된 모든 화면, PRD,
                        화면 구성, 와이어프레임 데이터가 삭제됩니다. 이 작업은 되돌릴 수
                        없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDeleteProject}
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-md border">
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Risk Score:</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getRiskColor(riskScore)}`} />
              <span className="text-xs font-bold">{riskScore}/10</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-border" />

          {/* Theme toggle */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">테마 변경</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>테마 변경</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                라이트
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                다크
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                시스템
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-[1px] bg-border" />

          <Button
            size="sm"
            variant="outline"
            className="space-x-2"
            onClick={() => {
              const url = `${window.location.origin}/workspace${currentProjectId ? `?project=${currentProjectId}` : ''}`;
              navigator.clipboard.writeText(url).then(() => {
                toast.success('공유 링크가 클립보드에 복사되었어요');
              }).catch(() => {
                toast.error('클립보드 복사에 실패했어요');
              });
            }}
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
          <Button
            size="sm"
            className="space-x-2 bg-primary hover:bg-primary/90"
            onClick={() => {
              if (!currentProjectId) {
                toast.warning('먼저 프로젝트를 선택해주세요');
                return;
              }
              toast.success('배포가 시작되었어요', {
                description: `"${currentProjectName}" 프로젝트를 배포 중이에요. 잠시만 기다려주세요.`,
                icon: <Check className="w-4 h-4" />,
              });
            }}
          >
            <Play className="w-4 h-4" />
            <span>Deploy</span>
          </Button>
        </div>
      </header>
    </TooltipProvider>
  );
};
