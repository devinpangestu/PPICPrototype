import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay } from "components";
import { Table, Button, Checkbox, Modal, message } from "antd";
import configs from "configs";
import { PageContainerNoRestrictions } from "components/layout/PageContainerTest";

const TestPage = () => {
  return (
    <PageContainerNoRestrictions
      title="Test Page"
      breadcrumbs={[
        {
          text: "Test",
          link: "/test",
        },
      ]}
    >
      <div>
        <h1>Hello World</h1>
      </div>
    </PageContainerNoRestrictions>
  );
};

export default withRouter(TestPage);
