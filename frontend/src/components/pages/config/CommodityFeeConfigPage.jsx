import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { useTranslation } from "react-i18next";
import CommodityFeeConfigTable from "./CommodityFeeConfigTable";

const CommodityFeeConfig = (props) => {
  const [t] = useTranslation();

  return (
    <PageContainer
      title={t("commodityFee")}
      breadcrumbs={[
        {
          text: t("config"),
          link: "/config",
        },
        {
          text: t("commodityFee"),
          link: "/commodity-fee",
        },
      ]}
    >
      <CommodityFeeConfigTable />
    </PageContainer>
  );
};

export default withRouter(CommodityFeeConfig);
