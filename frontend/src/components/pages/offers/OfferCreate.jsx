import React from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { useTranslation } from "react-i18next";
import OfferForm from "./OfferForm";

const OfferCreate = (props) => {
  const [t] = useTranslation();

  return (
    <PageContainer
      title={`${t("create")} ${t("offer")}`}
      breadcrumbs={[
        {
          text: t("offer"),
          link: "/offers",
        },
        {
          text: t("create"),
          link: "/offers/create",
        },
      ]}
    >
      <OfferForm />
    </PageContainer>
  );
};

export default withRouter(OfferCreate);
