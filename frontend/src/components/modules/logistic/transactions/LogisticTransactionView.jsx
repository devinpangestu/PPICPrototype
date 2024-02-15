import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay, TableNotFoundNotice } from "components";
import TrnCard from "components/TrnCard";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import constant from "constant";
import moment from "moment";
import ModalPriceData from "components/ModalPriceData";
import ModalExport from "components/ModalExport";

const Transaction = (props) => {
  const userInfo = utils.getUserInfo();
  const [pageLoading, setPageLoading] = useState(false);

  const [t] = useTranslation();

  const pageSize = configs.pageSize.transaction;

  return (
    <PageContainer>
      <SyncOverlay loading={pageLoading} />
    </PageContainer>
  );
};

export default withRouter(Transaction);
