import utils from "utils";
import { Decrypt } from "utils/encryption";
import create from "zustand";

const userInfo = utils.getUserInfo();
export const useDataStore = create((set) => ({
  modalImportCSVShow: false,
  setModalImportCSVShow: (show) => set({ modalImportCSVShow: show }),

  modalCreateShow: false,
  setModalCreateShow: (show) => set({ modalCreateShow: show }),

  modalSplitScheduleShow: false,
  setModalSplitScheduleShow: (show) => set({ modalSplitScheduleShow: show }),
  modalSplitScheduleData: null,
  setModalSplitScheduleData: (data) => set({ modalSplitScheduleData: data }),

  modalEditShow: false,
  setModalEditShow: (show) => set({ modalEditShow: show }),
  modalEditData: null,
  setModalEditData: (data) => set({ modalEditData: data }),

  suppliersSearch: [],
  setSuppliersSearch: (data) => set({ suppliersSearch: data }),
  usersSearch: [],
  setUsersSearch: (data) => set({ usersSearch: data }),

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

  deletedRows: [],
  setDeletedRows: (rows) => set({ deletedRows: rows }),
  // ... other data-related states and actions
}));
