import React, { useState, useRef, useEffect } from "react";
import useChat from "components/hooks/useChat";
import { Spinner } from "components";
import { useTranslation } from "react-i18next";
import utils from "utils";
import { api } from "api";
import { Button, Row, Col, Card, Form, Popover, Input, Space, Divider } from "antd";
import moment from "moment";
import constant from "constant";
import configs from "configs";
import { UserOutlined } from "@ant-design/icons";

const ChatRoom = (props) => {
  const { roomId, roomName, onlineUsers, socketRef, handleBack } = props;

  const [t] = useTranslation();
  const userInfo = utils.getUserInfo();

  const [newChatLoading, setNewChatLoading] = useState(false);
  const [chatMsg, setChatMsg] = useState("");

  const [roomUsers, setRoomUsers] = useState([]);
  const { messages, sendMessage } = useChat(roomId);

  const [lastIndex, setLastIndex] = useState(0);
  const [noMoreChat, setNoMoreChat] = useState(false);
  const [isScrollOnLatestChat, setIsScrollOnLatestChat] = useState(true);

  const chatInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const onlineText = <span className="color-primary font-weight-bold"> (Online)</span>;

  const scrollToBottom = (isSmooth = true) => {
    let scrollOpt = { block: "nearest", inline: "start" };
    if (isSmooth) {
      scrollOpt.behavior = "smooth";
    }

    if (chatEndRef.current != null) {
      chatEndRef.current.scrollIntoView(scrollOpt);
    }
  };

  const loadChats = (successCbFn) => {
    setNewChatLoading(true);
    api.chats
      .getChats(roomId, configs.pageSize.chats, lastIndex)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setRoomUsers(rsBody.room_users);
        for (const el of rsBody.chats) {
          messages.unshift({
            message: el.message,
            datetime: moment(new Date(el.datetime)).format(constant.FORMAT_DISPLAY_TIME),
            sender: el.created_by.name,
          });
        }

        if (rsBody.chats.length > 0) {
          setLastIndex(lastIndex + rsBody.chats.length);
        } else {
          setNoMoreChat(true);
        }

        if (successCbFn) {
          successCbFn();
        }
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setNewChatLoading(false);
      });
  };

  const focusChatTextInput = () => {
    if (chatInputRef.current != null) {
      chatInputRef.current.focus();
    }
  };

  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollTop === 0 && !noMoreChat) {
      const before = el.scrollHeight;
      loadChats(() => {
        const after = el.scrollHeight;
        el.scrollTo(0, after - before);
      });
    }
    const atBottom = el.scrollHeight - el.scrollTop === el.clientHeight;
    if (atBottom) {
      setIsScrollOnLatestChat(true);
    } else if (isScrollOnLatestChat) {
      setIsScrollOnLatestChat(false);
    }
  };

  const handleOnSubmit = (values) => {
    sendMessage(chatMsg);
    setChatMsg("");
    focusChatTextInput();
  };

  useEffect(() => {
    loadChats(() => {
      scrollToBottom(false);
      console.log("emit readNoti:", roomId);
      socketRef.current.emit("readNoti", {
        token: localStorage.getItem(constant.ACCESS_TOKEN),
        room_id: roomId,
      });
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      if (messages[messages.length - 1].sender === userInfo.user_name || isScrollOnLatestChat) {
        scrollToBottom();
      }
    }
  }, [messages]);

  return (
    <>
      <div className="chat-header">
        <Row>
          <Col className="align-self-center mr-2">
            <Button size="small" onClick={handleBack}>
              Back
            </Button>
          </Col>
          <Col flex="auto" className="align-self-center">
            {roomName}
          </Col>
          <Col className="align-self-center">
            <Popover
              placement="rightBottom"
              content={
                <ul className="pl-3 mb-0">
                  <li>You{onlineUsers[userInfo.employee_id] && onlineText}</li>
                  {roomUsers.map((user) => {
                    if (userInfo.employee_id === user.employee_id) {
                      return null;
                    }
                    return (
                      <li key={user.employee_id}>
                        {user.username}
                        {onlineUsers[user.employee_id] && onlineText}
                      </li>
                    );
                  })}
                </ul>
              }
              title={
                <Space>
                  <UserOutlined />
                  <span>Users</span>
                </Space>
              }
              trigger="click"
            >
              <Button size="small" icon={<UserOutlined />} />
            </Popover>
          </Col>
        </Row>
      </div>

      <div className="chats-wrapper" onScroll={handleScroll}>
        <Spinner loading={newChatLoading} />
        {messages.map((msg, idx) => {
          return (
            <Card className="chat-box">
              <div className="chat-info">
                <Row>
                  <Col flex={"auto"}>{msg.sender}</Col>
                  <Col>{msg.datetime}</Col>
                </Row>
              </div>
              <div className="display-linebreak chat-msg">{msg.message}</div>
            </Card>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <Form onFinish={handleOnSubmit}>
        <div className="chat-form">
          <Row>
            <Col flex="auto">
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 4 }}
                ref={chatInputRef}
                maxLength={constant.FORM_TEXT_AREA_LIMIT}
                placeholder={t("typeChat")}
                name="chatMsg"
                value={chatMsg}
                onChange={(e) => {
                  setChatMsg(e.target.value);
                }}
                // onPressEnter={(e) => {
                //   e.preventDefault()
                //   handleOnSubmit(e);
                // }}
                onKeyPressCapture={(e) => {
                  if (e.key === "Enter") {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleOnSubmit(e);
                    }
                  }
                }}
              />
            </Col>
            <Col className="ml-2">
              <Button className="h-100" type="primary" htmlType="submit">
                Send
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </>
  );
};

export default ChatRoom;
