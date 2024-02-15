import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Button,
  Input,
  
  InputNumber,
  Divider,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { api } from "api";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";

const RecapForm = (props) => {
  const spkType = "pemuatan"; 
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { isEdit, id, cOffer, lOffer, onCancel, onOk } = props;

  const [processing, setProcessing] = useState(false);

  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      contract_numbers: [""],
    });

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
  }, []);

  const getOffer = () => {
    setPageLoading(true);
    api.logistic.spk
      .get(id)
      .then(function (response) {
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

    values.type = spkType;
    values.commodity_offer_id = cOffer.unique_id;
    console.log("lOffer");
    console.log(lOffer);
    values.logistic_offer_id = lOffer.id;

    api.logistic.spk
      .create(values)
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

  let initialValues = {
    loading_date_target: Math.ceil(cOffer.quantity / 1000),
  };
  if (constant.isDevelopment()) {
    // initialValues = {
    //   spk_number: "123123",
    //   loading_date_target: "1 hari setelha",
    //   notes: "asdkajshduiadsasd",
    //   contract_numbers: ["1", "2"],
    // };
  }

  if (!isEdit && (!cOffer || !lOffer)) {
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
        initialValues={initialValues}
        layout="vertical"
      >
        <Form.Item
          label={t("SPKNumber")}
          name="spk_number"
          rules={[
            {
              required: true,
              message: t("required"),
            },
          ]}
          className="mb-2"
        >
          <Input placeholder={t("SPKNumber")} />
        </Form.Item>
        <Form.List name="contract_numbers">
          {(fields, { add, remove }, { errors }) => {
            return (
              <>
                {fields.map((field, index) => {
                  let removeLbl = undefined;
                  let showLabel = false;
                  if (index === 0) {
                    showLabel = true;
                    removeLbl = <>&nbsp;</>;
                  }
                  let removeBtnCol = undefined;
                  let removeBtnText = undefined;
                  let dividerClsName = "d-none";

                  if (utils.isMobile()) {
                    removeLbl = undefined;
                    showLabel = true;

                    removeBtnCol = 24;
                    removeBtnText = t("remove");
                    dividerClsName = "my-3";
                  }
                  return (
                    <>
                      <Row key={field.key} gutter={12} className="mb-3">
                        <Col flex={"auto"}>
                          <Form.Item
                            {...field}
                            rules={[
                              {
                                required: true,
                                message: t("required"),
                              },
                            ]}
                            label={showLabel && t("contractNumber")}
                            className="mb-0"
                          >
                            <Input placeholder={t("contractNumber")} />
                          </Form.Item>
                        </Col>
                        <Col xs={removeBtnCol}>
                          <Form.Item className={"mb-0"} label={removeLbl}>
                            <Button
                              block={utils.isMobile()}
                              disabled={index === 0}
                              onClick={() => remove(field.name)}
                              icon={<MinusCircleOutlined />}
                            >
                              {removeBtnText}
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider className={dividerClsName} />
                    </>
                  );
                })}
                <Row>
                  <Col span={24} className="text-right">
                    <Form.Item className="mb-2">
                      <Button
                        block={utils.isMobile()}
                        onClick={() => {
                          add();
                        }}
                        icon={<PlusOutlined />}
                      >
                        {t("add")}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            );
          }}
        </Form.List>
        <Form.Item
          label={t("Target Waktu Pemuatan")}
          name="loading_date_target"
          rules={[
            {
              required: true,
              message: t("required"),
            },
          ]}
          className="mb-2"
        >
          <InputNumber
            placeholder={t("Target Waktu Pemuatan")}
            {...configs.FORM_MONEY_DEFAULT_PROPS}
            addonAfter={t("day")}
          />
        </Form.Item>

        <Form.Item
          label={t("notes")}
          name="notes"
          rules={[
            {
              required: true,
              message: t("required"),
            },
          ]}
          className="mb-2"
        >
          <Input.TextArea
            placeholder={t("notes")}
            rows={15}
            // maxLength={}
          />
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

export default withRouter(RecapForm);
