import React, { useState, useEffect } from "react";
import { Form, Button, Table, Row, Col, InputNumber, Select, Modal } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import moment from "moment";
import { SpinnerOverlay, SyncOverlay } from "components";
import configs from "configs";
import handler from "handler";

const { Column, ColumnGroup } = Table;

const CommodityFeeConfigTable = (props) => {
  const { isSimulation, simulation, setSimulation } = props;
  const [t] = useTranslation();
  const [pageLoading, setPageLoading] = useState(false);
  const genEmptyMap = () => {
    let initialMap = {};

    for (const c of constant.COMMODITY_REUTERS_LIST.morning) {
      initialMap[c.value] = {
        levy: {},
        bk: {},
        freight: {},
        government_fee: {},
      };
    }
    for (const c of constant.COMMODITY_REUTERS_LIST.afternoon) {
      initialMap[c.value] = {
        levy: {},
        bk: {},
        freight: {},
        government_fee: {},
      };
    }

    return initialMap;
  };

  const [commodityFeeMapInitial, setCommodityFeeMapInitial] = useState(null);
  const [commodityFeeMap, setCommodityFeeMap] = useState(genEmptyMap());

  const feeType = utils.getFeeTypeDropdownOpt();

  useEffect(() => {
    if (simulation) {
      handler.getSimulation(setPageLoading, setSimulation);
    } else {
      getCommodityFee();
    }
    
  }, []);
  useEffect(() => {
    if (simulation) {
      setCommodityFeeMap(simulation.data.commodity_fee);
    }
  }, [simulation]);

  useEffect(() => {}, [commodityFeeMap]);

  const getCommodityFee = () => {
    setPageLoading(true);
    api.commodityFee
      .list()
      .then(function (response) {
        setCommodityFeeMap(response.data.rs_body);
        setCommodityFeeMapInitial(JSON.parse(JSON.stringify(response.data.rs_body)));
      })
      .catch(function (error) {
        console.log("error");
        console.log(error);
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const handleOnSubmit = (commodity) => {
    return async () => {
      let errMsg;
      let somethingChanged = false;

      setPageLoading(true);
      if (commodityFeeMap[commodity].levy && commodityFeeMapInitial[commodity].levy) {
        if (
          commodityFeeMap[commodity].levy.value === undefined ||
          commodityFeeMap[commodity].levy.value === "" ||
          !commodityFeeMap[commodity].levy.fee_type
        ) {
          setPageLoading(false);
          return;
        }

        if (
          Number(commodityFeeMap[commodity].levy.value) !==
            Number(commodityFeeMapInitial[commodity].levy.value) ||
          commodityFeeMap[commodity].levy.fee_type !==
            commodityFeeMapInitial[commodity].levy.fee_type
        ) {
          somethingChanged = true;
          // levy changed
          const rqBody = {
            value: commodityFeeMap[commodity].levy.value,
            fee_type: commodityFeeMap[commodity].levy.fee_type,
          };
          await api.commodityFee
            .edit(commodity, "levy", rqBody)
            .then(function (response) {})
            .catch(function (error) {
              errMsg = utils.getErrMsg(error);
            })
            .finally(function () {
              console.log("finish update levy");
            });
          if (errMsg) {
            setPageLoading(false);
            getCommodityFee();
            utils.swal.Error({ msg: errMsg });
            return;
          }
        }
      }

      if (commodityFeeMap[commodity].bk && commodityFeeMapInitial[commodity].bk) {
        if (
          commodityFeeMap[commodity].bk.value === undefined ||
          commodityFeeMap[commodity].bk.value === "" ||
          !commodityFeeMap[commodity].bk.fee_type
        ) {
          setPageLoading(false);
          return;
        }

        if (
          Number(commodityFeeMap[commodity].bk.value) !==
            Number(commodityFeeMapInitial[commodity].bk.value) ||
          commodityFeeMap[commodity].bk.fee_type !== commodityFeeMapInitial[commodity].bk.fee_type
        ) {
          somethingChanged = true;
          // bk changed
          const rqBody = {
            value: commodityFeeMap[commodity].bk.value,
            fee_type: commodityFeeMap[commodity].bk.fee_type,
          };
          await api.commodityFee
            .edit(commodity, "bk", rqBody)
            .then(function (response) {})
            .catch(function (error) {
              errMsg = utils.getErrMsg(error);
            })
            .finally(function () {
              console.log("finish update bk");
            });
          if (errMsg) {
            setPageLoading(false);
            getCommodityFee();
            utils.swal.Error({ msg: errMsg });
            return;
          }
        }
      }

      if (commodityFeeMap[commodity].freight && commodityFeeMapInitial[commodity].freight) {
        if (
          commodityFeeMap[commodity].freight.value === undefined ||
          commodityFeeMap[commodity].freight.value === "" ||
          !commodityFeeMap[commodity].freight.fee_type
        ) {
          setPageLoading(false);
          return;
        }

        if (
          Number(commodityFeeMap[commodity].freight.value) !==
            Number(commodityFeeMapInitial[commodity].freight.value) ||
          commodityFeeMap[commodity].freight.fee_type !==
            commodityFeeMapInitial[commodity].freight.fee_type
        ) {
          somethingChanged = true;
          // freight changed
          const rqBody = {
            value: commodityFeeMap[commodity].freight.value,
            fee_type: commodityFeeMap[commodity].freight.fee_type,
          };
          await api.commodityFee
            .edit(commodity, "freight", rqBody)
            .then(function (response) {})
            .catch(function (error) {
              errMsg = utils.getErrMsg(error);
            })
            .finally(function () {
              console.log("finish update freight");
            });
          if (errMsg) {
            setPageLoading(false);
            getCommodityFee();
            utils.swal.Error({ msg: errMsg });
            return;
          }
        }
      }

      if (
        commodityFeeMap[commodity].government_fee &&
        commodityFeeMapInitial[commodity].government_fee
      ) {
        if (
          commodityFeeMap[commodity].government_fee.value === undefined ||
          commodityFeeMap[commodity].government_fee.value === "" ||
          !commodityFeeMap[commodity].government_fee.fee_type
        ) {
          setPageLoading(false);
          return;
        }

        if (
          Number(commodityFeeMap[commodity].government_fee.value) !==
            Number(commodityFeeMapInitial[commodity].government_fee.value) ||
          commodityFeeMap[commodity].government_fee.fee_type !==
            commodityFeeMapInitial[commodity].government_fee.fee_type
        ) {
          somethingChanged = true;
          // government_fee changed
          const rqBody = {
            value: commodityFeeMap[commodity].government_fee.value,
            fee_type: commodityFeeMap[commodity].government_fee.fee_type,
          };
          await api.commodityFee
            .edit(commodity, "government_fee", rqBody)
            .then(function (response) {})
            .catch(function (error) {
              errMsg = utils.getErrMsg(error);
            })
            .finally(function () {
              console.log("finish update government_fee");
            });
          if (errMsg) {
            setPageLoading(false);
            getCommodityFee();
            utils.swal.Error({ msg: errMsg });
            return;
          }
        }
      }

      Modal.success({
        ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
      });
      setPageLoading(false);
      if (somethingChanged) {
        getCommodityFee();
      }
    };
  };

  const handleOnSubmitSimulation = (simulation_id) => {
    return () => {
      if (simulation_id) {
        Modal.confirm({
          ...constant.MODAL_CONFIRM_DEFAULT_PROPS,
          content: t("swalConfirmEditSimulation"),
          onOk: () => {
            setPageLoading(true);
            api.simulation
              .edit(simulation_id, {
                date: moment().format(constant.FORMAT_API_DATE),
                data: commodityFeeMap,
              })
              .then(function (response) {
                Modal.success({
                  ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                });
              })
              .catch(function (error) {
                utils.swal.Error({ msg: utils.getErrMsg(error) });
              })
              .finally(function () {
                setPageLoading(false);
                window.location.reload();
                // getSimulation(setPageLoading, setSimulation);
              });
          },
        });
      } else {
        Modal.confirm({
          ...constant.MODAL_CONFIRM_DEFAULT_PROPS,
          content: t("swalConfirmCreateSimulation"),
          onOk: () => {
            setPageLoading(true);
            api.simulation
              .create({
                date: moment().format(constant.FORMAT_API_DATE),
                data: commodityFeeMap,
              })
              .then(function (response) {
                Modal.success({
                  ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                });
              })
              .catch(function (error) {
                utils.swal.Error({ msg: utils.getErrMsg(error) });
              })
              .finally(function () {
                setPageLoading(false);
                window.location.reload();
                // getSimulation(setPageLoading, setSimulation);
              });
          },
        });
      }
    };
  };

  const dataSource = [];
  let dataSourceKey = 1;
  let reutersCommodity = [];
  for (const reutersType of constant.REUTERS_TYPE_LIST) {
    for (const commodity of constant.COMMODITY_REUTERS_LIST[reutersType]) {
      if (constant.COMMODITY_WITHOUT_FEE.includes(commodity.value)) {
        continue;
      }
      if (!commodityFeeMap[commodity.value]) {
        continue;
      }
      reutersCommodity.push(commodity.value);
      dataSource.push({
        key: dataSourceKey,
        ...commodity,
      });
      dataSourceKey++;
    }
  }

  let otherCommodity = [];
  for (const commodity in commodityFeeMap) {
    if (
      Object.hasOwnProperty.call(commodityFeeMap, commodity) &&
      !reutersCommodity.includes(commodity)
    ) {
      otherCommodity.push(commodity);
    }
  }
  otherCommodity.sort(function (a, b) {
    return a.commodity - b.commodity;
  });
  for (const commodity of otherCommodity) {
    dataSource.push({
      key: dataSourceKey,
      ...commodity,
    });
    dataSourceKey++;
  }
  console.log("dataSource");
  console.log(dataSource);

  // name: levy, bk, etc
  const renderValColGroup = (name) => {
    return (
      <ColumnGroup title={t(name)}>
        <Column
          title={t("current")}
          dataIndex={t("current")}
          key={t("current")}
          render={(_, commodity) => {
            if (commodityFeeMap[commodity.value] && commodityFeeMap[commodity.value][name]) {
              let maxVal;
              if (commodityFeeMap[commodity.value][name].fee_type === "percentage") {
                maxVal = 100;
              }
              return (
                <Form.Item className="mb-0">
                  <Row>
                    <Col span={10}>
                      <Form.Item className="mb-0" colon={false}>
                        <InputNumber
                          size="small"
                          style={{ width: "100%" }}
                          placeholder={t(name)}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                          value={commodityFeeMap[commodity.value][name].value}
                          onChange={(value) => {
                            if (value > maxVal) {
                              return;
                            }
                            let temp = { ...commodityFeeMap };
                            temp[commodity.value][name].value = value;
                            setCommodityFeeMap(temp);
                          }}
                          max={maxVal}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={14}>
                      <Form.Item className="mb-0">
                        <Select
                          size="small"
                          showSearch
                          placeholder={t("select")}
                          value={feeType.find(
                            (el) => el.value === commodityFeeMap[commodity.value][name].fee_type,
                          )}
                          onChange={(value) => {
                            if (commodityFeeMap[commodity.value][name].fee_type === value) return;
                            let temp = { ...commodityFeeMap };
                            temp[commodity.value][name].fee_type = value;
                            temp[commodity.value][name].value = "";
                            setCommodityFeeMap(temp);
                          }}
                          {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                        >
                          {feeType &&
                            feeType.map((d) => (
                              <Select.Option key={d.value}>{d.label}</Select.Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              );
            }

            return null;
          }}
          width={"200px"}
        />
        <Column
          title={t("lastUpdated")}
          dataIndex={t("lastUpdated")}
          key={t("lastUpdated")}
          render={(_, commodity) => {
            if (commodityFeeMap[commodity.value] && commodityFeeMap[commodity.value][name]) {
              return (
                <div className="text-center">
                  {moment(commodityFeeMap[commodity.value][name].last_updated).format(
                    constant.FORMAT_DISPLAY_DATE,
                  )}
                </div>
              );
            }
            return null;
          }}
          width={"100px"}
        />
      </ColumnGroup>
    );
  };

  return (
    <>
      <SyncOverlay loading={pageLoading} />
      <Table
        dataSource={dataSource}
        pagination={false}
        scroll={configs.TABLE_SCROLL}
        size="small"
        className="commodity-fee"
        bordered
      >
        <Column
          title={t("commodity")}
          dataIndex={t("commodity")}
          key={t("commodity")}
          render={(_, commodity) => {
            return commodity.label;
          }}
          width="180px"
        />
        {renderValColGroup("levy")}
        {renderValColGroup("bk")}
        {renderValColGroup("freight")}
        {renderValColGroup("government_fee")}
        <Column
          title={t("action")}
          dataIndex={t("action")}
          key={t("action")}
          render={(_, commodity) => {
            if (!isSimulation) {
              return (
                <Button type="primary" size="small" block onClick={handleOnSubmit(commodity.value)}>
                  {t("update")}
                </Button>
              );
            }
            return null;
          }}
          width="80px"
        />
      </Table>
      {isSimulation && (
        <>
          <br />
          <Row>
            <Col className="text-right">
              {simulation ? (
                <Button onClick={handleOnSubmitSimulation(simulation.id)}>Update simulation</Button>
              ) : (
                <Button onClick={handleOnSubmitSimulation()}>Create simulation</Button>
              )}
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default CommodityFeeConfigTable;
