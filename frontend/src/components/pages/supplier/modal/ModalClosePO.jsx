import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Divider,
  Form,
  Button,
  Modal,
  InputNumber,
  Input,
  Space,
  DatePicker,
  Typography,
  Descriptions,
} from "antd";
import moment from "moment";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";

function ModalClosePO(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, data } = props;
  const isMobile = utils.isMobile();
  let formItemCls = "mb-0";
  const [processing, setProcessing] = useState(false);
  const [maxSplitQty, setMaxSplitQty] = useState(data?.qty_delivery);
  const [maxQtyExistingOffer, setMaxQtyExistingOffer] = useState(data?.qty_delivery);
  const [remainingQtyFulfilled, setRemainingQtyFulfilled] = useState(data?.qty_delivery);

  const [newSplit, setNewSplit] = useState({
    id: null,
    est_delivery: null,
    qty_delivery: null,
    notes: null,
  });
  const [splits, setSplits] = useState([]);
  const { Text, Link } = Typography;
  const qtyLoaded = useRef(null);
  useEffect(() => {
    if (!visible) {
      return;
    }
    form.setFieldsValue({
      schedules: [
        {
          split_from_id: data.split_from_id,
          id: data.id,
          est_delivery: moment(data.est_delivery),
          qty_delivery: data.qty_delivery,
        },
        { split_from_id: null, id: null, est_delivery: null, qty_delivery: null },
      ],
    });
    setSplits([
      {
        split_from_id: data.split_from_id,
        id: data.id,
        est_delivery: moment(data.est_delivery),
        qty_delivery: data.qty_delivery,
      },
      { split_from_id: null, id: null, est_delivery: null, qty_delivery: null },
    ]);
    // qtyLoaded.current.focus();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    setProcessing(true);

    for (let key in values.schedules) {
      values.schedules[key].id = values.schedules[key].id ? data.id : null;
      values.schedules[key].est_delivery = moment(values.schedules[key].est_delivery).format(
        constant.FORMAT_API_DATE,
      );
    }
    api.suppliers
      .splitSupplier(data.id, values.schedules)
      .then(function (response) {
        form.resetFields();
        onSuccess();
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
        onCancel();
      })
      .finally(function () {
        setProcessing(false);
      });
  };

  return (
    data && (
      <Modal
        title={`CLOSE PO REQUEST
        ${data.supplier.name}
        ${data.po_number}
        ${data.sku_code} ${data.sku_name}
        QTY: ${data?.qty_delivery} `}
        open={visible}
        onCancel={onCancel}
        footer={null}
        centered
        style={{ minWidth: "50%", whiteSpace: "pre-line" }}
      >
        <Form form={form} onFinish={handleOnSubmit} labelCol={{ span: 6 }}>
          <Card className="price-input">
            <Form.List name="schedules">
              {(fields, { add, remove }) => (
                <Row>
                  <Col span={24}>
                    {fields.map(({ key, name, ...restField }) => {
                      let removeLbl = undefined;
                      let showLabel = false;

                      if (key === 0) {
                        // first row
                        showLabel = true;
                        removeLbl = <>&nbsp;</>;
                      }
                      let labelColSpan = 8;
                      let removeBtnCol = 1;
                      let dateColSpan = 23;
                      let removeBtnBlock = false;

                      let removeBtnText = undefined;
                      let dividerClsName = "d-none";
                      if (isMobile) {
                        labelColSpan = 11;
                        dateColSpan = 22;
                        removeLbl = undefined;
                        showLabel = true;
                        removeBtnBlock = true;
                        removeBtnCol = 2;
                        dividerClsName = "my-3";
                      }

                      return (
                        <>
                          <Row>
                            <Col flex="auto" span={dateColSpan}>
                              <Form.Item
                                {...restField}
                                name={[name, "notes"]}
                                className={formItemCls}
                                label={t("notes")}
                                rules={[
                                  {
                                    required: true,
                                    message: `${t("input")} ${t("notes")}`,
                                  },
                                  {
                                    type: "string",
                                    min: 6,
                                    message: t("Notes must be at least 6 characters"),
                                  },
                                ]}
                                labelCol={{ span: labelColSpan }} // Set the width of the label column
                                wrapperCol={{ span: 11 }}
                              >
                                <Input.TextArea
                                  placeholder={`${t("input")} ${t("notes")}`}
                                  rows={constant.FORM_TEXT_AREA_ROW}
                                  maxLength={constant.FORM_TEXT_AREA_LIMIT}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Divider className={dividerClsName} />
                        </>
                      );
                    })}

                    <Row>
                      <Col span={24} className="text-right">
                        <Space>
                          <Form.Item className="mb-0">
                            <Button
                              onClick={() => {
                                onCancel();
                              }}
                            >
                              {t("back")}
                            </Button>
                          </Form.Item>
                          <Form.Item className="mb-0">
                            <Button type="primary" htmlType="submit">
                              {t("submit")}
                            </Button>
                          </Form.Item>
                        </Space>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )}
            </Form.List>
          </Card>
        </Form>
      </Modal>
    )
  );
}

export default ModalClosePO;
