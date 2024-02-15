import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";

const ConfigChangelog = (props) => {
  const [t] = useTranslation();

  const [pageLoading, setPageLoading] = useState(false);
  return (
    <PageContainer title={t("changelog")}>
      <SyncOverlay loading={pageLoading} />
    </PageContainer>
  );
};

export default withRouter(ConfigChangelog);
