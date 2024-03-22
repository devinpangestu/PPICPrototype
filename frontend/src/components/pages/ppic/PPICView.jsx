import React, { useMemo, useContext, useEffect, useRef, useState } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { TableNotFoundNotice, SyncOverlay, SectionHeading } from "components";
import { usePageStore } from "state/pageState";
import {
  Row,
  Col,
  Form,
  Button,
  Tabs,
  Badge,
  DatePicker,
  message,
  Modal,
  Select,
  Checkbox,
  Space,
  Table,
  Tag,
  Input,
  Card,
  Tooltip,
} from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";

import utils from "utils";
import configs from "configs";
import constant from "constant";

import ModalImportCSV from "./modal/ModalImportCSV";
import ModalSplitSchedule from "./modal/ModalSplitSchedule";
import ModalEdit from "./modal/ModalEdit";
import ModalCreate from "./modal/ModalCreate";

import moment from "moment";
import handler from "handler";
import {
  authorizationCheck,
  isAccessTokenValid,
  isMobile,
  isSessionTabValid,
  passwordChangedCheck,
} from "utils/auth";
import { useSearchFilterStore } from "state/ppic/searchFilterState";
import { useDataStore } from "state/ppic/dataState";
import { Decrypt } from "utils/encryption";
import { renderPlainColFindLabel } from "utils/table";
import { render } from "less";
import ModalExport from "components/ModalExport";

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  handleCancel,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const [currentDate, setCurrentDate] = useState(null);
  const [originalDate, setOriginalDate] = useState(null);
  const { suppliers } = useSearchFilterStore();
  const [newSupplier, setNewSupplier] = useState(null);

  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    let isMounted = true;
    if (isMounted && editing) {
      inputRef.current.focus();
    }
    return () => {
      isMounted = false;
    };
  }, [editing]);

  const toggleEdit = () => {
    if (
      record.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
      record.flag_status === constant.FLAG_STATUS_PPIC_REQUEST ||
      record.flag_status === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
      record.flag_status === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT ||
      record.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
      record.flag_status === constant.FLAG_STATUS_SUPPLIER
    ) {
      setEditing(false);
      Modal.error({
        content: "This data is already completed or in negotiation process",
      });
      return;
    }
    setEditing(!editing);
    let fieldValue = record[dataIndex];
    const isDateType = moment(fieldValue, "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid();
    const isCurrentCellSupplierName = dataIndex === "supplier_name";
    if (isCurrentCellSupplierName) {
      fieldValue = suppliers.find((sup) => sup.value === record.supplier_id).value;
    }
    if (!editing) {
      // If entering edit mode, store the original date
      if (isDateType) {
        setOriginalDate(fieldValue);
        form.setFieldsValue({ [dataIndex]: moment(fieldValue) });
      } else if (isCurrentCellSupplierName) {
        setNewSupplier({
          ref_id: suppliers.find((sup) => sup.value === record.supplier_id).value,
          name: suppliers.find((sup) => sup.value === record.supplier_id).label,
        });
        form.setFieldsValue({
          supplier_name: fieldValue,
        });
      } else {
        form.setFieldsValue({ [dataIndex]: fieldValue });
      }
    } else {
      // If canceling edit mode, revert to the original date
      if (isDateType) {
        setCurrentDate(originalDate);
        form.setFieldsValue({ [dataIndex]: originalDate });
      } else if (isCurrentCellSupplierName) {
        setNewSupplier({
          ref_id: suppliers.find((sup) => sup.value === record.supplier_id).value,
          name: suppliers.find((sup) => sup.value === record.supplier_id).label,
        });
        form.setFieldsValue({
          supplier_name: fieldValue,
        });
      } else {
        form.setFieldsValue({ [dataIndex]: fieldValue });
      }
    }
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      if (values[dataIndex] === null) {
      } else if (dataIndex === "supplier_name") {
        toggleEdit();
        handleSave({
          ...record,
          supplier_id: values.supplier_name,
          supplier: {
            ref_id: values.supplier_name,
            name: suppliers.find((sup) => sup.value === values.supplier_name).label,
          },
        });
      } else {
        toggleEdit();
        handleSave({
          ...record,
          ...values,
        });
      }
    } catch (errInfo) {}
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const renderSelect = (dataIndex, options) => (
    <Form.Item name={dataIndex} initialValue={record[dataIndex]} className="mb-2">
      <Select
        showSearch
        placeholder={`Select ${title}`}
        optionFilterProp="children"
        style={{ width: "100%" }}
        filterOption={filterOption}
        options={options}
        ref={inputRef}
        onPressEnter={save}
        onBlur={save}
      />
    </Form.Item>
  );

  let childNode = children;
  if (editable) {
    const fieldValue = record[dataIndex];
    // Check if fieldValue is a valid Date
    const isDateType = moment(fieldValue, "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid();
    const isCurrentCellSupplierName = dataIndex === "supplier_name";
    const isCurrentCellIOFilter = dataIndex === "io_filter";
    const isCurrentCellCategoryFilter = dataIndex === "category_filter";

    childNode = editing ? (
      isDateType ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
        >
          <DatePicker
            allowClear={false}
            inputReadOnly={false}
            {...utils.FORM_DATEPICKER_PROPS}
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            disabledDate={(current) => {
              if (dataIndex === "submission_date") return current && current > moment();
              if (dataIndex === "est_delivery") return current && current < moment().startOf("day");
            }}
          />
        </Form.Item>
      ) : isCurrentCellSupplierName ? (
        renderSelect(dataIndex, suppliers)
      ) : isCurrentCellIOFilter ? (
        renderSelect(dataIndex, constant.WAREHOUSE_LIST)
      ) : isCurrentCellCategoryFilter ? (
        renderSelect(dataIndex, constant.PPIC_CATEGORY_LIST)
      ) : (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          initialValue={record[dataIndex]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      )
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const PPICView = (props) => {
  const statusMapping = {
    A: "PPIC Init",
    C: "Retur From Procurement",
    E: "At Supplier",
    G: "Request Changes From Supplier",
    // OK: "Confirmed Schedule",
    X: "Completed",
  };
  const statusQAQCMapping = {
    X: "Completed",
  };

  const userInfo = utils.getUserInfo();
  const { pageLoading, setPageLoading } = usePageStore();

  const [t] = useTranslation();
  const [form] = Form.useForm();

  const pageSize = configs.pageSize.ppic.dashboard;

  let defaultFilterStatus = null;
  let defaultActiveTab = "all";

  if (userInfo.role.id === 6) {
    defaultFilterStatus = constant.FLAG_STATUS_COMPLETE_SCHEDULE;
    defaultActiveTab = defaultFilterStatus;
  }
  const [expandable, setExpandable] = useState({
    expandedRowRender: (record) => {
      if (record.flag_status === constant.FLAG_STATUS_PPIC_INIT) {
        return (
          <p style={{ margin: 0, fontSize: "1rem" }}>
            {`${moment(JSON.parse(record.notes)?.init?.created_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )} ${JSON.parse(record.notes)?.init?.created_by} : ${
              JSON.parse(record.notes)?.init?.notes
            }`}
          </p>
        );
      } else if (record.edit_from_id !== null) {
        return (
          <p style={{ margin: 0, fontSize: "1rem" }}>
            {`${moment(JSON.parse(record.notes)?.edit_req?.created_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )} ${JSON.parse(record.notes)?.edit_req?.created_by} : ${
              JSON.parse(record.notes)?.edit_req?.notes
            }`}
          </p>
        );
      } else if (record.split_from_id !== null) {
        return (
          <p style={{ margin: 0, fontSize: "1rem" }}>
            {`${moment(JSON.parse(record.notes)?.split_req?.created_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )} ${JSON.parse(record.notes)?.split_req?.created_by} : ${
              JSON.parse(record.notes)?.split_req?.notes
            } `}
          </p>
        );
      } else {
        return (
          <p style={{ margin: 0, fontSize: "1rem" }}>
            {`${moment(JSON.parse(record.notes)?.retur?.created_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )} ${JSON.parse(record.notes)?.retur?.created_by} : ${
              JSON.parse(record.notes)?.retur?.notes
            }`}
          </p>
        );
      }
    },
    rowExpandable: (record) => {
      const checkFlagStatus = (record) =>
        (record.flag_status === constant.FLAG_STATUS_PPIC_INIT ||
          record.flag_status === constant.FLAG_STATUS_PROCUREMENT_RETUR ||
          record.flag_status === constant.FLAG_STATUS_PPIC_REQUEST) &&
        (JSON.parse(record.notes)?.init?.notes ||
          JSON.parse(record.notes)?.retur?.notes ||
          JSON.parse(record.notes)?.edit_req?.notes ||
          JSON.parse(record.notes)?.split_req?.notes);
      return checkFlagStatus(record);
    },
  });
  const [filterStatus, setFilterStatus] = useState(defaultFilterStatus);
  const {
    dateRange,
    setDateRange,
    suppliers,
    setSuppliers,
    PPICs,
    setPPICs,

    pageNumber,
    setPageNumber,
    totalData,
    setTotalData,
    offerSummaryTotal,
    setOfferSummaryTotal,
    offerSummary,
    setOfferSummary,
    offers,
    setOffers,
    previewRowChecked,
    setPreviewRowChecked,
  } = useSearchFilterStore();
  const {
    modalImportCSVShow,
    setModalImportCSVShow,
    modalExportShow,
    setModalExportShow,
    modalCreateShow,
    setModalCreateShow,
    modalSplitScheduleShow,
    setModalSplitScheduleShow,
    modalSplitScheduleData,
    setModalSplitScheduleData,
    modalEditShow,
    setModalEditShow,
    modalEditData,
    // setModalEditData,
    // suppliersSearch,
    // setSuppliersSearch,
    // usersSearch,
    // setUsersSearch,
    // POSearch,
    // setPOSearch,
    filterValue,
    setFilterValue,
    editTableMode,
    setEditTableMode,
    search,
    // setSearch,
    minDateLoaded,
    setMinDateLoaded,
    arrayOfMerge,
    setArrayOfMerge,
    dataSource,
    setDataSource,
    oldDataSource,
    setOldDataSource,
    editedData,
    setEditedData,
    cancelClicked,
    setCancelClicked,
    filteredInfo,
    setFilteredInfo,
    sortedInfo,
    setSortedInfo,
    toggleCheckboxTitle,
    setToggleCheckboxTitle,
  } = useDataStore();
  //animation
  const [deletedRows, setDeletedRows] = useState([]);

  const rowClassName = (record, index) => {
    const isDeleted = deletedRows.some((deletedRow) => deletedRow?.id === record?.id);
    const flagStatus = record?.flag_status;
    const statusEdited = record?.status_edited;

    if (editTableMode && statusEdited) {
      return "background-color warning-2";
    }
    if (
      (flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
        (flagStatus !== constant.FLAG_STATUS_PPIC_INIT &&
          flagStatus !== constant.FLAG_STATUS_PROCUREMENT_RETUR)) &&
      editTableMode
    ) {
      return "background-color error";
    }
    if (flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE) {
      return "background-color primary-3";
    }
    if (
      flagStatus !== constant.FLAG_STATUS_PPIC_INIT &&
      flagStatus !== constant.FLAG_STATUS_PROCUREMENT_RETUR
    ) {
      return "background-color warning-2";
    }
    return isDeleted && filterStatus !== "deleted"
      ? "editable-row fade-out-exiting"
      : "editable-row";
  };

  const fetchData = async (params) => {
    setPageLoading(true);
    try {
      const responseList = await api.ppic.list(search, 1000, 1, params);
      const rsBodyList = responseList.data.rs_body;
      const offerData = rsBodyList.offer.filter((offer) => !offer.deleted_at);
      // const offerDataCheckList = rsBodyList.offer.filter(
      //   (item) =>
      //     item.flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE &&
      //     item.flag_status !== constant.FLAG_STATUS_PPIC_REQUEST &&
      //     item.flag_status !== constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC &&
      //     item.flag_status !== constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT &&
      //     item.flag_status !== constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
      //     item.flag_status !== constant.FLAG_STATUS_SUPPLIER &&
      //     !item.deleted_at,
      // );

      setDataSource([...offerData]);
      if (
        !filteredInfo.po_number &&
        !filteredInfo.sku_code &&
        !filteredInfo.sku_name &&
        !filteredInfo.supplier_name &&
        !filteredInfo.buyer_name &&
        !filteredInfo.io_filter &&
        !filteredInfo.category_filter
      ) {
        setOldDataSource(offerData.map((offer, index) => ({ key: index + 1, ...offer })));

        setOffers([...offerData]);
        setTotalData(offerData.length);
        setDeletedRows(rsBodyList.offer.filter((row) => row.deleted_at !== null));
        if (offerData.length > 0) {
          setPreviewRowChecked(rsBodyList.offer.map(() => false));
          setArrayOfMerge(
            offerData.map((currRow, index) => {
              const nextRow = offerData[index + 1];
              return (
                nextRow &&
                currRow.supplier_id === nextRow.supplier_id &&
                currRow.po_number === nextRow.po_number &&
                currRow.sku_code === nextRow.sku_code &&
                currRow.po_qty === nextRow.po_qty &&
                currRow.flag_status === nextRow.flag_status &&
                currRow.split_from_id === nextRow.split_from_id
              );
            }),
          );
          setEditTableMode(false);
        } else {
          setPreviewRowChecked([]);
          setArrayOfMerge([]);
        }
      } else {
        setArrayOfMerge(
          offerData.map((currRow, index) => {
            const nextRow = offerData[index + 1];
            return (
              nextRow &&
              currRow.supplier_id === nextRow.supplier_id &&
              currRow.po_number === nextRow.po_number &&
              currRow.sku_code === nextRow.sku_code &&
              currRow.po_qty === nextRow.po_qty &&
              currRow.flag_status === nextRow.flag_status &&
              currRow.split_from_id === nextRow.split_from_id
            );
          }),
        );
        setPreviewRowChecked(rsBodyList.offer.map(() => false));
      }
    } catch (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    } finally {
      setPageLoading(false);
    }
  };
  const fetchSummary = async (params) => {
    setPageLoading(true);
    try {
      const responseSummary = await api.ppic.summary(params);
      const total = Object.values(responseSummary.data.rs_body).reduce(
        (acc, curr) => acc + curr,
        0,
      );
      setOfferSummaryTotal(total);
      setOfferSummary(responseSummary.data.rs_body);
    } catch (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    } finally {
      setPageLoading(false);
    }
  };

  const fetchDeletedData = async (params) => {
    setPageLoading(true);
    try {
      const responseList = await api.ppic.list(search, 1000, 1, params);
      const responseSummary = await api.ppic.summary(params);

      const rsBodyList = responseList.data.rs_body;
      const offerData = rsBodyList.offer;
      const offerDataCheckList = rsBodyList.offer.filter(
        (item) =>
          item.flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE &&
          item.flag_status !== constant.FLAG_STATUS_PPIC_REQUEST &&
          item.flag_status !== constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC &&
          item.flag_status !== constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT &&
          item.flag_status !== constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          item.flag_status !== constant.FLAG_STATUS_SUPPLIER &&
          !item.deleted_at,
      );

      setOldDataSource(offerData.map((offer, index) => ({ key: index + 1, ...offer })));
      setDataSource([...offerData]);
      setOffers([...offerData]);
      setTotalData(offerData.length);
      setDeletedRows(rsBodyList.offer.filter((row) => row.deleted_at !== null));

      if (offerData.length > 0) {
        setPreviewRowChecked(offerDataCheckList.map(() => false));
        setArrayOfMerge(
          offerData.map((currRow, index) => {
            const nextRow = offerData[index + 1];
            return (
              nextRow &&
              currRow.supplier_id === nextRow.supplier_id &&
              currRow.po_number === nextRow.po_number &&
              currRow.sku_code === nextRow.sku_code &&
              currRow.po_qty === nextRow.po_qty &&
              currRow.flag_status === nextRow.flag_status &&
              currRow.split_from_id === nextRow.split_from_id
            );
          }),
        );
        setEditTableMode(false);
      } else {
        setPreviewRowChecked([]);
        setArrayOfMerge([]);
      }

      const total = Object.values(responseSummary.data.rs_body).reduce(
        (acc, curr) => acc + curr,
        0,
      );
      setOfferSummaryTotal(total);
      setOfferSummary(responseSummary.data.rs_body);
    } catch (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (pagination, filters, sorter, extra) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);

    setPreviewRowChecked(extra.currentDataSource.map(() => false));

    if (
      !filteredInfo.po_number &&
      !filteredInfo.sku_code &&
      !filteredInfo.sku_name &&
      !filteredInfo.supplier_name &&
      !filteredInfo.buyer_name &&
      !filteredInfo.io_filter &&
      !filteredInfo.category_filter
    ) {
      setDataSource(oldDataSource);
    } else {
      setDataSource(extra.currentDataSource);
    }
  };

  const loadSuppliersOption = async () => {
    await handler.getSuppliersOptionList(setPageLoading, setSuppliers);
    await handler.getPPICs(setPageLoading, setPPICs);
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleCheckboxChange = (index, initialChecked) => {
    const updatedPreviewRowChecked = previewRowChecked.map((isChecked, i) =>
      i === index ? !isChecked : isChecked,
    );
    // If the title checkbox is checked, update all checkboxes
    if (initialChecked) {
      setPreviewRowChecked(updatedPreviewRowChecked);
    }
  };

  const onResetFilter = async () => {
    setPageLoading(true);
    setFilterValue({
      supplier_id: null,
      user_id: userInfo.role.id !== 6 ? Decrypt(userInfo.user_id) : null,
      search_PO: null,
      io_filter: null,
      category_filter: null,
    });
    form.setFieldsValue({
      user_filter: userInfo.user_name,
      supplier_list: null,
      search_PO: null,
      io_filter: null,
      category_filter: null,
    });
    const otherParams = {
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
      supplier_id: null,
      user_id: userInfo.role.id !== 6 ? Decrypt(userInfo.user_id) : null,
      io_filter: null,
      category_filter: null,
      search_PO: null,
      status: userInfo.role.id !== 6 ? filterStatus : "X" ?? null,
    };
    await fetchData(otherParams);
    await fetchSummary(otherParams);
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadMinDate();
      loadSuppliersOption();
      authorizationCheck(userInfo);
      passwordChangedCheck(userInfo);
      isAccessTokenValid(localStorage.getItem(constant.ACCESS_TOKEN));
      isSessionTabValid(sessionStorage.getItem(constant.ACCESS_TOKEN));
    }

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isMounted = true;
    if (
      isMounted &&
      minDateLoaded &&
      filterStatus !== "A" &&
      filterStatus !== "C" &&
      filterStatus !== "G" &&
      filterStatus !== "X" &&
      filterStatus !== "deleted" &&
      filterStatus !== null
    ) {
      loadOffers();
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, filterValue, filteredInfo, sortedInfo]);
  //when offers change load the user that responsible for making notes
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      setFilteredInfo({});
      setSortedInfo({});

      if (minDateLoaded) {
        loadOffers();
      }
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, minDateLoaded, filterStatus]);

  const loadMinDate = async () => {
    await api.ppic
      .needActionMinDate()
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setDateRange([moment(rsBody.min_date), moment()]);
        const otherParams = {
          from_date: moment(rsBody.min_date).format(constant.FORMAT_API_DATE),
          to_date: moment().format(constant.FORMAT_API_DATE),
          supplier_id: filterValue?.supplier_id ?? null,
          user_id:
            filterValue?.user_id ?? userInfo.role.id !== 6
              ? Decrypt(userInfo.user_id)
              : null ?? null,
          io_filter: filterValue?.io_filter ?? null,
          category_filter: filterValue?.category_filter ?? null,
          status: userInfo.role.id !== 6 ? filterStatus : "X" ?? null,
          search_PO: filterValue?.search_PO,
        };
        fetchSummary(otherParams);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setFilterValue({
          user_id: userInfo.role.id !== 6 ? Decrypt(userInfo.user_id) : null,
        });
        form.setFieldsValue({
          user_filter: userInfo.user_name,
        });
        setMinDateLoaded(true);
      });
  };

  const loadOffers = async () => {
    let errMsg;

    const otherParams = {
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
      user_id: filterValue?.user_id ?? null,
    };

    if (filterStatus !== "deleted") {
      if (filterStatus) otherParams.status = userInfo.role.id !== 6 ? filterStatus : "X";
      if (filterValue.supplier_id) otherParams.supplier_id = filterValue?.supplier_id;
      if (filterValue.user_id) otherParams.user_id = filterValue?.user_id;
      if (filterValue.io_filter) otherParams.io_filter = filterValue?.io_filter;
      if (filterValue.category_filter) otherParams.category_filter = filterValue?.category_filter;
      if (filterValue.search_PO) otherParams.searchPO = filterValue?.search_PO;
      if (search) otherParams.search = search;
      if (
        !filteredInfo.po_number ||
        !filteredInfo.sku_code ||
        !filteredInfo.sku_name ||
        !filteredInfo.supplier_name ||
        !filteredInfo.buyer_name ||
        !filteredInfo.io_filter ||
        !filteredInfo.category_filter ||
        !sortedInfo.column
      ) {
        await fetchData(otherParams);
      }
    } else {
      if (filterStatus) otherParams.status = userInfo.role.id !== 6 ? filterStatus : "X";
      if (filterValue.supplier_id) otherParams.supplier_id = filterValue?.supplier_id;
      if (filterValue.user_id) otherParams.user_id = filterValue?.user_id;
      if (filterValue.io_filter) otherParams.io_filter = filterValue?.io_filter;
      if (filterValue.category_filter) otherParams.category_filter = filterValue?.category_filter;
      if (filterValue.search_PO) otherParams.searchPO = filterValue?.search_PO;
      if (search) otherParams.search = search;
      await fetchDeletedData(otherParams);
    }
    if (errMsg) {
      setPageLoading(false);
      utils.swal.Error({ msg: errMsg });
      return;
    }
  };

  const tableProps = {
    expandable,
  };
  const getCellConfig = (arrayOfMerge, index) => {
    if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === true) {
      return { rowSpan: 0 };
    } else if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === false) {
      return {};
    } else if (!arrayOfMerge[index] && arrayOfMerge[index - 1] === false) {
      return {};
    } else {
      // count the next true value and break the loop after false,
      // and if the true is counted, ignore them
      let count = 0;

      for (let i = index; i < arrayOfMerge.length; i++) {
        if (arrayOfMerge[i] === true) {
          count++;
        } else {
          break;
        }
      }

      if (arrayOfMerge[index - 1] === true) {
        return { rowSpan: 0 };
      }
      if (arrayOfMerge[index] === undefined) {
        return { rowSpan: 10 };
      }
      return { rowSpan: count + 1 };
    }
  };
  // const getCellConfig = useMemo(() => {
  //   return (index) => {
  //     if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === true) {
  //       return { rowSpan: 0 };
  //     } else if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === false) {
  //       return {};
  //     } else {
  //       let count = 0;
  //       if (arrayOfMerge[index - 1] === true) {
  //         return { rowSpan: 0 };
  //       }
  //       for (let i = index; i < arrayOfMerge.length; i++) {
  //         if (arrayOfMerge[i] === true) {
  //           count++;
  //         } else {
  //           break;
  //         }
  //       }
  //       return { rowSpan: count + 1 };
  //     }
  //   };
  // }, [arrayOfMerge]);

  const areObjectsEqualPartial = (obj1, obj2, keysToCompare) => {
    for (const key of keysToCompare) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  };
  // const handleDelete = (key) => {
  //   const newData = dataSource.filter((item) => item.key !== key);
  //   setDataSource(newData);
  // };
  const handleSave = (row) => {
    const keyToCompare = [
      "io_filter",
      "category_filter",
      "submission_date",
      "supplier_id",
      "po_number",
      "po_qty",
      "po_outs",
      "sku_code",
      "sku_name",
      "qty_delivery",
      "est_delivery",
    ];
    const newData = [...dataSource];

    const index = newData.findIndex((item) => row.key === item.key);

    const item = newData[index];

    newData.splice(index, 1, {
      ...item,
      ...row,
      status_edited: areObjectsEqualPartial({ ...row }, oldDataSource[index], keyToCompare)
        ? false
        : true,
    });
    //check the new data and the old data, if id exist in old, remove old and replace new
    const editedDataIndex = editedData.findIndex((item) => item.id === row.id);
    if (editedDataIndex !== -1) {
      editedData.splice(editedDataIndex, 1);
    }
    setEditedData([...editedData, row]);
    setDataSource(newData);
  };
  const handleCancel = () => {
    // Your cancel logic here
    setDataSource(oldDataSource);
    return cancelClicked;
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const filterColumnOpt = (dataIndex) => {
    return [
      ...new Set(
        offers.map((item) => {
          if (dataIndex === "supplier_name") {
            return item?.supplier?.name;
          } else if (dataIndex === "buyer_name") {
            return item?.buyer?.name;
          } else {
            return item[dataIndex];
          }
        }),
      ),
    ].map((value) => {
      if (dataIndex !== "supplier_name") {
        if (dataIndex === "po_number") {
          if (value === "" || value === null) {
            return {
              text: "Empty PO",
              value: "",
            };
          }

          return {
            text: value,
            value,
          };
        }
        if (dataIndex === "io_filter") {
          if (value === "" || value === null) {
            return {
              text: "Empty IO",
              value: "",
            };
          }
          let getLabel = constant.WAREHOUSE_LIST.find((item) => item.value === value);
          return {
            text: getLabel?.label ?? value,
            value: getLabel?.label ?? value,
          };
        }
        if (dataIndex === "category_filter") {
          if (value === "" || value === null) {
            return {
              text: "Empty Category",
              value: "",
            };
          }
          let getLabel = constant.PPIC_CATEGORY_LIST.find((item) => item.value === value);
          return {
            text: getLabel?.label ?? value,
            value: getLabel?.label ?? value,
          };
        }
        return {
          text: value,
          value,
        };
      } else if (dataIndex !== "buyer_name") {
        return {
          text: value,
          value,
        };
      } else {
        return {
          text: suppliers.find((sup) => sup.label === value).label,
          value: suppliers.find((sup) => sup.label === value).label,
        };
      }
    });
  };

  const warehouseMapping = constant.WAREHOUSE_LIST.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});
  const categoryMapping = constant.PPIC_CATEGORY_LIST.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  const defaultColumns = [
    {
      title: (_v, record, index) => {
        if (
          editTableMode ||
          [
            constant.FLAG_STATUS_COMPLETE_SCHEDULE,
            constant.FLAG_STATUS_PPIC_REQUEST,
            constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC,
            constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT,
            constant.FLAG_STATUS_PROCUREMENT_REQUEST,
            constant.FLAG_STATUS_SUPPLIER,
            "deleted",
          ].includes(filterStatus)
        )
          return;
        if (
          // filteredInfo.po_number ||
          // filteredInfo.sku_code ||
          // filteredInfo.sku_name ||
          // filteredInfo.supplier_name ||
          // filteredInfo.buyer_name ||
          // filteredInfo.io_filter ||
          // filteredInfo.category_filter
          // ||
          sortedInfo.column
        )
          return;

        const isDataComplete = (record) => {
          const flagStatus = record?.flag_status;
          switch (filterStatus) {
            case constant.FLAG_STATUS_PPIC_INIT:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PPIC_REQUEST ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_RETUR
              );
            case constant.FLAG_STATUS_PROCUREMENT_RETUR:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PPIC_REQUEST ||
                flagStatus === constant.FLAG_STATUS_PPIC_INIT
              );
            case constant.FLAG_STATUS_PPIC_REQUEST:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PPIC_INIT ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_RETUR
              );
            default:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PPIC_REQUEST ||
                flagStatus === constant.FLAG_STATUS_SUPPLIER ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
                flagStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST
              );
          }
        };

        return (
          <>
            <Checkbox
              checked={previewRowChecked.every((item) => {
                return item;
              })}
              style={{ justifyContent: "center", display: "flex" }}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const updatedPreviewRowChecked = previewRowChecked.map((_, i) => {
                  return (
                    dataSource && isChecked && isDataComplete(dataSource[i]) && toggleCheckboxTitle
                  );
                });
                setPreviewRowChecked(updatedPreviewRowChecked);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setToggleCheckboxTitle(!toggleCheckboxTitle);
              }}
            />
          </>
        );
      },
      dataIndex: "check",
      key: "check",
      width: 25,
      render: (_v, record, index) => {
        const flagStatus = record?.flag_status;
        if (
          editTableMode ||
          [
            constant.FLAG_STATUS_COMPLETE_SCHEDULE,
            constant.FLAG_STATUS_PPIC_REQUEST,
            constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC,
            constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT,
            constant.FLAG_STATUS_PROCUREMENT_REQUEST,
            constant.FLAG_STATUS_SUPPLIER,
            "deleted",
          ].includes(filterStatus)
        )
          return;
        if (
          !filterStatus &&
          (flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
            flagStatus === constant.FLAG_STATUS_PPIC_REQUEST ||
            flagStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
            flagStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT ||
            flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
            flagStatus === constant.FLAG_STATUS_SUPPLIER)
        )
          return;
        const isDataComplete = (record) => {
          return (
            record.flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
            record.flag_status !== constant.FLAG_STATUS_PPIC_REQUEST ||
            record.flag_status !== constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
            record.flag_status !== constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT ||
            record.flag_status !== constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
            record.flag_status !== constant.FLAG_STATUS_SUPPLIER
          );
        };

        const initialChecked = isDataComplete(record);

        return (
          <>
            <Checkbox
              checked={previewRowChecked[index]}
              style={{ justifyContent: "center", display: "flex" }}
              onChange={() => {
                handleCheckboxChange(index, initialChecked);
              }}
              onClick={() => {}}
            />
          </>
        );
      },
    },
    {
      title: t("I/O Pabrik"),
      dataIndex: "io_filter",
      key: "io_filter",
      editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      filters: editTableMode ? false : filterColumnOpt("io_filter"),
      filteredValue: filteredInfo?.io_filter || null,
      onFilter: (value, record) => {
        const recordLabel = warehouseMapping[record?.io_filter];
        return value === ""
          ? !record?.io_filter
          : !recordLabel
          ? false
          : recordLabel.includes(value);
      },
      filterSearch: true,
      width: 100,
      render: renderPlainColFindLabel(constant.WAREHOUSE_LIST, "io_filter"),
    },
    {
      title: t("Category"),
      dataIndex: "category_filter",
      key: "category_filter",
      editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      filters: editTableMode ? false : filterColumnOpt("category_filter"),
      filteredValue: filteredInfo?.category_filter || null,
      onFilter: (value, record) => {
        const recordLabel = categoryMapping[record?.category_filter];
        return value === ""
          ? !record?.category_filter
          : !recordLabel
          ? false
          : recordLabel.includes(value);
      },
      filterSearch: true,
      width: 100,
      render: renderPlainColFindLabel(constant.PPIC_CATEGORY_LIST, "category_filter"),
    },

    {
      title: t("submissionDate"),
      dataIndex: "submission_date",
      key: "submission_date",
      editable: editTableMode,
      sorter: editTableMode
        ? false
        : (a, b) => {
            return moment(a.submission_date) - moment(b.submission_date);
          },
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      width: 100,
      ellipsis: {
        showTitle: false,
      },
      render: (_, row) => {
        return (
          <Tooltip
            placement="topLeft"
            title={moment(row.submission_date).format(constant.FORMAT_DISPLAY_DATE)}
          >
            {moment(row.submission_date).format(constant.FORMAT_DISPLAY_DATE)}
          </Tooltip>
        );
      },
    },
    {
      title: t("supplierName"),
      dataIndex: "supplier_name",
      key: "supplier_name",
      editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      filters: editTableMode ? false : filterColumnOpt("supplier_name"),
      filteredValue: filteredInfo?.supplier_name || null,
      onFilter: (value, record) => {
        return record?.supplier?.name.includes(value);
      },
      filterSearch: true,
      width: 250,
      // ellipsis: {
      //   showTitle: false,
      // },
      render: (_, row) => {
        if (editTableMode) {
          return row?.supplier?.name || <Tag color="red">Fill Supplier</Tag>;
        }
        return (
          <Tooltip
            placement="topLeft"
            title={
              row?.supplier?.name + " " + (row?.user_supplier?.email ? "" : "Email not registered")
            }
          >
            {row?.supplier?.name} <br />
            {row?.user_supplier?.email ? "" : <b>Email not registered</b>}
          </Tooltip>
        );
      },
    },
    {
      title: t("No PR/PO"),
      dataIndex: "po_number",
      key: "po_number",
      editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      filters: editTableMode ? false : filterColumnOpt("po_number"),
      filteredValue: filteredInfo.po_number || null,
      onFilter: (value, record) => {
        return value === "" ? record?.po_number === "" : record?.po_number.includes(value);
      },
      filterSearch: true,
      width: 110,
      render: (_, row) => {
        if (editTableMode) {
          return row?.po_number || <Tag color="red">Please Fill PO Number</Tag>;
        }
        return row?.po_number;
      },
    },
    {
      title: t("Qty PR/PO"),
      dataIndex: "po_qty",
      key: "po_qty",
      editable: editTableMode,
      sorter: editTableMode
        ? false
        : (a, b) => {
            return moment(a.po_qty) - moment(b.po_qty);
          },
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      width: 100,
      render: (_, row) => {
        return utils.thousandSeparator(row?.po_qty);
      },
    },
    {
      title: t("Outs PR/PO"),
      dataIndex: "po_outs",
      key: "po_outs",
      editable: editTableMode,
      sorter: editTableMode ? false : (a, b) => a.po_outs - b.po_outs,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      width: 100,
      render: (_, row) => {
        return utils.thousandSeparator(row?.po_outs);
      },
    },
    {
      title: t("SKUCode"),
      dataIndex: "sku_code",
      key: "sku_code",
      editable: editTableMode,
      filters: editTableMode ? false : filterColumnOpt("sku_code"),
      filteredValue: filteredInfo.sku_code || null,
      onFilter: (value, record) => record?.sku_code.includes(value),
      width: 150,
      filterSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render: (_, row) => {
        return (
          <Tooltip placement="topLeft" title={row?.sku_code}>
            {row?.sku_code}
          </Tooltip>
        );
      },
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
    },
    {
      title: t("SKUName"),
      dataIndex: "sku_name",
      key: "sku_name",
      editable: editTableMode,
      filters: editTableMode ? false : filterColumnOpt("sku_name"),
      filteredValue: filteredInfo.sku_name || null,
      onFilter: (value, record) => record?.sku_name.includes(value),

      filterSearch: true,
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (_, row) => {
        return (
          <Tooltip placement="topLeft" title={row?.sku_name}>
            {row?.sku_name}
          </Tooltip>
        );
      },
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
    },
    {
      title: t("qtyDelivery"),
      dataIndex: "qty_delivery",
      key: "qty_delivery",
      editable: editTableMode,
      sorter: editTableMode
        ? false
        : (a, b) => {
            return moment(a.qty_delivery) - moment(b.qty_delivery);
          },
      width: 100,
      render: (_, row) => {
        return utils.thousandSeparator(row?.qty_delivery);
      },
    },
    {
      title: t("estDelivery"),
      dataIndex: "est_delivery",
      key: "est_delivery",
      editable: editTableMode,
      sorter: editTableMode
        ? false
        : (a, b) => {
            return moment(a.est_delivery) - moment(b.est_delivery);
          },
      width: 100,
      render: (_, row) => {
        return moment(row?.est_delivery).format(constant.FORMAT_DISPLAY_DATE) ?? "-";
      },
    },
    {
      title: t("sendSupplierDate"),
      dataIndex: "send_supplier_date",
      key: "send_supplier_date",
      editable: editTableMode,
      sorter: editTableMode
        ? false
        : (a, b) => {
            return moment(a.send_supplier_date) - moment(b.send_supplier_date);
          },
      width: 100,
      render: (_, row) => {
        return row.send_supplier_date
          ? moment(row.send_supplier_date).format(constant.FORMAT_DISPLAY_DATE)
          : "-";
      },
    },
    {
      title: t("supplierConfirmDate"),
      dataIndex: "supplier_confirm_date",
      key: "supplier_confirm_date",
      editable: editTableMode,
      sorter: editTableMode
        ? false
        : (a, b) => {
            return moment(a.supplier_confirm_date) - moment(b.supplier_confirm_date);
          },
      width: 100,
      render: (_, row) => {
        return row.supplier_confirm_date
          ? moment(row.supplier_confirm_date).format(constant.FORMAT_DISPLAY_DATE)
          : "-";
      },
    },
    {
      title: t("supplierQty"),
      dataIndex: "submitted_qty",
      key: "submitted_qty",
      sorter: editTableMode
        ? false
        : (a, b) => {
            return moment(a.submitted_qty) - moment(b.submitted_qty);
          },
      width: 100,
      render: (_, row) => {
        return utils.thousandSeparator(row?.submitted_qty);
      },
    },
    {
      title: t("supplierDate"),
      dataIndex: "est_submitted_date",
      key: "est_submitted_date",
      sorter: editTableMode
        ? false
        : (a, b) => {
            return moment(a.est_submitted_date) - moment(b.est_submitted_date);
          },
      width: 100,
      render: (_, row) => {
        return row?.est_submitted_date
          ? moment(row?.est_submitted_date).format(constant.FORMAT_DISPLAY_DATE)
          : "-";
      },
    },
    {
      title: t("buyerName"),
      dataIndex: "buyer_name",
      key: "buyer_name",
      editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      filters: editTableMode ? false : filterColumnOpt("buyer_name"),
      filteredValue: filteredInfo?.buyer_name || null,
      onFilter: (value, record) => {
        return record?.buyer?.name.includes(value);
      },
      filterSearch: true,
      width: "10vw",
      render: (_, row) => {
        return row?.buyer?.name;
      },
    },
    {
      title: t("action"),
      dataIndex: "action",
      fixed: "right",
      key: "action",
      width: 150,
      onCell: (_, index) => {
        if (
          filterStatus === constant.FLAG_STATUS_PPIC_INIT ||
          filterStatus === constant.FLAG_STATUS_PROCUREMENT_RETUR ||
          filterStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
          (!filterStatus &&
            dataSource[index]?.flag_status !== constant.FLAG_STATUS_PPIC_REQUEST &&
            dataSource[index]?.flag_status !== constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC &&
            dataSource[index]?.flag_status !== constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT &&
            dataSource[index]?.flag_status !== constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
            dataSource[index]?.flag_status !== constant.FLAG_STATUS_SUPPLIER)
        )
          return;
        return { ...getCellConfig(arrayOfMerge, index) };
      },
      render: (_, row) => {
        // let btnEdit;
        let btnSplit;
        let btnDelete;
        let tagStatus;
        let tagHutangKirim;
        let btnAcceptSplit;
        let btnRejectSplit;
        let btnAcceptEdit;
        let btnRejectEdit;
        let btnAcceptClosePO;
        let btnRejectClosePO;
        const renderConfirmationModal = (api, text) => {
          Modal.confirm({
            ...constant.MODAL_CONFIRM_DEFAULT_PROPS,
            content: text,
            onOk: () => {
              setPageLoading(true);
              api(row.id)
                .then((res) => {
                  message.success("Success");
                })
                .catch((err) => {
                  utils.swal.Error({ msg: utils.getErrMsg(err) });
                })
                .finally(() => {
                  setPageLoading(false);
                  loadOffers();
                  const otherParams = {
                    from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
                    to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
                    supplier_id: filterValue?.supplier_id ?? null,
                    user_id: filterValue?.user_id ?? null,
                    io_filter: filterValue?.io_filter ?? null,
                    category_filter: filterValue?.category_filter ?? null,
                    status: filterStatus,
                    search_PO: filterValue?.search_PO,
                  };
                  fetchSummary(otherParams);
                });
            },
          });
        };

        const renderTag = (color, text) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Tag color={color} style={{ whiteSpace: "normal", textAlign: "center" }}>
              {text}
            </Tag>
          </div>
        );
        const renderStatusTag = (tagType, tagText) => {
          const tagHutangKirim = row.hutang_kirim ? renderTag("error", "Hutang Kirim") : null;
          const tagStatus = renderTag(tagType, tagText);

          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {tagHutangKirim}
              {tagStatus}
            </div>
          );
        };
        if (row.deleted_at !== null) return renderStatusTag("error", "Deleted");
        if (
          row.flag_status === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
          row.flag_status === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
        ) {
          return renderStatusTag("error", "at Procurement");
        }
        if (row.flag_status === constant.FLAG_STATUS_SUPPLIER) {
          return renderStatusTag("error", `at Supplier ${row?.supplier?.name}`);
        }
        if (
          row.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          row.split_from_id !== null
        ) {
          return renderStatusTag("warning", "Split Request (Supplier to Procurement)");
        }
        if (
          row.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          row.edit_from_id !== null
        ) {
          return renderStatusTag("warning", "Edit Request (Supplier to Procurement)");
        }
        if (row.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE) {
          return renderStatusTag("success", "Completed");
        }

        if (editTableMode) return;

        if (
          row.flag_status === constant.FLAG_STATUS_PPIC_INIT ||
          row.flag_status === constant.FLAG_STATUS_PROCUREMENT_RETUR
        ) {
          tagHutangKirim = row.hutang_kirim ? renderTag("error", "Hutang Kirim") : null;

          btnSplit = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="primary"
              onClick={() => {
                setModalSplitScheduleData(row);
                setModalSplitScheduleShow(true);
              }}
            >
              {t("Split")}
            </Button>
          );

          btnDelete = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="danger"
              onClick={() => {
                Modal.confirm({
                  ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                  content: `Are you sure to delete this data?`,
                  onOk: () => {
                    api.ppic
                      .delete(row.id)
                      .then((res) => {
                        message.success("Delete Success");
                        const updatedData = dataSource.filter((item) => item.id !== row.id);
                        setDeletedRows([...deletedRows, row]);
                        setTimeout(() => {
                          setDataSource(updatedData);
                        }, 500);
                      })
                      .catch((error) => {
                        utils.swal.Error({ msg: utils.getErrMsg(error) });
                      })
                      .finally(() => {
                        loadOffers();
                        const otherParams = {
                          from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
                          to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
                          supplier_id: filterValue?.supplier_id ?? null,
                          user_id: filterValue?.user_id ?? null,
                          io_filter: filterValue?.io_filter ?? null,
                          category_filter: filterValue?.category_filter ?? null,
                          status: filterStatus,
                          search_PO: filterValue?.search_PO,
                        };

                        fetchSummary(otherParams);
                      });
                  },
                });
              }}
            >
              {t("Delete")}
            </Button>
          );
        }
        if (row.flag_status === constant.FLAG_STATUS_PPIC_REQUEST) {
          if (row.split_from_id !== null) {
            tagHutangKirim = row.hutang_kirim ? renderTag("error", "Hutang Kirim") : null;
            tagStatus = renderStatusTag("warning", "Split Request");
            btnAcceptSplit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="primary"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.ppic.acceptSplit,
                    `Are you sure to accept this split request and mark this schedule as complete?`,
                  )
                }
              >
                {`Accept Split Request`}
              </Button>
            );
            btnRejectSplit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="danger"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.ppic.rejectSplit,
                    `Are you sure to reject this split request?`,
                  )
                }
              >
                {`Reject Split Request`}
              </Button>
            );
          } else if (row.edit_from_id !== null) {
            tagHutangKirim = row.hutang_kirim ? renderTag("error", "Hutang Kirim") : null;
            tagStatus = <Tag color="warning">Edit Request</Tag>;
            btnAcceptEdit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="primary"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.ppic.acceptEdit,
                    `Are you sure to accept this edit request and mark this schedule as complete?`,
                  )
                }
              >
                {`Accept Edit Request`}
              </Button>
            );
            btnRejectEdit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="danger"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.ppic.rejectEdit,
                    `Are you sure to reject this edit request?`,
                  )
                }
              >
                Reject Edit Request
              </Button>
            );
          } else if (row.hutang_kirim) {
            tagStatus = <Tag color="warning">Close PO Request</Tag>;
            tagHutangKirim = row.hutang_kirim ? renderTag("error", "Hutang Kirim") : null;
            btnAcceptClosePO = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="primary"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.ppic.acceptClosePO,
                    `Are you sure to accept this close PO request and marked it as confirmed Schedule?`,
                  )
                }
              >
                {`Accept Close PO Request`}
              </Button>
            );
            btnRejectClosePO = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="danger"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.ppic.rejectClosePO,
                    `Are you sure to reject this close PO request and send back to?`,
                  )
                }
              >
                Reject Close PO Request
              </Button>
            );
          }
          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {tagHutangKirim}
              {tagStatus}
              {utils.renderWithPermission(userInfo.permissions, btnAcceptSplit, "ppic@edit")}
              {utils.renderWithPermission(userInfo.permissions, btnRejectSplit, "ppic@edit")}
              {utils.renderWithPermission(userInfo.permissions, btnAcceptEdit, "ppic@edit")}
              {utils.renderWithPermission(userInfo.permissions, btnRejectEdit, "ppic@edit")}
              {utils.renderWithPermission(userInfo.permissions, btnAcceptClosePO, "ppic@edit")}
              {utils.renderWithPermission(userInfo.permissions, btnRejectClosePO, "ppic@edit")}
            </div>
          );
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {tagHutangKirim}

            {utils.renderWithPermission(userInfo.permissions, btnSplit, "ppic@edit")}
            {/* {btnEdit} */}
            {utils.renderWithPermission(userInfo.permissions, btnDelete, "ppic@edit")}
          </div>
        );
      },
    },
  ];
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        handleCancel,
      }),
    };
  });

  const onSearch = (values) => {
    if (!values) {
      return;
    }

    let newFilterValue = {};
    if (values.supplier_list) {
      newFilterValue.supplier_id = values.supplier_list;
    }
    if (values.user_filter?.length > 4) {
      newFilterValue.user_id = Decrypt(userInfo.user_id);
    } else {
      newFilterValue.user_id = values.user_filter;
    }
    if (values.io_filter) {
      newFilterValue.io_filter = values.io_filter;
    }
    if (values.category_filter) {
      newFilterValue.category_filter = values.category_filter;
    }
    if (values.search_PO) {
      newFilterValue.search_PO = values.search_PO;
    }
    setFilterValue(newFilterValue);
    setFilteredInfo({});

    fetchData({
      ...newFilterValue,
      status: filterStatus ?? null,
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
    });
    fetchSummary({
      ...newFilterValue,
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
    });
  };

  const renderTable = () => {
    let scrollX = "100vw";
    if (isMobile) scrollX = 1300;
    return (
      <>
        {offers && offers.length > 0 ? (
          <>
            <Space style={{ marginBottom: "1rem" }}>
              {(!filterStatus ||
                filterStatus === constant.FLAG_STATUS_PPIC_INIT ||
                filterStatus === constant.FLAG_STATUS_PROCUREMENT_RETUR) &&
                !editTableMode && (
                  <>
                    {utils.renderWithPermission(
                      userInfo.permissions,
                      <>
                        <Button
                          type="primary"
                          onClick={() => {
                            if (previewRowChecked.filter((item) => item).length === 0) {
                              Modal.error({
                                content: "Please select at least one data",
                              });
                            } else {
                              Modal.confirm({
                                ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                                content: `There are ${
                                  previewRowChecked.filter((item) => item).length
                                } out of ${previewRowChecked.length} data to be sent.}`,
                                onOk: () => {
                                  setPageLoading(true);
                                  const data = offers.filter(
                                    (offer, index) => previewRowChecked[index],
                                  );
                                  api.ppic
                                    .sendToPurchasing(data)
                                    .then((res) => {
                                      message.success("Success");
                                    })
                                    .catch((err) => {
                                      utils.swal.Error({ msg: utils.getErrMsg(err) });
                                    })
                                    .finally(() => {
                                      setPageLoading(false);
                                      loadOffers();
                                      const otherParams = {
                                        from_date: moment(dateRange[0]).format(
                                          constant.FORMAT_API_DATE,
                                        ),
                                        to_date: moment(dateRange[1]).format(
                                          constant.FORMAT_API_DATE,
                                        ),
                                        supplier_id: filterValue?.supplier_id ?? null,
                                        user_id: filterValue?.user_id ?? null,
                                        io_filter: filterValue?.io_filter ?? null,
                                        category_filter: filterValue?.category_filter ?? null,
                                        status: filterStatus,
                                        search_PO: filterValue?.search_PO,
                                      };

                                      fetchSummary(otherParams);
                                    });
                                },
                              });
                            }
                          }}
                          disabled={previewRowChecked.filter((item) => item === true).length === 0}
                        >
                          Send Schedule to Procurement
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => {
                            setDataSource(oldDataSource.sort((a, b) => a.key - b.key));
                            setSortedInfo({});
                            setPreviewRowChecked(dataSource.map(() => false));
                            setEditTableMode(!editTableMode);
                          }}
                        >
                          Change to Edit Mode
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => {
                            Modal.confirm({
                              ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                              content: `Refresh Outstanding PO from ${moment(dateRange[0]).format(
                                constant.FORMAT_DISPLAY_DATE,
                              )} to ${moment(dateRange[1]).format(constant.FORMAT_DISPLAY_DATE)}?`,
                              onOk: () => {
                                setPageLoading(true);
                                const params = {
                                  from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
                                  to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
                                };
                                api.ppic
                                  .refreshPOOuts(params)
                                  .then((res) => {
                                    message.success("Success");
                                  })
                                  .catch((err) => {
                                    utils.swal.Error({ msg: utils.getErrMsg(err) });
                                  })
                                  .finally(() => {
                                    setPageLoading(false);
                                    loadOffers();
                                    const otherParams = {
                                      from_date: moment(dateRange[0]).format(
                                        constant.FORMAT_API_DATE,
                                      ),
                                      to_date: moment(dateRange[1]).format(
                                        constant.FORMAT_API_DATE,
                                      ),
                                      supplier_id: filterValue?.supplier_id ?? null,
                                      user_id: filterValue?.user_id ?? null,
                                      io_filter: filterValue?.io_filter ?? null,
                                      category_filter: filterValue?.category_filter ?? null,
                                      status: filterStatus,
                                      search_PO: filterValue?.search_PO,
                                    };

                                    fetchSummary(otherParams);
                                  });
                              },
                            });
                          }}
                        >
                          Refresh Outstanding PO
                        </Button>
                      </>,
                      "ppic@edit",
                    )}
                  </>
                )}

              {editTableMode && (
                <>
                  <Button
                    type="primary"
                    onClick={() => {
                      setPageLoading(true);
                      setDataSource(dataSource);
                      setOldDataSource(dataSource);
                      setArrayOfMerge(
                        dataSource.map((currRow, index) => {
                          const nextRow = dataSource[index + 1];
                          const shouldMerge =
                            nextRow &&
                            currRow.supplier_id === nextRow.supplier_id &&
                            currRow.po_number === nextRow.po_number &&
                            currRow.sku_code === nextRow.sku_code &&
                            currRow.po_qty === nextRow.po_qty &&
                            currRow.flag_status === nextRow.flag_status &&
                            currRow.split_from_id === nextRow.split_from_id;
                          return shouldMerge;
                        }),
                      );
                      setEditTableMode(!editTableMode);
                      api.ppic
                        .edit(editedData)
                        .then((res) => {
                          message.success("Success");
                        })
                        .catch((err) => {
                          utils.swal.Error({ msg: utils.getErrMsg(err) });
                        })
                        .finally(() => {
                          setPageLoading(false);
                        });
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="danger"
                    onClick={() => {
                      setEditedData([]);
                      setDataSource(oldDataSource);
                      setEditTableMode(!editTableMode);
                      setCancelClicked(true);
                    }}
                  >
                    Cancel Edit
                  </Button>
                </>
              )}
            </Space>
            {editTableMode && (
              <Table
                {...tableProps}
                dataSource={dataSource}
                components={components}
                rowKey="id"
                rowClassName={rowClassName}
                columns={columns}
                pagination={{
                  ...configs.TABLE_PAGINATION_SINGLEPAGE,
                  total: totalData,
                  pageSize: pageSize,
                }}
                scroll={{ x: scrollX, y: "60vh" }}
                sticky={true}
                size="small"
                onChange={handleChange}
              />
            )}
            {!editTableMode && (
              <Table
                {...tableProps}
                dataSource={dataSource}
                components={components}
                rowKey="id"
                rowClassName={rowClassName}
                columns={columns}
                pagination={{
                  ...configs.TABLE_PAGINATION_SINGLEPAGE,
                  total: totalData,
                  pageSize: pageSize,
                }}
                scroll={{ x: scrollX, y: "60vh" }}
                sticky={true}
                size="small"
                onChange={handleChange}
              />
            )}
          </>
        ) : (
          <TableNotFoundNotice />
        )}
      </>
    );
  };

  const onTabChanged = (key) => {
    if (key === "all") {
      setFilterStatus(null);
      setToggleCheckboxTitle(true);
    } else {
      setFilterStatus(key);
      setToggleCheckboxTitle(true);
    }
    setPageNumber(1);
  };

  const tabPanes = [];
  if (userInfo.role.id !== 6) {
    tabPanes.push(
      <Tabs.TabPane
        tab={
          <>
            <span className="mr-1">{t("all")}</span>
            {offerSummaryTotal ? <Badge count={offerSummaryTotal} /> : null}
          </>
        }
        key="all"
      >
        {filterStatus === null && renderTable()}
      </Tabs.TabPane>,
    );
    for (const status in statusMapping) {
      tabPanes.push(
        <Tabs.TabPane
          tab={
            <>
              <span className="mr-1">{utils.snakeToTitleCase(statusMapping[status])}</span>
              {offerSummary && offerSummary[status] && <Badge count={offerSummary[status]} />}
            </>
          }
          key={status}
          children={<>{filterStatus && filterStatus === status && <>{renderTable()}</>}</>}
        />,
      );
    }
    tabPanes.push(
      <Tabs.TabPane
        tab={
          <>
            {t("Deleted")}
            {offerSummary && offerSummary["deleted"] && <Badge count={offerSummary["deleted"]} />}
          </>
        }
        key="deleted"
      >
        {renderTable()}
      </Tabs.TabPane>,
    );
  } else {
    for (const statusQAQC in statusQAQCMapping) {
      tabPanes.push(
        <Tabs.TabPane
          tab={
            <>
              <span className="mr-1">{utils.snakeToTitleCase(statusQAQCMapping[statusQAQC])}</span>
              {offerSummary && offerSummary[statusQAQC] && (
                <Badge count={offerSummary[statusQAQC]} />
              )}
            </>
          }
          key={statusQAQC}
          children={<>{filterStatus && filterStatus === statusQAQC && <>{renderTable()}</>}</>}
        />,
      );
    }
  }

  if (!minDateLoaded) return null;

  return (
    <PageContainer
      title={`${t("PPIC")} ${t("schedule")}`}
      additionalAction={
        <>
          {utils.renderWithPermission(
            userInfo.permissions,
            <Space>
              <Button
                size="small"
                onClick={() => {
                  setModalCreateShow(true);
                }}
              >
                {`${t("add")} ${t("new")} ${t("schedule")}`}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setModalImportCSVShow(true);
                }}
              >
                {t("importFromCSV")}
              </Button>
            </Space>,
            "ppic@create",
          )}
        </>
      }
      btnAction={utils.renderWithPermission(
        userInfo.permissions,
        <Button
          size="small"
          onClick={() => {
            setModalExportShow(true);
          }}
        >
          {t("exportXLSX")}
        </Button>,
        "ppic@view",
      )}
      breadcrumbs={[
        {
          text: t("PPIC"),
          link: "/ppic/dashboard",
        },
      ]}
    >
      <ModalImportCSV
        visible={modalImportCSVShow}
        onCancel={() => setModalImportCSVShow(false)}
        setPageLoading={setPageLoading}
        onSuccess={() => {
          setModalImportCSVShow(false);
          message.success(
            `${t("new")} ${t("schedule")} ${t("toastSuffixSuccess")} ${t("toastImported")}`,
          );
          loadOffers();
          const otherParams = {
            from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
            to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
            supplier_id: filterValue?.supplier_id ?? null,
            user_id: filterValue?.user_id ?? null,
            io_filter: filterValue?.io_filter ?? null,
            category_filter: filterValue?.category_filter ?? null,
            status: filterStatus,
            search_PO: filterValue?.search_PO,
          };
          loadMinDate();
          fetchSummary(otherParams);
        }}
      />
      <ModalExport
        visible={modalExportShow}
        onCancel={() => setModalExportShow(false)}
        data={dataSource}
        exportType={"ppic"}
      />
      <ModalSplitSchedule
        visible={modalSplitScheduleShow}
        onCancel={() => {
          setModalSplitScheduleShow(false);
        }}
        onSuccess={() => {
          setModalSplitScheduleShow(false);
          message.success("Offer Splitted Successfully");
          loadOffers();
          const otherParams = {
            from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
            to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
            supplier_id: filterValue?.supplier_id ?? null,
            user_id: filterValue?.user_id ?? null,
            io_filter: filterValue?.io_filter ?? null,
            category_filter: filterValue?.category_filter ?? null,
            status: filterStatus,
            search_PO: filterValue?.search_PO,
          };

          fetchSummary(otherParams);
        }}
        data={modalSplitScheduleData}
      />
      <ModalCreate
        visible={modalCreateShow}
        onCancel={() => {
          setModalCreateShow(false);
        }}
        onSuccess={() => {
          setModalCreateShow(false);
          message.success("Success Create Data");
          loadOffers();
          const otherParams = {
            from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
            to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
            supplier_id: filterValue?.supplier_id ?? null,
            user_id: filterValue?.user_id ?? null,
            io_filter: filterValue?.io_filter ?? null,
            category_filter: filterValue?.category_filter ?? null,
            status: filterStatus,
            search_PO: filterValue?.search_PO,
          };

          fetchSummary(otherParams);
        }}
      />
      <ModalEdit
        visible={modalEditShow}
        onCancel={() => {
          setModalEditShow(false);
        }}
        onSuccess={() => {
          setModalEditShow(false);
          message.success("Success Edit Data");
          loadOffers();
          const otherParams = {
            from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
            to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
            supplier_id: filterValue?.supplier_id ?? null,
            user_id: filterValue?.user_id ?? null,
            io_filter: filterValue?.io_filter ?? null,
            category_filter: filterValue?.category_filter ?? null,
            status: filterStatus,
            search_PO: filterValue?.search_PO,
          };

          fetchSummary(otherParams);
        }}
        id={modalEditData}
      />

      <SyncOverlay loading={pageLoading} />
      <Row gutter={16}>
        {userInfo.role.id === 1 && (
          <Col xs={24} lg={24} xl={24}>
            <Card size="small">
              <SectionHeading title={"Filter"} withDivider />
              <Form form={form} layout="vertical" className="form-filter" onFinish={onSearch}>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      label="Date Range"
                      className="mb-2"
                      name="date"
                      wrapperCol={{ flex: "auto" }}
                    >
                      <DatePicker.RangePicker
                        defaultValue={dateRange}
                        value={dateRange}
                        style={{ width: "100%" }}
                        {...utils.FORM_RANGEPICKER_PROPS}
                        onChange={(dates, dateStrings) => {
                          setDateRange(dates);
                          const otherParams = {
                            from_date: moment(dates[0]).format(constant.FORMAT_API_DATE),
                            to_date: moment(dates[1]).format(constant.FORMAT_API_DATE),
                            supplier_id: filterValue?.supplier_id ?? null,
                            user_id: filterValue?.user_id ?? null,
                            io_filter: filterValue?.io_filter ?? null,
                            category_filter: filterValue?.category_filter ?? null,
                            status: filterStatus,
                            search_PO: filterValue?.search_PO,
                          };

                          fetchSummary(otherParams);
                        }}
                        allowClear={false}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="User" name="user_filter" className="mb-2">
                      <Select
                        showSearch
                        placeholder="Select User"
                        optionFilterProp="children"
                        // onChange={onChangeUserList}
                        style={{ width: "100%" }}
                        filterOption={filterOption}
                        options={PPICs}
                        defaultValue={userInfo.user_name}
                      />
                    </Form.Item>
                  </Col>
                  {/* <Col span={12}>
                  <Form.Item label="Search by PO Number" className="mb-1" name="search_PO">
                    <Input placeholder={t("searchPO")} />
                  </Form.Item>
                </Col> */}
                </Row>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item label="I/O Pabrik" name="io_filter" className="mb-2">
                      <Select
                        showSearch
                        placeholder="Select I/O"
                        optionFilterProp="children"
                        // onChange={onChangeSupplierList}
                        style={{ width: "100%" }}
                        filterOption={filterOption}
                        options={constant.WAREHOUSE_LIST}
                        defaultValue={null}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Category" name="category_filter" className="mb-2">
                      <Select
                        showSearch
                        placeholder="Select Category"
                        optionFilterProp="children"
                        // onChange={onChangeSupplierList}
                        style={{ width: "100%" }}
                        filterOption={filterOption}
                        options={constant.PPIC_CATEGORY_LIST}
                        defaultValue={null}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item className="mb-2">
                  <Button type="primary" htmlType="submit">
                    {t("applyFilter")}
                  </Button>{" "}
                  <Button type="" onClick={onResetFilter}>
                    Reset Filter
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        )}

        <Col xs={24} lg={24} xl={24}>
          <Tabs defaultActiveKey={defaultActiveTab} onChange={onTabChanged}>
            {tabPanes}
          </Tabs>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default withRouter(PPICView);

// ppictest
// proctest1
// proctest2
// proctest3
// proctest4
// proctest5
// procadmin
// qaqctest
