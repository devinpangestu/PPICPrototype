import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { useSearchFilterStore } from "state/purchasing/searchFilterState";
import { useDataStore } from "state/purchasing/dataState";
import { TableNotFoundNotice, SyncOverlay, SectionHeading } from "components";
import {
  Row,
  Col,
  Form,
  Button,
  Tabs,
  Input,
  DatePicker,
  Tag,
  message,
  Pagination,
  Badge,
  Modal,
  Select,
  Checkbox,
  Space,
  Table,
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
import ModalReturSchedule from "./modal/ModalReturSchedule";
import {
  authorizationCheck,
  isAccessTokenValid,
  isMobile,
  isSessionTabValid,
  passwordChangedCheck,
} from "utils/auth";
import { Decrypt } from "utils/encryption";
import { renderPlainColFindLabel } from "utils/table";
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
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    if (
      record.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
      record.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST
    ) {
      setEditing(false);
      Modal.error({
        content: "This data is already completed or in negotiation process",
      });
      return;
    }
    setEditing(!editing);
    const fieldValue = record[dataIndex];
    const isDateType = moment(fieldValue, "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid();
    if (!editing) {
      // If entering edit mode, store the original date
      if (isDateType) {
        setOriginalDate(fieldValue);
        form.setFieldsValue({ [dataIndex]: moment(fieldValue) });
      } else {
        form.setFieldsValue({ [dataIndex]: fieldValue });
      }
    } else {
      // If canceling edit mode, revert to the original date

      if (isDateType) {
        setCurrentDate(originalDate);
        form.setFieldsValue({ [dataIndex]: originalDate });
      } else {
        form.setFieldsValue({ [dataIndex]: fieldValue });
      }
    }
  };
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };
  const save = async () => {
    try {
      const values = await form.validateFields();

      if (values[dataIndex] === null) {
      } else {
        toggleEdit();
        handleSave({
          ...record,
          ...values,
        });
      }
    } catch (errInfo) {
      console.log("Save failed:", errInfo, "restore the data");
    }
  };

  let childNode = children;
  if (editable) {
    const fieldValue = record[dataIndex];
    // Check if fieldValue is a valid Date
    const isDateType = moment(fieldValue, "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid();

    childNode = editing ? (
      isDateType ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          initialValue={currentDate}
          name={dataIndex}
        >
          <DatePicker
            allowClear={false}
            inputReadOnly={true}
            {...utils.FORM_DATEPICKER_PROPS}
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            onChange={handleDateChange}
          />
        </Form.Item>
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

const PurchasingView = (props) => {
  const statusMapping = {
    B: "Schedule from PPIC",
    D: "Revised from PPIC",
    E: "At Supplier",
    F: "Negotiation from Supplier",
    X: "Completed",
  };

  const userInfo = utils.getUserInfo();
  const [pageLoading, setPageLoading] = useState(false);

  const [t] = useTranslation();
  const [form] = Form.useForm();

  const pageSize = configs.pageSize.offer;

  let defaultFilterStatus = null;
  let defaultActiveTab = "all";

  const [expandable, setExpandable] = useState({
    expandedRowRender: (record) => {
      if (
        record.flag_status === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
        record.flag_status === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
      ) {
        return (
          <p style={{ margin: 0, fontSize: "1rem" }}>
            {`${moment(JSON.parse(record.notes)?.init?.created_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )} `}
            <strong>{`${JSON.parse(record.notes)?.init?.created_by} : ${
              JSON.parse(record.notes)?.init?.notes
            }`}</strong>
          </p>
        );
      } else if (record.edit_from_id !== null) {
        return (
          <p style={{ margin: 0 }}>
            {`${moment(JSON.parse(record.notes)?.created_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )}`}{" "}
            <strong>{`${JSON.parse(record.notes)?.edit_req?.created_by} : ${
              JSON.parse(record.notes)?.edit_req?.notes
            }`}</strong>
          </p>
        );
      } else if (record.split_from_id !== null) {
        return (
          <p style={{ margin: 0 }}>
            {`${moment(JSON.parse(record.notes)?.created_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )}`}
            <strong>
              {`${JSON.parse(record.notes)?.created_by} : ${
                JSON.parse(record.notes)?.split_req?.notes
              }`}
            </strong>
          </p>
        );
      }
    },
    rowExpandable: (record) => {
      const checkFlagStatus = (record) =>
        (record.flag_status === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT ||
          record.flag_status === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
          record.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST) &&
        (JSON.parse(record.notes)?.init?.notes ||
          JSON.parse(record.notes)?.retur?.notes ||
          JSON.parse(record.notes)?.edit_req?.notes ||
          JSON.parse(record.notes)?.split_req?.notes);
      return checkFlagStatus(record);
    },
  });

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
    modalReturScheduleShow,
    setModalReturScheduleShow,
    modalReturScheduleData,
    setModalReturScheduleData,
    modalEditShow,
    setModalEditShow,
    modalEditData,
    setModalEditData,
    suppliersSearch,
    setSuppliersSearch,
    usersSearch,
    setUsersSearch,
    filterValue,
    setFilterValue,
    editTableMode,
    setEditTableMode,
    search,
    setSearch,
    minDateLoaded,
    setMinDateLoaded,
    // arrayOfMerge,
    // setArrayOfMerge,
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

  const [arrayOfMerge, setArrayOfMerge] = useState([]);

  const {
    dateRange,
    setDateRange,
    suppliers,
    setSuppliers,
    purchasing,
    setPurchasing,
    filterStatus,
    setFilterStatus,
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

  // const [previewRowChecked, setPreviewRowChecked] = useState([]);
  const rowClassName = (record, index) => {
    const flagStatus = record?.flag_status;
    const statusEdited = record?.status_edited;

    if (editTableMode && statusEdited) {
      return "background-color warning-2";
    }
    if (
      (flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
        (flagStatus !== constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC &&
          flagStatus !== constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT)) &&
      editTableMode
    ) {
      return "background-color error";
    }
    if (flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE) {
      return "background-color primary-3";
    }
    if (
      flagStatus !== constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC &&
      flagStatus !== constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
    ) {
      return "background-color warning-2";
    }
    return "editable-row";
  };

  const fetchData = async (params) => {
    setPageLoading(true);
    try {
      const responseList = await api.purchasing.list(search, 1000, 1, params);
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
      const responseSummary = await api.purchasing.summary(params);
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
    setToggleCheckboxTitle(false);
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
    await handler.getPurchasing(setPageLoading, setPurchasing);
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleCheckboxChange = (index, initialChecked, status) => {
    const updatedPreviewRowChecked = previewRowChecked.map((isChecked, i) => {
      return i === index ? !isChecked : isChecked;
    });
    if (!initialChecked) {
      if (
        status === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
        status === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
      ) {
        Modal.error({
          content: "Please fill the empty column first",
        });
      }

      if (status === constant.FLAG_STATUS_COMPLETE_SCHEDULE) {
        Modal.error({
          content: "This data is already completed",
        });
      }
      if (status === constant.FLAG_STATUS_PPIC_REQUEST) {
        Modal.error({
          content: "This data is in negotiation process",
        });
      }
      updatedPreviewRowChecked[index] = false;
    }
    setPreviewRowChecked(updatedPreviewRowChecked);
  };

  const onResetFilter = async () => {
    setPageLoading(true);
    setFilterValue({
      supplier_id: null,
      user_id: Decrypt(userInfo.user_id),
      io_filter: null,
      category_filter: null,
      search_PO: null,
    });
    form.setFieldsValue({
      user_filter: userInfo.user_name,
      supplier_list: null,
      io_filter: null,
      category_filter: null,
      search_PO: null,
    });
    const otherParams = {
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
      supplier_id: null,
      user_id: Decrypt(userInfo.user_id),
      io_filter: null,
      category_filter: null,
      search_PO: null,
      status: filterStatus ?? null,
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
    // return () => {
    //   setFilterStatus(null);
    //   setOffers([]);
    //   setDataSource([]);
    // };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isMounted = true;

    if (
      isMounted &&
      minDateLoaded &&
      filterStatus !== "B" &&
      filterStatus !== "D" &&
      filterStatus !== "F" &&
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
  }, [pageNumber, minDateLoaded, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps
  // useEffect(() => {
  //   loadOffers();
  //   fetchSummary(filterValue);
  // }, [filterStatus]);
  const loadMinDate = async () => {
    await api.purchasing
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
      if (filterStatus) otherParams.status = filterStatus;
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
    } else {
      // count the next true value and break the loop after false,
      // and if the true is counted, ignore them
      let count = 0;
      if (arrayOfMerge[index - 1] === true) {
        return { rowSpan: 0 };
      }
      for (let i = index; i < arrayOfMerge.length; i++) {
        if (arrayOfMerge[i] === true) {
          count++;
        } else {
          break;
        }
      }
      return { rowSpan: count + 1 };
    }
  };
  const areObjectsEqualPartial = (obj1, obj2, keysToCompare) => {
    for (const key of keysToCompare) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  };
  const handleSave = (row) => {
    const keyToCompare = ["po_number"];
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
          } else if (dataIndex === "sku_name") {
            return item?.sku_name;
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
        } else {
          return {
            text: value,
            value,
          };
        }
      } else if (dataIndex !== "buyer_name") {
        return {
          text: value,
          value,
        };
      } else if (dataIndex !== "sku_name") {
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
      title: (_, record, index) => {
        if (
          editTableMode ||
          [
            constant.FLAG_STATUS_COMPLETE_SCHEDULE,
            constant.FLAG_STATUS_PPIC_REQUEST,
            constant.FLAG_STATUS_PPIC_INIT,
            constant.FLAG_STATUS_PROCUREMENT_RETUR,
            constant.FLAG_STATUS_PROCUREMENT_REQUEST,
            constant.FLAG_STATUS_SUPPLIER,
            "deleted",
          ].includes(filterStatus)
        )
          if (
            // filteredInfo.po_number ||
            // filteredInfo.sku_code ||
            // filteredInfo.sku_name ||
            // filteredInfo.supplier_name ||
            // filteredInfo.io_filter ||
            // filteredInfo.category_filter ||
            sortedInfo.column ||
            filterStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
            filterStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
            filterStatus === constant.FLAG_STATUS_SUPPLIER
          ) {
            return;
          }
        const isDataComplete = (record) => {
          const flagStatus = record?.flag_status;
          switch (filterStatus) {
            case constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC:
              return !(
                (
                  flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                  flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
                  flagStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
                )
                // ||
                // utils.isNull(poNumber) ||
                // utils.isNull(ioFilter) ||
                // utils.isNull(categoryFilter) ||
                // utils.isNull(supplierName)
              );
            case constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT:
              return !(
                (
                  flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                  flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
                  flagStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC
                )
                // ||
                // utils.isNull(poNumber) ||
                // utils.isNull(ioFilter) ||
                // utils.isNull(categoryFilter) ||
                // utils.isNull(supplierName)
              );
            case constant.FLAG_STATUS_PROCUREMENT_REQUEST:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
                flagStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
              );
            default:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PPIC_INIT ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_RETUR ||
                flagStatus === constant.FLAG_STATUS_PPIC_REQUEST ||
                flagStatus === constant.FLAG_STATUS_SUPPLIER
              );
          }
        };

        return (
          <>
            <Checkbox
              checked={previewRowChecked.every((item) => item)}
              style={{ justifyContent: "center", display: "flex" }}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const updatedPreviewRowChecked = previewRowChecked.map(
                  (_, i) =>
                    dataSource && isChecked && isDataComplete(dataSource[i]) && toggleCheckboxTitle,
                );
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
            // constant.FLAG_STATUS_B,
            // constant.FLAG_STATUS_D,
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
            flagStatus === constant.FLAG_STATUS_PROCUREMENT_RETUR ||
            flagStatus === constant.FLAG_STATUS_PPIC_INIT ||
            flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
            flagStatus === constant.FLAG_STATUS_SUPPLIER)
        )
          return;

        const isDataComplete = (record) => {
          const poNumber = record?.po_number;
          const ioFilter = record?.io_filter;
          const categoryFilter = record?.category_filter;
          const supplierName = record?.supplier?.name;
          const flagStatus = record?.flag_status;

          return (
            (record.flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
              record.flag_status !== constant.FLAG_STATUS_PPIC_REQUEST ||
              record.flag_status !== constant.FLAG_STATUS_PROCUREMENT_RETUR ||
              record.flag_status !== constant.FLAG_STATUS_PPIC_INIT ||
              record.flag_status !== constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
              record.flag_status !== constant.FLAG_STATUS_SUPPLIER) &&
            !(
              utils.isNull(poNumber) ||
              utils.isNull(ioFilter) ||
              utils.isNull(categoryFilter) ||
              utils.isNull(supplierName) ||
              flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE
            )
          );
        };

        const initialChecked = isDataComplete(record);

        return (
          <>
            <Checkbox
              checked={previewRowChecked[index]}
              style={{ justifyContent: "center", display: "flex" }}
              onChange={() => {
                handleCheckboxChange(index, initialChecked, record?.flag_status);
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
      // editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      filters: filterColumnOpt("io_filter"),
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
      // editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      filters: filterColumnOpt("category_filter"),
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
      sorter: (a, b) => {
        return moment(a.submission_date) - moment(b.submission_date);
      },
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      width: 100,
      render: (_, row) => {
        return moment(row.submission_date).format(constant.FORMAT_DISPLAY_DATE);
      },
    },
    {
      title: t("supplierName"),
      dataIndex: "supplier_name",
      key: "supplier_name",
      filters: filterColumnOpt("supplier_name"),
      filteredValue: filteredInfo?.supplier_name || null,
      onFilter: (value, record) => {
        return record?.supplier?.name.includes(value);
      },
      filterSearch: true,

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
      width: 250,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
    },
    {
      title: t("No PR/PO"),
      dataIndex: "po_number",
      key: "po_number",
      width: 110,
      editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),

      filters: filterColumnOpt("po_number"),
      filteredValue: filteredInfo.po_number || null,
      onFilter: (value, record) => {
        return value === "" ? record?.po_number === "" : record?.po_number.includes(value);
      },

      filterSearch: true,
      render: (_, row) => {
        if (editTableMode) {
          return row?.po_number || <Tag color="red">Please Fill PO Number</Tag>;
        }
        return utils.renderNullable(row?.po_number);
      },
    },
    {
      title: t("Qty PR/PO"),
      dataIndex: "po_qty",
      key: "po_qty",
      // editable: editTableMode,
      sorter: (a, b) => {
        return moment(a.po_qty) - moment(b.po_qty);
      },
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      width: 100,
      render: (_, row) => {
        const poQty = utils.thousandSeparator(row.po_qty);
        return poQty;
      },
    },
    {
      title: t("Outs PR/PO"),
      dataIndex: "po_outs",
      key: "po_outs",
      sorter: (a, b) => {
        return moment(a.po_outs) - moment(b.po_outs);
      },
      // editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      width: 100,
      render: (_, row) => {
        return utils.thousandSeparator(row.po_outs);
      },
    },
    {
      title: t("SKUCode"),
      dataIndex: "sku_code",

      key: "sku_code",
      filters: filterColumnOpt("sku_code"),
      filteredValue: filteredInfo?.sku_code || null,
      onFilter: (value, record) => record?.sku_code.includes(value),
      filterSearch: true,
      width: 150,
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
      filters: filterColumnOpt("sku_name"),
      filteredValue: filteredInfo?.sku_name || null,
      onFilter: (value, record) => record?.sku_name.includes(value),
      filterSearch: true,
      width: 100,
      ellipsis: {
        showTitle: false,
      },
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      render: (_, row) => {
        return (
          <Tooltip placement="topLeft" title={row?.sku_name}>
            {row?.sku_name}
          </Tooltip>
        );
      },
    },
    {
      title: t("qtyDelivery"),
      dataIndex: "qty_delivery",
      sorter: (a, b) => {
        return moment(a.qty_delivery) - moment(b.qty_delivery);
      },
      key: "qty_delivery",
      width: 100,
      render: (_, row) => {
        return utils.thousandSeparator(row?.qty_delivery);
      },
    },
    {
      title: t("estDelivery"),
      dataIndex: "est_delivery",
      sorter: (a, b) => {
        return moment(a.est_delivery) - moment(b.est_delivery);
      },
      key: "est_delivery",
      width: 100,
      render: (_, row) => {
        return moment(row?.est_delivery).format(constant.FORMAT_DISPLAY_DATE) ?? "-";
      },
    },
    {
      title: t("sendSupplierDate"),
      dataIndex: "send_supplier_date",
      sorter: (a, b) => {
        return moment(a.send_supplier_date) - moment(b.send_supplier_date);
      },
      key: "send_supplier_date",
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
      sorter: (a, b) => {
        return moment(a.supplier_confirm_date) - moment(b.supplier_confirm_date);
      },
      key: "supplier_confirm_date",
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
      width: 100,
      render: (_, row) => {
        return utils.thousandSeparator(row?.submitted_qty);
      },
    },
    {
      title: t("supplierDate"),
      dataIndex: "est_submitted_date",
      key: "est_submitted_date",
      width: 100,
      render: (_, row) => {
        return row.est_submitted_date
          ? moment(row.est_submitted_date).format(constant.FORMAT_DISPLAY_DATE)
          : "-";
      },
    },
    {
      title: t("buyerName"),
      dataIndex: "buyer_name",
      key: "buyer_name",
      editable: editTableMode,
      // onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      filters: filterColumnOpt("buyer_name"),
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
      width: 100,
      onCell: (_, index) => {
        if (
          filterStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
          filterStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT ||
          (!filterStatus &&
            dataSource[index]?.flag_status !== constant.FLAG_STATUS_PROCUREMENT_REQUEST)
        )
          return;
        return { ...getCellConfig(arrayOfMerge, index) };
      },

      render: (_, row) => {
        let btnEdit;
        let btnSplit;
        let btnRetur;
        let tagStatus;
        let tagHutangKirim;
        let btnAcceptSplit;
        let btnRejectSplit;
        let btnAcceptEdit;
        let btnRejectEdit;
        let btnAcceptClosePO;
        let btnRejectClosePO;

        const flagStatus = row.flag_status;
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
                  loadOffers();
                  setPageLoading(false);
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
          const tagHutangKirim2 = row.hutang_kirim ? renderTag("error", "Hutang Kirim") : null;
          const tagStatus2 = renderTag(tagType, tagText);

          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {tagHutangKirim2}
              {tagStatus2}
            </div>
          );
        };
        tagHutangKirim = row.hutang_kirim ? renderTag("error", "Hutang Kirim") : null;
        if (row.deleted_at !== null) {
          tagStatus = renderTag("error", "Deleted");
        }
        if (
          row.flag_status === constant.FLAG_STATUS_PPIC_INIT ||
          row.flag_status === constant.FLAG_STATUS_PROCUREMENT_RETUR
        ) {
          tagStatus = renderTag("error", "at PPIC (retur)");
        }
        if (row.flag_status === constant.FLAG_STATUS_SUPPLIER) {
          tagStatus = renderTag("error", `at Supplier ${row?.supplier?.name}`);
        }
        if (
          row.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          row.split_from_id !== null
        ) {
          tagStatus = renderTag("warning", "Split Request (Supplier to Procurement)");
        }
        if (
          row.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          row.edit_from_id !== null
        ) {
          tagStatus = renderTag("warning", "Edit Request (Supplier to Procurement)");
        }
        if (row.flag_status === constant.FLAG_STATUS_PPIC_REQUEST && row.split_from_id !== null) {
          tagStatus = renderTag("warning", "Split Request (Supplier to PPIC)");
        }
        if (row.flag_status === constant.FLAG_STATUS_PPIC_REQUEST && row.edit_from_id !== null) {
          tagStatus = renderTag("warning", "Edit Request (Supplier to PPIC)");
        }
        if (row.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE) {
          tagStatus = renderTag("success", "Completed");
        }

        if (editTableMode) return;
        if (
          flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          row.hutang_kirim &&
          editTableMode
        ) {
          tagStatus = renderTag("warning", "Close PO Request");
        }
        if (
          flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          row.split_from_id !== null &&
          editTableMode
        ) {
          tagStatus = renderTag("warning", "Split Request");
        }
        if (
          flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          row.edit_from_id !== null &&
          editTableMode
        ) {
          tagStatus = renderTag("warning", "Edit Request");
        }

        if (
          flagStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
          flagStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
        ) {
          tagHutangKirim = row.hutang_kirim ? renderTag("error", "Hutang Kirim") : null;
          btnRetur = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="danger"
              style={{ justifyContent: "center", display: "flex" }}
              onClick={() => {
                setModalReturScheduleShow(true);
                setModalReturScheduleData(row);
              }}
            >
              {t("Retur")}
            </Button>
          );
        }

        if (row.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST && !editTableMode) {
          if (row.split_from_id !== null) {
            tagStatus = <Tag color="warning">Split Request</Tag>;
            tagHutangKirim = row.hutang_kirim ? <Tag color="red">Hutang Kirim</Tag> : null;
            btnAcceptSplit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="primary"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.purchasing.acceptSplit,
                    `Are you sure to accept this split request and forward to PPIC?`,
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
                    api.purchasing.rejectSplit,
                    `Are you sure to reject this split request?`,
                  )
                }
              >
                {`Reject Split Request`}
              </Button>
            );
          } else if (row.edit_from_id !== null) {
            tagStatus = <Tag color="warning">Edit Request</Tag>;
            tagHutangKirim = row.hutang_kirim ? <Tag color="red">Hutang Kirim</Tag> : null;
            btnAcceptEdit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="primary"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.purchasing.acceptEdit,
                    `Are you sure to accept this edit request and forward to PPIC?`,
                  )
                }
              >
                {`Accept Edit`}
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
                    api.purchasing.rejectEdit,
                    `Are you sure to reject this edit request?`,
                  )
                }
              >
                Reject Edit Request
              </Button>
            );
          } else if (row.hutang_kirim) {
            tagHutangKirim = row.hutang_kirim ? <Tag color="red">Hutang Kirim</Tag> : null;
            tagStatus = <Tag color="warning">Close PO Request</Tag>;
            btnAcceptClosePO = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="primary"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.purchasing.acceptClosePO,
                    `Are you sure to accept this close PO request and forward to PPIC?`,
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
                    api.purchasing.rejectClosePO,
                    `Are you sure to reject this close PO request?`,
                  )
                }
              >
                Reject Close PO Request
              </Button>
            );
          }
        }
        if (row.flag_status === constant.FLAG_STATUS_PPIC_REQUEST && !editTableMode) {
          if (row.split_from_id !== null) {
            tagStatus = (
              <Tag color="warning" style={{ whiteSpace: "normal", textAlign: "center" }}>
                Split Request at PPIC
              </Tag>
            );
            tagHutangKirim = row.hutang_kirim ? <Tag color="red">Hutang Kirim</Tag> : null;
          } else if (row.edit_from_id !== null) {
            tagStatus = (
              <Tag color="warning" style={{ whiteSpace: "normal", textAlign: "center" }}>
                Edit Request at PPIC
              </Tag>
            );
            tagHutangKirim = row.hutang_kirim ? <Tag color="red">Hutang Kirim</Tag> : null;
          } else if (row.hutang_kirim) {
            tagHutangKirim = row.hutang_kirim ? <Tag color="red">Hutang Kirim</Tag> : null;
            tagStatus = (
              <Tag color="warning" style={{ whiteSpace: "normal", textAlign: "center" }}>
                Close PO Request at
              </Tag>
            );
          }
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {tagHutangKirim}
            {tagStatus}
            {btnRetur}
            {btnAcceptSplit}
            {btnRejectSplit}
            {btnAcceptEdit}
            {btnRejectEdit}
            {btnAcceptClosePO}
            {btnRejectClosePO}
          </div>
        );
      },
    },
  ];

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    //if filterstatus is F then dont show the dataIndex check

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
    console.log(values);
    let newFilterValue = {};
    if (values.supplier_list) {
      newFilterValue.supplier_id = values.supplier_list;
    }
    if (values.user_filter) {
      if (values.user_filter?.length > 4) {
        newFilterValue.user_id = Decrypt(userInfo.user_id);
      } else {
        newFilterValue.user_id = values.user_filter;
      }
    } else {
      if (utils.havePermission(userInfo.permissions, "purchasing@admin")) {
        newFilterValue.user_id = null;
      } else {
        newFilterValue.user_id = Decrypt(userInfo.user_id);
      }
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
                filterStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
                filterStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT) &&
                !editTableMode && (
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
                              api.purchasing
                                .sendToSupplier(data)
                                .then((res) => {
                                  message.success("Success");
                                })
                                .catch((err) => {
                                  utils.swal.Error({ msg: utils.getErrMsg(err) });
                                })
                                .finally(() => {
                                  setPageLoading(false);
                                  loadOffers();
                                  Modal.success({
                                    content: `Email sent to supplier`,
                                  });
                                  const otherParams = {
                                    from_date: moment(dateRange[0]).format(
                                      constant.FORMAT_API_DATE,
                                    ),
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
                        }
                      }}
                      disabled={previewRowChecked.filter((item) => item === true).length === 0}
                    >
                      Send Schedule to Supplier
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        setDataSource(oldDataSource.sort((a, b) => a.key - b.key));
                        setEditTableMode(!editTableMode);
                        setPreviewRowChecked(dataSource.map(() => false));
                      }}
                    >
                      Change to Edit Mode
                    </Button>
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
                            currRow.split_from_id === nextRow.split_from_id;
                          return shouldMerge;
                        }),
                      );
                      setEditTableMode(!editTableMode);
                      api.purchasing
                        .edit(editedData)
                        .then((res) => {
                          message.success("Success");
                        })
                        .catch((err) => {
                          utils.swal.Error({ msg: utils.getErrMsg(err) });
                        })
                        .finally(() => {
                          loadOffers();
                          setPageLoading(false);
                        });
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="danger"
                    onClick={() => {
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

  const tabPanes = [
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
  ];
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
      >
        {filterStatus && filterStatus === status && <>{renderTable()}</>}
      </Tabs.TabPane>,
    );
  }

  if (!minDateLoaded) return null;

  return (
    <PageContainer
      title={`${t("procurement")} ${t("schedule")}`}
      additionalAction={utils.renderWithPermission(
        userInfo.permissions,
        <Link to="/offers/create">
          <Button size="small">{`${t("add")} ${t("offer")}`}</Button>
        </Link>,
        "offer@create",
      )}
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
        "purchasing@view",
      )}
      breadcrumbs={[
        {
          text: t("Procurement"),
          link: "/procurement/dashboard",
        },
      ]}
    >
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
      <ModalExport
        visible={modalExportShow}
        onCancel={() => setModalExportShow(false)}
        data={dataSource}
        exportType={"purchasing"}
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
      <ModalReturSchedule
        visible={modalReturScheduleShow}
        onCancel={() => {
          setModalReturScheduleShow(false);
        }}
        onSuccess={() => {
          setModalReturScheduleShow(false);
          message.success(
            `${t("schedule")} ${"retur"} ${t("toastSuffixSuccess")} ${t("toastImported")}`,
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

          fetchSummary(otherParams);
        }}
        data={modalReturScheduleData}
      />

      <SyncOverlay loading={pageLoading} />
      <Row gutter={16}>
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
                  {utils.renderWithPermission(
                    userInfo.permissions,
                    <Form.Item label="Buyer" name="user_filter" className="mb-2">
                      <Select
                        showSearch
                        placeholder="Select Buyer"
                        optionFilterProp="children"
                        // onChange={onChangeUserList}
                        style={{ width: "100%" }}
                        filterOption={filterOption}
                        options={purchasing}
                        defaultValue={userInfo.user_name}
                      />
                    </Form.Item>,
                    "purchasing@admin",
                  )}
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
                  <Form.Item label="Item Category" name="category_filter" className="mb-2">
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
              <Row gutter={8}></Row>
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
        <Col xs={24} lg={24} xl={24}>
          <Tabs defaultActiveKey={defaultActiveTab} onChange={onTabChanged}>
            {tabPanes}
          </Tabs>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default withRouter(PurchasingView);
