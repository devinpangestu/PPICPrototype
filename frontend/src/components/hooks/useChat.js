import { useEffect, useRef, useState } from "react";
import { getSocketRoom } from "socket";
import constant from "constant";
import moment from "moment";

const NEW_CHAT_MESSAGE_EVENT = "chatMessage";

const useChat = (roomId) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = getSocketRoom(roomId);

    socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, ({ userName, message, datetime }) => {
      setMessages((messages) => [
        ...messages,
        {
          sender: userName,
          datetime: moment(new Date(datetime)).format(constant.FORMAT_DISPLAY_TIME),
          message: message,
        },
      ]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const sendMessage = (message) => {
    message = message.trim();
    if (!message) {
      return false;
    }
    socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
      token: localStorage.getItem(constant.ACCESS_TOKEN),
      message: message,
    });
  };

  return { messages, sendMessage };
};

export default useChat;
