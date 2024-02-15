import React from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { useTranslation } from "react-i18next";
import OfferForm from "./OfferForm_20231013";

const OfferCreate_20231013 = (props) => {
  const [t] = useTranslation();

  return (
    <PageContainer
      title={`${t("create")} ${t("offer")}`}
      breadcrumbs={[
        {
          text: t("offer"),
          link: "/offers_20231013",
        },
        {
          text: t("create"),
          link: "/offers_20231013/create",
        },
      ]}
    >
      <OfferForm />
    </PageContainer>
  );
};

export default withRouter(OfferCreate_20231013);
