import { Context, Item, Project } from "@prisma/client";
import { create } from "zustand";

interface ReviewItems {
  inboxItems: Item[];
  nextActions: Item[];
  projects: Project[];
  waitingFor: Item[];
  somedayMaybe: Item[];
}

interface DashboardData {
  inboxCount: number;
  nextActionsCount: number;
  projectsCount: number;
  contextsCount: number;
  recentItems: Item[];
}

export interface NextAction extends Item {
  project?: Project;
  contexts?: Context[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
  items: Item[];
}

interface AppState {
  items: Item[];
  projects: Project[];
  contexts: Context[];
  nextActions: NextAction[];
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setContexts: (contexts: Context[]) => void;
  addContext: (context: Context) => void;
  updateContext: (context: Context) => void;
  removeContext: (id: string) => void;
  setNextActions: (nextActions: NextAction[]) => void;
  updateNextAction: (updatedAction: NextAction) => void;
  removeNextAction: (id: string) => void;
  reviewItems: ReviewItems;
  setReviewItems: (items: ReviewItems) => void;
  dashboardData: DashboardData;
  setDashboardData: (data: DashboardData) => void;
  reorderNextActions: (reorderedActions: NextAction[]) => void;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (tag: Tag) => void;
  removeTag: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  items: [],
  projects: [],
  contexts: [],
  nextActions: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (updatedProject) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project,
      ),
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    })),
  setContexts: (contexts) => set({ contexts }),
  addContext: (context) =>
    set((state) => ({ contexts: [...state.contexts, context] })),
  updateContext: (updatedContext) =>
    set((state) => ({
      contexts: state.contexts.map((context) =>
        context.id === updatedContext.id ? updatedContext : context,
      ),
    })),
  removeContext: (id) =>
    set((state) => ({
      contexts: state.contexts.filter((context) => context.id !== id),
    })),
  setNextActions: (nextActions) => set({ nextActions }),
  updateNextAction: (updatedAction) =>
    set((state) => ({
      nextActions: state.nextActions.map((action) =>
        action.id === updatedAction.id ? updatedAction : action,
      ),
    })),
  removeNextAction: (id) =>
    set((state) => ({
      nextActions: state.nextActions.filter((action) => action.id !== id),
    })),
  reviewItems: {
    inboxItems: [],
    nextActions: [],
    projects: [],
    waitingFor: [],
    somedayMaybe: [],
  },
  setReviewItems: (items) => set({ reviewItems: items }),
  dashboardData: {
    inboxCount: 0,
    nextActionsCount: 0,
    projectsCount: 0,
    contextsCount: 0,
    recentItems: [],
  },
  setDashboardData: (data) => set({ dashboardData: data }),
  reorderNextActions: (reorderedActions) =>
    set(() => ({
      nextActions: reorderedActions,
    })),
  tags: [],
  setTags: (tags) => set({ tags }),
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  updateTag: (updatedTag) =>
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === updatedTag.id ? updatedTag : tag,
      ),
    })),
  removeTag: (id) =>
    set((state) => ({ tags: state.tags.filter((tag) => tag.id !== id) })),
}));
