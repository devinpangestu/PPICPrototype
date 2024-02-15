import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button, Input,  Divider} from "antd";
import { api } from "api";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";

const ContractNumberForm = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { isEdit, id, cOffer, onCancel, onOk } = props;
  const [processing, setProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      if (!id) {
        utils.swal.Error({
          msg: t("swalDefaultError"),
          cbFn: () => {
            props.history.push("/offers");
            return;
          },
        });
        return;
      }
      getOffer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOffer = () => {
    setPageLoading(true);
    api.logistic.spk
      .get(id)
      .then(function (response) {
        console.log(response);
        // const offer = response.data.rs_body;
        // const setField = {};
        // form.setFieldsValue(setField);
      })
      .catch(function (error) {
        utils.swal.Error({
          msg: utils.getErrMsg(error),
          cbFn: () => {
            props.history.push("/offers");
            return;
          },
        });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const handleOnSubmit = (values) => {
    console.log("values");
    console.log(values);
    setProcessing(true);

    api.offers
      .createContractNumber(cOffer.id, values)
      .then(function (response) {
        form.resetFields();
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setProcessing(false);
        onOk();
      });
  };

  if (constant.isDevelopment()) {
    // initialValues = {
    //   spk_number: "123123",
    //   loading_date_target: "1 hari setelha",
    //   notes: "asdkajshduiadsasd",
    //   contract_numbers: ["1", "2"],
    // };
  }

  if (!isEdit && !cOffer) {
    return null;
  }

  return (
    <>
      <SyncOverlay loading={pageLoading} />

      <Form
        size="small"
        form={form}
        className="form-compact"
        onFinish={handleOnSubmit}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label={t("contractNumber")}
          name="contract_number"
          rules={[
            {
              required: true,
              message: t("required"),
            },
          ]}
          className="mb-2"
        >
          <Input placeholder={t("contractNumber")} />
        </Form.Item>

        <Divider />
        <Form.Item className="mb-0 text-right">
          <Button type="secondary" className="mr-2" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="primary" htmlType="submit" loading={processing}>
            {processing ? t("loading") : t("submit")}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default withRouter(ContractNumberForm);
