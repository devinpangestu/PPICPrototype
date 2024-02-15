import create from "zustand";
import moment from "moment";
export const useSearchFilterStore = create((set) => ({
  dateRange: [moment(), moment()],
  setDateRange: (range) => set({ dateRange: range }),

  suppliers: [],
  setSuppliers: (data) => set({ suppliers: data }),

  PPICs: [],
  setPPICs: (data) => set({ PPICs: data }),

  filterStatus: null,
  setFilterStatus: (status) => set({ filterStatus: status }),

  pageNumber: 1,
  setPageNumber: (number) => set({ pageNumber: number }),

  totalData: 0,
  setTotalData: (total) => set({ totalData: total }),

  offerSummaryTotal: null,
  setOfferSummaryTotal: (total) => set({ offerSummaryTotal: total }),

  offerSummary: {},
  setOfferSummary: (summary) => set({ offerSummary: summary }),

  offers: [],
  setOffers: (data) => set({ offers: data }),

  previewRowChecked: [],
  setPreviewRowChecked: (checked) => set({ previewRowChecked: checked }),

  // ... other search and filter-related states and actions
}));
