import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay } from "components";
import ModalExport from "components/ModalExport";
import { api } from "api";
import { useTranslation } from "react-i18next";
import configs from "configs";
import utils from "utils";

const TransportirTrnHistory = (props) => {
  const [t] = useTranslation();

  const userInfo = utils.getUserInfo();

  const pageSize = configs.pageSize.transaction;

  const transportirId = props.match.params.transportir_id;
  const shipId = props.match.params.ship;
  const [transportir, setTransportir] = useState(null);
  const [transactions, setTransactions] = useState(null);

  return <PageContainer></PageContainer>;
};

export default withRouter(TransportirTrnHistory);
