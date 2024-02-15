import React from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { useTranslation } from "react-i18next";
import OfferForm from "./OfferForm_20231013";

const OfferEdit_20231013 = (props) => {
  const [t] = useTranslation();
  console.log("props.match.params.unique_id", props);
  return (
    <PageContainer title={`${t("edit")} ${t("offer")}`}>
      <OfferForm isEdit={true} id={props.match.params.id} />
    </PageContainer>
  );
};

export default withRouter(OfferEdit_20231013);
