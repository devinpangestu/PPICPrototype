import React, { useEffect} from "react";
import {  Modal, Space } from "antd";

import { useTranslation } from "react-i18next";


function ModalEditFiles({ visible, onCancel, onOk, buttons = [] }) {
  const [t] = useTranslation();

  useEffect(() => {}, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible || buttons.length === 0) {
    return null;
  }
  console.log("buttons");
  console.log(buttons);

  return (
    <Modal title={t("Edit files")} open={visible} onCancel={onCancel} footer={null} centered>
      <Space>
        {buttons}
      </Space>
    </Modal>
  );
}

export default ModalEditFiles;
