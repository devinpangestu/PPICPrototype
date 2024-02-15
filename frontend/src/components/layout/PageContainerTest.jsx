import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import i18next from "i18next";
import configs from "configs";
import { useTranslation } from "react-i18next";
import utils from "utils";
import {
  Layout,
  Breadcrumb,
  Alert,
  Button,
  Menu,
  Image,
  Row,
  Col,
  Dropdown,
  Form,
  Modal,
  Drawer,
  Popover,
} from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SettingOutlined,
  AppstoreOutlined,
  UserOutlined,
  TableOutlined,
  PoweroffOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { SectionHeading } from "components";
import logo from "assets/images/logo_bkp.png";
import handler from "handler";
import constant from "constant";
import { api } from "api";

export const PageContainerNoRestrictions = ({
  breadcrumbs,
  title,
  additionalAction,
  btnAction,
  children,
}) => {
  const [t] = useTranslation();
  const [siderVisible, setSiderVisible] = useState(false);

  // useEffect(() => {
  //   const errMsg = "unable to load master data";
  //   api.master.config
  //     .list()
  //     .then(function (response) {
  //       const rsBody = response.data.rs_body;
  //       const ppnObj = rsBody.find((el) => el.name === "ppn");
  //       const ppnVal = ppnObj.value.toString();

  //       if (ppnVal === localStorage.getItem("ppn")) {
  //         return;
  //       }

  //       if (ppnVal) {
  //         localStorage.setItem("ppn", ppnVal);
  //         window.location.reload();
  //       } else {
  //         utils.swal.Error({
  //           msg: errMsg,
  //           cbFn: () => {
  //             // alert("ppn failed")
  //             handler.handleLogout();
  //             return;
  //           },
  //         });
  //       }
  //     })
  //     .catch(function (error) {
  //       utils.swal.Error({
  //         msg: errMsg,
  //         cbFn: () => {
  //           // alert("master data failed")
  //           handler.handleLogout();
  //           return;
  //         },
  //       });
  //     });
  // }, []);

  // * for now assuming configs.lang only contain 2 lang
  const getOtherLang = () => {
    for (const lngObj of configs.lang) {
      if (lngObj.code === i18next.language) {
        continue;
      }
      return lngObj;
    }
  };

  const otherLang = getOtherLang();
  const handleChangeLang = () => {
    const otherLangCode = otherLang.code;
    i18next.changeLanguage(otherLangCode).then((t) => {
      localStorage.setItem("lang", otherLangCode);
    });
  };

  const closeSider = () => {
    setSiderVisible(false);
  };

  const defaultOpenKeys = [];
  let drawerCloseBtn = (
    <Button
      type="text"
      className="mt-3 mr-3"
      onClick={closeSider}
      icon={<CloseOutlined />}
      style={{ position: "absolute", zIndex: "1", top: "0", right: "0" }}
    />
  );
  if (!utils.isMobile()) {
    drawerCloseBtn = undefined;

    defaultOpenKeys.push(
      "menu-commodity",
      "menu-prices",
      "menu-logistic",
      "menu-admin",
      "menu-config"
    );
  }

  const siderContent = (
    <>
      <div className="w-100 position-relative">
        {drawerCloseBtn}
        <NavLink to="/">
          <Image
            height={32}
            className={"w-auto"}
            src={logo}
            fallback={constant.IMAGE_FALLBACK}
            preview={false}
            wrapperClassName={"text-center my-3 w-100"}
          />
        </NavLink>
      </div>
      <Menu
        defaultOpenKeys={defaultOpenKeys}
        defaultSelectedKeys={[window.location.pathname]}
        mode="inline"
      >
        <Menu.SubMenu
          key="menu-commodity"
          icon={<TableOutlined />}
          title={t("commodity")}
        >
          <Menu.Item key="/">
            <NavLink to={"/"}>{t("dashboard")}</NavLink>
          </Menu.Item>
          <Menu.Item key="/offers">
            <NavLink to="/offers">{t("offer")}</NavLink>
          </Menu.Item>
          <Menu.Item key="/history">
            <NavLink to="/history">{t("history")}</NavLink>
          </Menu.Item>
          <Menu.Item key="/suppliers">
            <NavLink to="/suppliers">{t("supplier")}</NavLink>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.Divider />
        
          <Menu.SubMenu
            key="menu-logistic"
            icon={<AppstoreOutlined />}
            title={t("logistic")}
          >
            <Menu.Item key="/logistic/dashboard">
              <NavLink to={"/logistic/dashboard"}>{t("dashboard")}</NavLink>
            </Menu.Item>

            <Menu.Item key="/logistic/transportir">
              <NavLink to={"/logistic/transportir"}>{t("transportir")}</NavLink>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Divider />
       
        <Menu.SubMenu
          key="menu-config"
          icon={<SettingOutlined />}
          title={t("config")}
        >
          <Menu.Item key="/config">
            <NavLink to={"/config"}>{t("general")}</NavLink>
          </Menu.Item>
          <Menu.Item key="/config/commodity">
            <NavLink to={"/config/commodity"}>{t("commodityList")}</NavLink>
          </Menu.Item>
          <Menu.Item key="/config/commodity-fee">
            <NavLink to={"/config/commodity-fee"}>{t("commodityFee")}</NavLink>
          </Menu.Item>
          <Menu.Item key="/config/warehouse">
            <NavLink to={"/config/warehouse"}>{t("warehouse")}</NavLink>
          </Menu.Item>
          <Menu.Item key="/config/handover-location">
            <NavLink to={"/config/handover-location"}>
              {t("handoverLocation")}
            </NavLink>
          </Menu.Item>
          <Menu.Item key="/config/budget-transportir">
            <NavLink to={"/config/budget-transportir"}>
              {t("budgetTransportir")}
            </NavLink>
          </Menu.Item>
        </Menu.SubMenu>
        ,
        <Menu.SubMenu
          key="menu-admin"
          icon={<UserOutlined />}
          title={t("superAdmin")}
        >
          <Menu.Item key="/admin/users">
            <NavLink to="/admin/users">{t("employee")}</NavLink>
          </Menu.Item>
          <Menu.Item key="/admin/permissions">
            <NavLink to={"/admin/permissions"}>{t("userAccess")}</NavLink>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    </>
  );

  let siderEl = (
    <Layout.Sider
      theme="light"
      trigger={null}
      collapsible
      collapsed={siderVisible}
      collapsedWidth="0"
    >
      {siderContent}
    </Layout.Sider>
  );

  let layoutWrapperCls = "layout-wrapper";
  if (utils.isMobile()) {
    layoutWrapperCls += " layout-wrapper__mobile";

    let siderWidth = "100%"; // default is 200
    let siderStyle = {};
    let maskStyle = {};
    if (window.innerWidth >= constant.MOBILE_MAX_WIDTH) {
      siderWidth = constant.MOBILE_MAX_WIDTH;
      if (siderVisible) {
        const siderFromLeft =
          (document.body.clientWidth - constant.MOBILE_MAX_WIDTH) / 2;
        siderStyle.left = siderFromLeft;
        maskStyle.left = -siderFromLeft;
      }
    }

    siderEl = (
      <Drawer
        className={"sidebar-menu"}
        placement={"left"}
        onClose={closeSider}
        visible={siderVisible}
        maskClosable={true}
        closable={false}
        width={siderWidth}
        style={siderStyle}
        maskStyle={maskStyle}
      >
        {siderContent}
      </Drawer>
    );
  }

  return (
    <Layout className={layoutWrapperCls}>
      <Layout className="site-layout">
        {siderEl}
        <Layout>
          <Row className="ma-4">
            <Col>
              <Button
                className="trigger mr-4"
                onClick={() => {
                  setSiderVisible(!siderVisible);
                }}
                icon={
                  siderVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                }
              />
            </Col>
            {!utils.isMobile() && (
              <Col>
                <Form.Item className="mb-0">
                  <Breadcrumb>
                    <Breadcrumb.Item key="home">
                      {breadcrumbs && breadcrumbs.length > 0 ? (
                        <Link to="/">{t("home")}</Link>
                      ) : (
                        t("home")
                      )}
                    </Breadcrumb.Item>
                    {breadcrumbs &&
                      breadcrumbs.map((el, idx) => {
                        const lastIdx = idx === breadcrumbs.length - 1;
                        return (
                          <Breadcrumb.Item key={el.text}>
                            {!lastIdx ? (
                              <Link to={el.link}>{el.text}</Link>
                            ) : (
                              el.text
                            )}
                          </Breadcrumb.Item>
                        );
                      })}
                  </Breadcrumb>
                </Form.Item>
              </Col>
            )}

            <Col className="text-right" flex={"auto"}>
              <Popover
                style={{ cursor: "pointer" }}
                content={
                  <table>
                    <tr>
                      <td>ID</td>
                      <td>: </td>
                      <td>Test ID</td>
                    </tr>
                    <tr>
                      <td>Role</td>
                      <td>: </td>
                      <td>Test Role</td>
                    </tr>
                  </table>
                }
              >
                <Button
                  size="small"
                  className="mr-2"
                  type="text"
                  style={{ cursor: "pointer", color: "rgba(0,0,0,.4)" }}
                >
                  Test Username
                </Button>
              </Popover>
              <Dropdown
                trigger={["click"]}
                overlay={
                  <Menu>
                    <Menu.Item key="menu-changePwd">
                      <Link to={"/change-password"}>{t("changePassword")}</Link>
                    </Menu.Item>
                    <Menu.Item key="menu-changeLang" onClick={handleChangeLang}>
                      {t("use")} <strong>{otherLang.label}</strong>
                    </Menu.Item>
                  </Menu>
                }
                placement="bottomLeft"
                arrow
              >
                <Button className="mr-2" icon={<SettingOutlined />} />
              </Dropdown>
              <Button
                type="danger"
                onClick={() => {
                  Modal.confirm({
                    ...constant.MODAL_CONFIRM_DANGER_PROPS,
                    content: "Are you sure want to logout?",
                    onOk: () => {
                      handler.handleLogout();
                    },
                  });
                }}
                icon={<PoweroffOutlined />}
              />
            </Col>
          </Row>
          <Layout.Content className="mx-4 px-5 py-4 mb-4 layout-content">
            {title && (
              <SectionHeading
                size={4}
                withDivider
                title={title}
                additionalAction={additionalAction}
                btnAction={btnAction}
              />
            )}
            {children}
          </Layout.Content>
          <Layout.Footer className="footer">
            BKP ©{new Date().getFullYear()}{" "}
            {localStorage.getItem(constant.CLIENT_VERSION) &&
              `v${localStorage.getItem(constant.CLIENT_VERSION)}`}
          </Layout.Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};
