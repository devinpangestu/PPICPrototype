import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SupplierTrnTable, SyncOverlay } from "components";
import ModalExport from "components/ModalExport";
import { Button } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";

const SupplierTrnHistory = (props) => {
  const [t] = useTranslation();

  const userInfo = utils.getUserInfo();
  const pageSize = configs.pageSize.transaction;

  const supplierId = props.match.params.id;
  const [supplier, setSupplier] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalExportShow, setModalExportShow] = useState(false);
  const EXPORT_TYPE = "supplier_transaction_history";

  const onTableChange = (pagination, filters, sorter, extra) => {
    console.log("Page changed:", pagination.current);
    setPageNumber(pagination.current);
    console.log("pagination: ", pagination);
    console.log("filters: ", filters);
    console.log("sorter: ", sorter);
    console.log("extra: ", extra);
  };

  useEffect(() => {
    if (!supplierId) {
      return;
    }

    setTableLoading(true);

    api.suppliers
      .transactions(supplierId, pageSize, pageNumber)
      .then((response) => {
        const rsBody = response.data.rs_body;
        setSupplier(rsBody.supplier);
        setTransactions(rsBody.transactions);
        setTotalData(rsBody.total);
      })
      .catch((error) => {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(() => {
        setTableLoading(false);
      });
  }, [supplierId, pageSize, pageNumber]);
  console.log(pageNumber);
  return (
    <PageContainer
      title={`${t("supplierTransactionHistory")}${
        supplier && supplier.name ? ` - ${supplier.name}` : ""
      }`}
      btnAction={
        transactions.length > 0 && utils.havePermission(userInfo.permissions, "export@xlsx") ? (
          <Button size="small" onClick={() => setModalExportShow(true)} disabled>
            {t("exportXLSX")} ???
          </Button>
        ) : null
      }
    >
      {utils.renderWithPermission(
        userInfo.permissions,
        <ModalExport
          visible={modalExportShow}
          onCancel={() => setModalExportShow(false)}
          exportType={EXPORT_TYPE}
          id={supplierId}
        />,
        "export@xlsx",
      )}

      <SyncOverlay loading={tableLoading} />
      <SupplierTrnTable
        totalData={totalData}
        supplierId={supplierId}
        transactions={transactions}
        onChange={onTableChange}
      />
    </PageContainer>
  );
};

export default withRouter(SupplierTrnHistory);
