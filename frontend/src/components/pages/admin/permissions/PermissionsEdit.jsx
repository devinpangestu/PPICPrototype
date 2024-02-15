import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay } from "components";
import { Table, Button, Checkbox, Modal, message } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import constant from "constant";

const PermissionsEdit = (props) => {
  const [t] = useTranslation();

  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [formPermissions, setFormPermissions] = useState({});
  const [permissionChanged, setPermissionChanged] = useState(false);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!utils.isEmptyObj(formPermissions) && permissionChanged === false) {
      setPermissionChanged(true);
    }
  }, [formPermissions]);

  const loadRoles = () => {
    setTableLoading(true);
    api.roles
      .list()
      .then(function (response) {
        const rsBody = response.data.rs_body;
        let roles = [];
        rsBody.roles.forEach((el) => {
          roles.push(el);
        });
        setRoles(roles);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setTableLoading(false);
      });
  };

  const loadPermissions = () => {
    setTableLoading(true);
    api.permissions
      .list()
      .then(function (response) {
        const rsBody = response.data.rs_body;

        setPermissions(rsBody.permissions);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setTableLoading(false);
      });
  };

  const onSave = () => {
    if (permissionChanged === false) {
      return;
    }

    Modal.confirm({
      ...constant.MODAL_CONFIRM_DANGER_PROPS,
      content: t("swalConfirmEditPermission"),
      onOk: () => {
        setTableLoading(true);
        let permissionsData = {};
        for (const roleID in formPermissions) {
          if (Object.hasOwnProperty.call(formPermissions, roleID)) {
            const rolePermissions = formPermissions[roleID];
            const listPermissions = [];
            for (const permissionID in rolePermissions) {
              if (Object.hasOwnProperty.call(rolePermissions, permissionID)) {
                if (rolePermissions[permissionID] && rolePermissions[permissionID] === true)
                  listPermissions.push(Number(permissionID));
              }
            }
            permissionsData[roleID] = listPermissions;
          }
        }

        api.roles
          .editPermissions({ permissions: permissionsData })
          .then(function (response) {
            const rsBody = response.data.rs_body;
          })
          .catch(function (error) {
            utils.swal.Error({ msg: utils.getErrMsg(error) });
          })
          .finally(function () {
            setTableLoading(false);
            message.success(`${t("permission")} ${t("toastSuffixSuccess")} ${t("toastUpdated")}`);
            setPermissionChanged(false);
          });
      },
    });
  };

  const columns = [
    {
      title: t("group"),
      dataIndex: "group",
      key: "group",
      width: 175,
      fixed: 'left',
    },
    {
      title: t("action"),
      dataIndex: "action",
      key: "action",
      width: 150,
      align: "center",
      fixed: 'left',
    },
  ];
  const dataSource = [];
  if (permissions) {
    for (let i = 0; i < permissions.length; i++) {
      const permission = permissions[i];

      let groupRowSpan = 1;

      if (permission && permission.actions && permission.actions.length > 0) {
        groupRowSpan = permission.actions.length + 1;

        for (let j = 0; j < permission.actions.length; j++) {
          const action = permission.actions[j];

          for (let k = 0; k < roles.length; k++) {
            const role = roles[k];

            const permissionStr = `${permission.group_name}@${action.name}`;
            const checked = role.permissions.includes(permissionStr);
            if (!formPermissions[role.id]) formPermissions[role.id] = {};
            if (formPermissions[role.id][action.id] === undefined)
              formPermissions[role.id][action.id] = checked;
          }

          dataSource.push({
            key: `${permission.group_id}_${action.id}`,
            group: utils.snakeToTitleCase(permission.group_name),
            groupRowSpan: groupRowSpan,
            action: utils.snakeToTitleCase(action.name),
            action_id: action.id,
          });
        }
      }
    }
  }

  if (roles) {
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      columns.push({
        title: role.desc,
        dataIndex: role.desc,
        key: role.desc,
        align: "center",
        width: 150,
        render: (a, row) => {
          return (
            <Checkbox
              checked={formPermissions[role.id][row.action_id]}
              onChange={(e) => {
                formPermissions[role.id][row.action_id] = e.target.checked;
                setFormPermissions({ ...formPermissions });
              }}
            />
          );
        },
      });
    }
  }

  let tableXWidth = 0;
  for (let i = 0; i < columns.length; i++) {
    tableXWidth += columns[i].width;
  }

  return (
    <PageContainer
      title={t("permissionSettings")}
      btnAction={
        <Button size="small" type="primary" onClick={onSave} disabled={!permissionChanged}>
          {t("save")}
        </Button>
      }
      breadcrumbs={[
        {
          text: t("permissions"),
          link: "/admin/permissions",
        },
      ]}
    >
      <SyncOverlay loading={tableLoading} />
      <Table
        size="small"
        bordered
        dataSource={dataSource}
        columns={columns}
        pagination={configs.TABLE_PAGINATION_SINGLEPAGE}
        scroll={{ x: tableXWidth, y: 700 }}
      />
    </PageContainer>
  );
};

export default withRouter(PermissionsEdit);
