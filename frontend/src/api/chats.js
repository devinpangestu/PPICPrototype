import axios from "lib/axios";

const chats = {
  createChatRooms: (data) => {
    return axios({
      method: "post",
      url: `/chat-rooms`,
      data: data,
    });
  },

  getChatRooms: (size, last_index) => {
    let params = {};
    if (size) {
      params.size = size;
    }
    if (last_index) {
      params.last_index = last_index;
    }

    return axios({
      method: "get",
      url: `/chat-rooms`,
      params: params,
    });
  },

  getChats: (room_id, size, last_index) => {
    let params = {};
    if (room_id) {
      params.room_id = room_id;
    }
    if (size) {
      params.size = size;
    }
    if (last_index) {
      params.last_index = last_index;
    }

    return axios({
      method: "get",
      url: `/chats`,
      params: params,
    });
  },
};

export default chats;
