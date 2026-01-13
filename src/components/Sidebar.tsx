import React, { useState } from 'react';
import { Project, Priority, FilterOptions, GroupBy } from '../types/todo';
import { CharacterMark } from './CharacterMark';
import {
  Inbox,
  Calendar,
  Flame,
  CheckCircle,
  Folder,
  Plus,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  filterOptions: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  onAddProject: (newProject: { name: string; emoji: string; color: string }) => void;
  taskCounts: {
    all: number;
    today: number;
    recurring: number;
    completed: number;
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    byProject: Record<string, number>;
  };
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  filterOptions,
  onFilterChange,
  groupBy,
  onGroupByChange,
  onAddProject,
  taskCounts,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjEmoji, setNewProjEmoji] = useState('📌');
  const [newProjColor, setNewProjColor] = useState('#0075de');
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    onAddProject({
      name: newProjName.trim(),
      emoji: newProjEmoji,
      color: newProjColor,
    });
    setNewProjName('');
    setIsAddingProject(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#f6f5f4] border-r border-black/[0.08] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand / Header */}
        <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CharacterMark type="creator" color="yellow" size="sm" />
            <div className="min-w-0">
              <h1 className="text-xs font-semibold text-black tracking-tight truncate">
                Workspace Journal
              </h1>
              <p className="text-[11px] text-black/40 font-editorial truncate">
                Notion Notebook
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-black/40 hover:text-black rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3">
          <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-black/[0.08] text-xs">
            <Search className="w-3.5 h-3.5 text-black/40 shrink-0" />
            <input
              type="text"
              value={filterOptions.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Filter tasks or #tags..."
              className="bg-transparent text-xs text-black placeholder:text-black/35 outline-none w-full"
            />
            {filterOptions.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="text-black/30 hover:text-black text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation / Filters */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 text-xs">
          {/* Smart Views */}
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-black/40 px-2 py-1 uppercase tracking-wider">
              Views
            </div>

            <button
              onClick={() => {
                onFilterChange({ dateRange: 'all', recurringOnly: false, priority: 'all', projectId: 'all' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-left ${
                filterOptions.dateRange === 'all' &&
                !filterOptions.recurringOnly &&
                filterOptions.priority === 'all' &&
                filterOptions.projectId === 'all'
                  ? 'bg-white font-medium text-black shadow-xs'
                  : 'text-black/70 hover:bg-black/[0.03] hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2">
                <Inbox className="w-3.5 h-3.5 text-black/60" />
                <span>All Tasks</span>
              </div>
              <span className="font-mono text-[11px] text-black/40 tabular-nums">
                {taskCounts.all}
              </span>
            </button>

            <button
              onClick={() => {
                onFilterChange({ dateRange: 'today', recurringOnly: false });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-left ${
                filterOptions.dateRange === 'today'
                  ? 'bg-white font-medium text-black shadow-xs'
                  : 'text-black/70 hover:bg-black/[0.03] hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#ffb110]" />
                <span>Due Today</span>
              </div>
              <span className="font-mono text-[11px] text-black/40 tabular-nums">
                {taskCounts.today}
              </span>
            </button>

            <button
              onClick={() => {
                onFilterChange({ recurringOnly: !filterOptions.recurringOnly });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-left ${
                filterOptions.recurringOnly
                  ? 'bg-white font-medium text-black shadow-xs'
                  : 'text-black/70 hover:bg-black/[0.03] hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#f64932]" />
                <span>Recurring Routines</span>
              </div>
              <span className="font-mono text-[11px] text-black/40 tabular-nums">
                {taskCounts.recurring}
              </span>
            </button>

            <button
              onClick={() => {
                onFilterChange({ status: filterOptions.status === 'completed' ? 'all' : 'completed' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-left ${
                filterOptions.status === 'completed'
                  ? 'bg-white font-medium text-black shadow-xs'
                  : 'text-black/70 hover:bg-black/[0.03] hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed Archive</span>
              </div>
              <span className="font-mono text-[11px] text-black/40 tabular-nums">
                {taskCounts.completed}
              </span>
            </button>
          </div>

          {/* Priority Levels Filter */}
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-black/40 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
              <span>Priorities</span>
              {filterOptions.priority !== 'all' && (
                <button
                  onClick={() => onFilterChange({ priority: 'all' })}
                  className="text-[10px] text-[#0075de] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              onClick={() => {
                onFilterChange({ priority: filterOptions.priority === 'p1' ? 'all' : 'p1' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-colors text-left ${
                filterOptions.priority === 'p1'
                  ? 'bg-white font-medium text-black'
                  : 'text-black/70 hover:bg-black/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f64932]" />
                <span>P1 Urgent</span>
              </div>
              <span className="font-mono text-[11px] text-black/40 tabular-nums">
                {taskCounts.p1}
              </span>
            </button>

            <button
              onClick={() => {
                onFilterChange({ priority: filterOptions.priority === 'p2' ? 'all' : 'p2' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-colors text-left ${
                filterOptions.priority === 'p2'
                  ? 'bg-white font-medium text-black'
                  : 'text-black/70 hover:bg-black/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ffb110]" />
                <span>P2 High</span>
              </div>
              <span className="font-mono text-[11px] text-black/40 tabular-nums">
                {taskCounts.p2}
              </span>
            </button>

            <button
              onClick={() => {
                onFilterChange({ priority: filterOptions.priority === 'p3' ? 'all' : 'p3' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-colors text-left ${
                filterOptions.priority === 'p3'
                  ? 'bg-white font-medium text-black'
                  : 'text-black/70 hover:bg-black/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#097fe8]" />
                <span>P3 Medium</span>
              </div>
              <span className="font-mono text-[11px] text-black/40 tabular-nums">
                {taskCounts.p3}
              </span>
            </button>

            <button
              onClick={() => {
                onFilterChange({ priority: filterOptions.priority === 'p4' ? 'all' : 'p4' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-colors text-left ${
                filterOptions.priority === 'p4'
                  ? 'bg-white font-medium text-black'
                  : 'text-black/70 hover:bg-black/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#757575]" />
                <span>P4 Low</span>
              </div>
              <span className="font-mono text-[11px] text-black/40 tabular-nums">
                {taskCounts.p4}
              </span>
            </button>
          </div>

          {/* Projects / Notebooks Section */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2 py-1">
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="text-[11px] font-semibold text-black/40 uppercase tracking-wider flex items-center gap-1 hover:text-black"
              >
                {projectsExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>Projects</span>
              </button>

              <button
                onClick={() => setIsAddingProject(true)}
                className="p-0.5 text-black/40 hover:text-black rounded"
                title="Add new project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {projectsExpanded && (
              <div className="space-y-0.5">
                {projects.map((p) => {
                  const isSelected = filterOptions.projectId === p.id;
                  const count = taskCounts.byProject[p.id] || 0;

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onFilterChange({ projectId: isSelected ? 'all' : p.id });
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-left ${
                        isSelected
                          ? 'bg-white font-medium text-black shadow-xs'
                          : 'text-black/70 hover:bg-black/[0.03] hover:text-black'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{p.emoji}</span>
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-black/40 tabular-nums">
                        {count}
                      </span>
                    </button>
                  );
                })}

                {/* Inline Add Project Form */}
                {isAddingProject && (
                  <form
                    onSubmit={handleCreateProject}
                    className="p-2 bg-white rounded-lg border border-black/[0.08] space-y-2 mt-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newProjEmoji}
                        onChange={(e) => setNewProjEmoji(e.target.value)}
                        className="w-8 text-center text-sm bg-black/[0.03] rounded p-1 outline-none"
                        maxLength={2}
                      />
                      <input
                        type="text"
                        value={newProjName}
                        onChange={(e) => setNewProjName(e.target.value)}
                        placeholder="Project title..."
                        className="flex-1 text-xs bg-transparent outline-none border-b border-black/[0.1] pb-0.5"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAddingProject(false)}
                        className="px-2 py-0.5 text-[11px] text-black/50 hover:text-black"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newProjName.trim()}
                        className="px-2.5 py-0.5 text-[11px] font-medium bg-[#0075de] text-white rounded disabled:opacity-50"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Grouping Selector */}
          <div className="pt-2 border-t border-black/[0.06] space-y-1">
            <div className="text-[11px] font-semibold text-black/40 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Group View By</span>
            </div>
            <div className="grid grid-cols-2 gap-1 px-1">
              {(['status', 'priority', 'project', 'none'] as GroupBy[]).map((g) => (
                <button
                  key={g}
                  onClick={() => onGroupByChange(g)}
                  className={`px-2 py-1 text-[11px] font-medium rounded capitalize transition-colors text-center ${
                    groupBy === g
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-black/60 hover:text-black hover:bg-black/[0.02]'
                  }`}
                >
                  {g === 'none' ? 'No Grouping' : g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-black/[0.06] bg-[#f6f5f4] text-[11px] text-black/45 font-editorial flex items-center justify-between">
          <span>Notion Canvas v2.4</span>
          <span className="font-mono text-[10px]">#f6f5f4</span>
        </div>
      </aside>
    </>
  );
};
