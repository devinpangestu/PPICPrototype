import React from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Popover } from "antd";
import { useTranslation } from "react-i18next";
import { Table, Row, Col } from "antd";
import utils from "utils";
import moment from "moment";
import constant from "constant";
import configs from "configs";

export const TableNotFoundNotice = (props) => {
  const [t] = useTranslation();
  return <Alert type="warning" className="text-center mb-0" message={t("noData")} />;
};

export const SupplierTrnTable = (props) => {
  const [t] = useTranslation();

  const { title, supplierId, transactions, pagination, onChange, totalData } = props;
  const trnExist = transactions && transactions.length > 0;
  const pageSize = configs.pageSize.transaction;
  let renderPagination = {
    simple: true,
    responsive: true,
    hideOnSinglePage: true,
    defaultPageSize: 10,
    defaultCurrent: 1,
  };
  if (pagination) {
    renderPagination = pagination;
  }

  const dataSource = [];
  if (transactions) {
    for (let i = 0; i < transactions.length; i++) {
      const curr = transactions[i];
      dataSource.push({
        key: i + 1,
        ...curr,
      });
    }
  }
  const columns = [
    {
      title: t("date"),
      dataIndex: "date",
      key: "date",
      render: (_, row) => {
        return moment(row.datetime).format(constant.FORMAT_DISPLAY_DATE);
      },
    },
    {
      title: `${t("price")}/Kg`,
      dataIndex: "price",
      key: "price",
      render: (_, row) => {
        return utils.thousandSeparator(row.offer.price_final);
      },
    },
    {
      title: `${t("qty")} (MT)`,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, row) => {
        return utils.thousandSeparator(row.offer.quantity);
      },
    },
    {
      title: "FFA",
      dataIndex: "quality_ffa",
      key: "quality_ffa",
      render: (_, row) => {
        return utils.thousandSeparator(row.offer.quality_ffa.toFixed(2));
      },
    },
    {
      title: `M+I`,
      dataIndex: "quality_mi",
      key: "quality_mi",
      render: (_, row) => {
        return utils.thousandSeparator(row.offer.quality_mi.toFixed(2));
      },
    },
    {
      title: "DOBI",
      dataIndex: "quality_dobi",
      key: "quality_dobi",
      render: (_, row) => {
        return row.offer.quality_dobi
          ? utils.thousandSeparator(row.offer.quality_dobi.toFixed(2))
          : "-";
      },
    },
    {
      title: t("termsOfPayment"),
      dataIndex: "terms_of_payment",
      key: "terms_of_payment",
      render: (_, row) => {
        let val = null;
        if (row && row.offer && row.offer.terms_of_payment) {
          val = row.offer.terms_of_payment;
        }

        return (
          <>
            <Popover content={<div className="display-linebreak">{val}</div>} trigger={"click"}>
              <Button size="small">{t("view")}</Button>
            </Popover>
          </>
        );
      },
    },
    {
      title: "OTIF",
      dataIndex: "otif",
      key: "otif",
      render: (_, row) => {
        return row.is_otif ? t("yes") : t("no");
      },
    },
  ];

  return (
    <>
      {title && (
        <Row className="mb-1 font-weight-bold">
          {title && <Col span={24}>{title}</Col>}
          {supplierId && trnExist && (
            <Col span={24} className="text-right">
              <Link
                to={`/history/suppliers/${supplierId}`}
                target="_blank"
                rel="noopener noreferrer"
              >{`${t("seeAllHistory")}`}</Link>
            </Col>
          )}
        </Row>
      )}
      <Row className="mb-1 font-weight-bold">
        <Col span={24}>
          {trnExist ? (
            <Table
              size="small"
              dataSource={dataSource}
              columns={columns}
              pagination={{
                ...configs.TABLE_PAGINATION,
                total: totalData,
                pageSize: pageSize,
              }}
              onChange={onChange}
              scroll={configs.TABLE_SCROLL}
            />
          ) : (
            <TableNotFoundNotice />
          )}
        </Col>
      </Row>
    </>
  );
};
