import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { Row, Col, Table, Button, Divider } from "antd";
import { api } from "api";
import { SectionHeading, SpinnerOverlay, SyncOverlay, TableNotFoundNotice } from "components";
import ModalSupplierRecentTrn from "components/pages/ModalSupplierRecentTrn";

import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";

const Home = (props) => {
  const [t] = useTranslation();

  const pageSize = configs.pageSize.supplier;

  const [pageLoading, setPageLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [supplierHistoryList, setSupplierHistoryList] = useState([]);

  const [modalSupplierRecentTrnShow, setModalSupplierRecentTrnShow] = useState(false);
  const [supplierRecentTrnSelected, setSupplierRecentTrnSelected] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState([]);
  const [selectedSupplierName, setSelectedSupplierName] = useState([]);

  const userInfo = utils.getUserInfo();
  const canViewSupplier = utils.havePermission(userInfo.permissions, "supplier@view");

  useEffect(() => {
    if (canViewSupplier) {
      setPageLoading(true);
      api.suppliers
        .histories("", pageSize, pageNumber)
        .then(function (response) {
          const rsBody = response.data.rs_body;
          setSupplierHistoryList(rsBody.suppliers_history);
          setTotalData(rsBody.total);
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    }
  }, [pageNumber, pageSize, canViewSupplier]);

  const dataSource = [];
  if (supplierHistoryList) {
    for (let i = 0; i < supplierHistoryList.length; i++) {
      const curr = supplierHistoryList[i];
      dataSource.push({
        key: i + 1,
        ...curr,
      });
    }
  }

  const columns = [
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
      render: (_, row) => {
        return row.name;
      },
    },
    {
      title: t("avgPrice"),
      dataIndex: "avg_price",
      key: "avg_price",
      align: "center",
      render: (_, row) => {
        return utils.thousandSeparator(row.price_avg);
      },
    },
    {
      title: t("totalTransaction"),
      dataIndex: "total_transaction",
      key: "total_transaction",
      align: "center",
      render: (_, row) => {
        return utils.thousandSeparator(row.total_trn);
      },
    },
    {
      title: `OTIF(%)`,
      dataIndex: "otif_percentage",
      key: "otif_percentage",
      align: "center",
      render: (_, row) => {
        return utils.thousandSeparator(row.otif_percentage);
      },
    },
    {
      title: `OTIF`,
      dataIndex: "otif",
      key: "otif",
      align: "center",
      render: (_, row) => {
        return utils.thousandSeparator(row.count_otif);
      },
    },
    {
      title: `N-OTIF`,
      dataIndex: "n_otif",
      key: "n_otif",
      align: "center",
      render: (_, row) => {
        return utils.thousandSeparator(row.count_not_otif);
      },
    },
    {
      title: `${t("recentTransactions")}`,
      dataIndex: "recent_transaction",
      key: "recent_transaction",
      align: "center",
      render: (_, row) => {
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setSelectedSupplierId(row.supplier_id);
              setSelectedSupplierName(row.name);
              setSupplierRecentTrnSelected(row.recent_transactions);
              setModalSupplierRecentTrnShow(true);
            }}
          >
            {t("seeDetails")}
          </Button>
        );
      },
    },
  ];

  const onTableChange = (pagination, filters, sorter, extra) => {
    setPageNumber(pagination.current);

    console.log("pagination: ", pagination);
    console.log("filters: ", filters);
    console.log("sorter: ", sorter);
    console.log("extra: ", extra);
  };

  return (
    <PageContainer>
      <SyncOverlay loading={pageLoading} />
      <ModalSupplierRecentTrn
        visible={modalSupplierRecentTrnShow}
        onCancel={() => setModalSupplierRecentTrnShow(false)}
        supplierId={selectedSupplierId}
        supplierName={selectedSupplierName}
      />
     
      {utils.renderWithPermission(
        userInfo.permissions,
        <>
          <Divider />
          <SectionHeading size={4} title={t("supplierData")} />
          <Row>
            <Col span={24}>
              {supplierHistoryList && supplierHistoryList.length > 0 ? (
                <Table
                  size="small"
                  dataSource={dataSource}
                  columns={columns}
                  pagination={{
                    ...configs.TABLE_PAGINATION,
                    total: totalData,
                    pageSize: pageSize,
                  }}
                  scroll={configs.TABLE_SCROLL}
                  onChange={onTableChange}
                />
              ) : (
                <TableNotFoundNotice />
              )}
            </Col>
          </Row>
        </>,
        "supplier@view",
      )}
    </PageContainer>
  );
};

export default withRouter(Home);
