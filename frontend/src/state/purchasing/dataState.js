import create from "zustand";

export const useDataStore = create((set) => ({
  modalImportCSVShow: false,
  setModalImportCSVShow: (show) => set({ modalImportCSVShow: show }),

  modalExportShow: false,
  setModalExportShow: (show) => set({ modalExportShow: show }),

  modalCreateShow: false,
  setModalCreateShow: (show) => set({ modalCreateShow: show }),

  modalSplitScheduleShow: false,
  setModalSplitScheduleShow: (show) => set({ modalSplitScheduleShow: show }),
  modalSplitScheduleData: null,
  setModalSplitScheduleData: (data) => set({ modalSplitScheduleData: data }),

  modalReturScheduleShow: false,
  setModalReturScheduleShow: (show) => set({ modalReturScheduleShow: show }),
  modalReturScheduleData: null,
  setModalReturScheduleData: (data) => set({ modalReturScheduleData: data }),

  modalEditShow: false,
  setModalEditShow: (show) => set({ modalEditShow: show }),
  modalEditData: null,
  setModalEditData: (data) => set({ modalEditData: data }),

  suppliersSearch: [],
  setSuppliersSearch: (data) => set({ suppliersSearch: data }),
  usersSearch: [],
  setUsersSearch: (data) => set({ usersSearch: data }),

  filterValue: {},
  setFilterValue: (newFilterValue) => set({ filterValue: newFilterValue }),

  editTableMode: false,
  setEditTableMode: (mode) => set({ editTableMode: mode }),
  search: null,
  setSearch: (searchValue) => set({ search: searchValue }),
  minDateLoaded: false,
  setMinDateLoaded: (loaded) => set({ minDateLoaded: loaded }),
  arrayOfMerge: [],
  setArrayOfMerge: (data) => set({ arrayOfMerge: data }),
  dataSource: [],
  setDataSource: (data) => set({ dataSource: data }),
  oldDataSource: [],
  setOldDataSource: (data) => set({ oldDataSource: data }),
  editedData: [],
  setEditedData: (data) => set({ editedData: data }),

  cancelClicked: false,
  setCancelClicked: (clicked) => set({ cancelClicked: clicked }),
  filteredInfo: {},
  setFilteredInfo: (info) => set({ filteredInfo: info }),

  sortedInfo: {},
  setSortedInfo: (info) => set({ sortedInfo: info }),
  toggleCheckboxTitle: true,
  setToggleCheckboxTitle: (toggle) => set({ toggleCheckboxTitle: toggle }),

  // ... other data-related states and actions
}));
