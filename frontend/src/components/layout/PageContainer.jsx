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
  ScheduleOutlined,
  ShoppingCartOutlined,
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

export const PageContainer = ({ breadcrumbs, title, additionalAction, btnAction, children }) => {
  const [t] = useTranslation();
  const userInfo = utils.getUserInfo();

  const [siderVisible, setSiderVisible] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const conditionalMobileState = (ifTrue, ifFalse) => {
    return utils.isMobile() ? ifTrue : ifFalse;
  };
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
      // icon={<CloseOutlined />}
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
      "menu-config",
    );
  }
  const canViewTransactionHistory =
    utils.havePermission(userInfo.permissions, "purchasing@view") ||
    utils.havePermission(userInfo.permissions, "ppic@view");
  const siderContent = (
    <>
      <div className="w-100 position-relative">
        {drawerCloseBtn}
        <NavLink to="/">
          <Image
            height={conditionalMobileState(16, 32)}
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
        {utils.havePermission(userInfo.permissions, "ppic@view") && (
          <>
            <Menu.SubMenu
              key="menu-PPIC"
              style={{ fontSize: conditionalMobileState("10px", "14px") }}
              icon={<ScheduleOutlined />}
              title={t("ppic")}
            >
              {utils.renderWithPermission(
                userInfo.permissions,
                <Menu.Item key="/ppic/dashboard">
                  <NavLink
                    to={"/ppic/dashboard"}
                    style={{ fontSize: conditionalMobileState("8px", "14px") }}
                  >{`${t("dashboard")}`}</NavLink>
                </Menu.Item>,
                "ppic@view",
                "ppic@create",
                "ppic@edit",
                "ppic@delete",
              )}
              {utils.renderWithPermission(
                userInfo.permissions,
                <Menu.Item key="/ppic/suppliers-data">
                  <NavLink
                    to="/ppic/suppliers-data"
                    style={{ fontSize: conditionalMobileState("8px", "14px") }}
                  >
                    {t("supplierData")}
                  </NavLink>
                </Menu.Item>,
                "ppic@view",
                "ppic@create",
                "ppic@edit",
                "ppic@delete",
              )}
            </Menu.SubMenu>
            <Menu.Divider />
          </>
        )}
        {utils.havePermission(userInfo.permissions, "purchasing@view") && (
          <Menu.SubMenu
            style={{ fontSize: conditionalMobileState("10px", "14px") }}
            key="menu-purchasing"
            icon={<ShoppingCartOutlined />}
            title={t("Procurement")}
          >
            <Menu.Item key="/procurement/dashboard">
              <NavLink
                to={"/procurement/dashboard"}
                style={{ fontSize: conditionalMobileState("8px", "14px") }}
              >
                {t("dashboard")}
              </NavLink>
            </Menu.Item>
          </Menu.SubMenu>
        )}
        {utils.havePermission(userInfo.permissions, "supplier@view") && (
          <>
            <Menu.SubMenu
              style={{ fontSize: conditionalMobileState("10px", "14px") }}
              key="menu-supplier"
              icon={<AppstoreOutlined />}
              title={t("supplier")}
            >
              {utils.renderWithPermission(
                userInfo.permissions,
                <Menu.Item key="/supplier/dashboard">
                  <NavLink
                    to={"/supplier/dashboard"}
                    style={{ fontSize: conditionalMobileState("8px", "14px") }}
                  >
                    {t("dashboard")}
                  </NavLink>
                </Menu.Item>,
                "supplier@view",
              )}
            </Menu.SubMenu>
            <Menu.Divider />
          </>
        )}
        {canViewTransactionHistory && (
          <>
            <Menu.SubMenu
              style={{ fontSize: conditionalMobileState("10px", "14px") }}
              key="menu-transaction"
              icon={<ScheduleOutlined />}
              title={t("Transaction")}
            >
              <Menu.Item key="/history">
                <NavLink
                  to={"/history"}
                  style={{ fontSize: conditionalMobileState("8px", "14px") }}
                >
                  {t("history")}
                </NavLink>
              </Menu.Item>
              ,
            </Menu.SubMenu>
            <Menu.Divider />
          </>
        )}

        {(utils.havePermission(
          userInfo.permissions,
          "user@view",
          "user@create",
          "user@edit",
          "user@delete",
        ) ||
          utils.havePermission(
            userInfo.permissions,
            "role@view",
            "role@create",
            "role@edit",
            "role@delete",
          )) && (
          <Menu.SubMenu
            style={{ fontSize: conditionalMobileState("10px", "14px") }}
            key="menu-admin"
            icon={<UserOutlined />}
            title={t("superAdmin")}
          >
            {utils.renderWithPermission(
              userInfo.permissions,
              <Menu.Item key="/admin/users">
                <NavLink
                  to="/admin/users"
                  style={{ fontSize: conditionalMobileState("8px", "14px") }}
                >
                  {t("employee")}
                </NavLink>
              </Menu.Item>,
              "user@view",
              "user@create",
              "user@edit",
              "user@delete",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Menu.Item key="/admin/permissions">
                <NavLink
                  to={"/admin/permissions"}
                  style={{ fontSize: conditionalMobileState("8px", "14px") }}
                >
                  {t("userAccess")}
                </NavLink>
              </Menu.Item>,
              "role@view",
              "role@create",
              "role@edit",
              "role@delete",
            )}
          </Menu.SubMenu>
        )}
      </Menu>
    </>
  );

  let siderEl = (
    <Layout.Sider
      theme="light"
      trigger={null}
      collapsible
      collapsed={siderVisible}
      collapsedWidth={conditionalMobileState("50", "100")}
      width={conditionalMobileState("150", "290")}
    >
      {siderContent}
    </Layout.Sider>
  );

  let layoutWrapperCls = "layout-wrapper";

  useEffect(() => {
    if (utils.isMobile()) {
      setSiderVisible(false);
    }
  }, [mobileView]);
  useEffect(() => {
    const handleContextMenu = (event) => {
      // Prevent the right-click context menu
      event.preventDefault();
    };
    // Add event listener when the component mounts
    document.addEventListener("contextmenu", handleContextMenu);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
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
                icon={siderVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              />
            </Col>
            {!utils.isMobile() && (
              <Col>
                <Form.Item className="mb-0">
                  <Breadcrumb>
                    <Breadcrumb.Item key="home">
                      {breadcrumbs && breadcrumbs.length > 0 ? (
                        <Link
                          to={() => {
                            if (userInfo.role.id === 2) {
                              return "/ppic/dashboard";
                            } else if (userInfo.role.id === 3) {
                              return "/procurement/dashboard";
                            } else if (userInfo.role.id === 4) {
                              return "/procurement/dashboard";
                            } else if (userInfo.role.id === 5) {
                              return "/supplier/dashboard";
                            } else if (userInfo.role.id === 6) {
                              return "/ppic/dashboard";
                            }
                          }}
                        >
                          {t("home")}
                        </Link>
                      ) : (
                        t("home")
                      )}
                    </Breadcrumb.Item>
                    {breadcrumbs &&
                      breadcrumbs.map((el, idx) => {
                        const lastIdx = idx === breadcrumbs.length - 1;
                        return (
                          <Breadcrumb.Item key={el.text}>
                            {!lastIdx ? <Link to={el.link}>{el.text}</Link> : el.text}
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
                      <td>{userInfo.email || userInfo.user_name}</td>
                    </tr>
                    <tr>
                      <td>Role</td>
                      <td>: </td>
                      <td>{userInfo.role.desc}</td>
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
                  {userInfo.user_name}
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
                      handler.handleLogoutClick();
                    },
                  });
                }}
                icon={<PoweroffOutlined />}
              />
            </Col>
          </Row>
          <Layout.Content className="mx-4 px-5 py-4 mb-4 layout-content">
            {userInfo.password_changed === false && (
              <Alert
                className="mb-5"
                message={
                  <>
                    {t("alertChPwd")}{" "}
                    <Link to={"/change-password"} size="small" type="ghost">
                      Change Now
                    </Link>
                  </>
                }
                type="warning"
                showIcon
              />
            )}
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
