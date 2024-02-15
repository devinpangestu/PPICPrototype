import { ExclamationCircleOutlined } from "@ant-design/icons";

export const MODAL_DEFAULT_PROPS = {
  maskClosable: true,
};

export const MODAL_SUCCESS_DEFAULT_PROPS = {
  ...MODAL_DEFAULT_PROPS,
  width: "200px",
  content: "Success", 
};

export const MODAL_CONFIRM_DEFAULT_PROPS = {
  ...MODAL_DEFAULT_PROPS,
  okText: "Yes",
};

export const MODAL_CONFIRM_DANGER_PROPS = {
  ...MODAL_CONFIRM_DEFAULT_PROPS,
  maskClosable: true,
  icon: <ExclamationCircleOutlined type="danger" />,
  okButtonProps: { danger: true },
  okText: "Yes",
};
