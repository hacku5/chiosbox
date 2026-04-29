import { create } from "zustand";

export interface MockPackage {
  id: string;
  tracking_no: string;
  carrier: string;
  content: string;
  status: "bekleniyor" | "yolda" | "depoda" | "teslim_edildi";
  weight: number;
  width?: number;
  height?: number;
  arrived_at: string | null;
  free_days_left: number;
  shelf_location: string | null;
  master_box_id: string | null;
  created_at: string;
  storage_days_used: number;
}

export interface MockInvoice {
  id: string;
  accept_fee: number;
  consolidation_fee: number;
  demurrage_fee: number;
  total: number;
  status: string;
  created_at: string;
  items: { fee_type: string; amount: number; packages: { tracking_no: string; content: string } | null }[];
}

export interface MockMessage {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export const ORDER_FLOW_STEPS = 5;

export const TOUR_DEMO_PACKAGE: MockPackage = {
  id: "mock-3",
  tracking_no: "TR-2026-0044",
  carrier: "DHL",
  content: "Nike Air Max 90",
  status: "yolda",
  weight: 1.8,
  arrived_at: null,
  free_days_left: 14,
  shelf_location: null,
  master_box_id: null,
  created_at: "2026-04-28",
  storage_days_used: 0,
};

const initialMockPackages: MockPackage[] = [
  {
    id: "mock-1",
    tracking_no: "TR-2026-0042",
    carrier: "Yurti\u00e7i Kargo",
    content: "Elektronik aksesuar",
    status: "depoda",
    weight: 2.5,
    arrived_at: "2026-04-20",
    free_days_left: 8,
    shelf_location: "A-12",
    master_box_id: null,
    created_at: "2026-04-18",
    storage_days_used: 8,
  },
  {
    id: "mock-2",
    tracking_no: "TR-2026-0043",
    carrier: "MNG Kargo",
    content: "Giyim \u00fcr\u00fcnleri",
    status: "depoda",
    weight: 1.2,
    arrived_at: "2026-04-22",
    free_days_left: 10,
    shelf_location: "B-05",
    master_box_id: null,
    created_at: "2026-04-20",
    storage_days_used: 6,
  },
];

const initialMockInvoices: MockInvoice[] = [
  {
    id: "INV-MOCK-001",
    accept_fee: 6.0,
    consolidation_fee: 4.50,
    demurrage_fee: 0,
    total: 10.50,
    status: "PENDING",
    created_at: "2026-04-25",
    items: [
      { fee_type: "Kabul \u00dccreti (2 paket)", amount: 6.0, packages: null },
      { fee_type: "Konsolidasyon \u00dccreti", amount: 4.50, packages: null },
    ],
  },
];

const initialMockMessages: MockMessage[] = [
  { id: "msg-1", message: "Merhaba! Paketiniz depomuza ula\u015ft\u0131, raflama i\u015flemi yap\u0131l\u0131yor.", is_admin: true, created_at: "2026-04-20T10:30:00" },
  { id: "msg-2", message: "Te\u015fekk\u00fcrler, foto\u011fraf\u0131 g\u00f6rebilir miyim?", is_admin: false, created_at: "2026-04-20T10:35:00" },
  { id: "msg-3", message: "Tabii, foto\u011fraf panelinizde g\u00f6r\u00fcn\u00fcyor olmal\u0131. Raflama tamamland\u0131, A-12 raf\u0131na yerle\u015ftirildi.", is_admin: true, created_at: "2026-04-20T10:40:00" },
];

interface TourState {
  isRunning: boolean;
  currentStep: number;
  completed: boolean;
  mockPackages: MockPackage[];
  mockInvoices: MockInvoice[];
  mockMessages: MockMessage[];
  showOrderFlow: boolean;
  orderFlowStep: number;

  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  completeTour: () => void;
  addMockPackage: (pkg: MockPackage) => void;
  removeMockPackage: (id: string) => void;
  openOrderFlow: () => void;
  closeOrderFlow: () => void;
  nextOrderFlowStep: () => void;
  resetOrderFlow: () => void;
}

export const useTourStore = create<TourState>()((set, get) => ({
  isRunning: false,
  currentStep: 0,
  completed: false,
  mockPackages: [...initialMockPackages],
  mockInvoices: [...initialMockInvoices],
  mockMessages: [...initialMockMessages],
  showOrderFlow: false,
  orderFlowStep: 0,

  startTour: () => set({
    isRunning: true,
    currentStep: 0,
    completed: false,
    mockPackages: [...initialMockPackages],
    mockInvoices: [...initialMockInvoices],
    mockMessages: [...initialMockMessages],
  }),

  stopTour: () => set({
    isRunning: false,
    currentStep: 0,
    mockPackages: [],
    mockInvoices: [],
    mockMessages: [],
  }),

  nextStep: () => {
    const { currentStep, mockPackages } = get();
    const next = currentStep + 1;
    // Add 3rd demo package after submit step (step 11)
    if (currentStep === 11 && !mockPackages.find(p => p.id === "mock-3")) {
      set({ currentStep: next, mockPackages: [...mockPackages, TOUR_DEMO_PACKAGE] });
    } else {
      set({ currentStep: next });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  completeTour: () => set({
    isRunning: false,
    completed: true,
    currentStep: 0,
    mockPackages: [],
    mockInvoices: [],
    mockMessages: [],
  }),

  addMockPackage: (pkg) => set((state) => ({
    mockPackages: [...state.mockPackages, pkg],
  })),

  removeMockPackage: (id) => set((state) => ({
    mockPackages: state.mockPackages.filter((p) => p.id !== id),
  })),

  openOrderFlow: () => set({ showOrderFlow: true, orderFlowStep: 0 }),

  closeOrderFlow: () => set({ showOrderFlow: false, orderFlowStep: 0 }),

  nextOrderFlowStep: () => {
    const { orderFlowStep } = get();
    if (orderFlowStep < ORDER_FLOW_STEPS - 1) {
      set({ orderFlowStep: orderFlowStep + 1 });
    } else {
      set({ showOrderFlow: false, orderFlowStep: 0 });
    }
  },

  resetOrderFlow: () => set({ showOrderFlow: false, orderFlowStep: 0 }),
}));
