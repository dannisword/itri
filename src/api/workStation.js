import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

export function settWorkStations(data) {
  return new Promise((resolve) => {
    request({
      url: `/api/workStation/batch`,
      method: "PUT",
      data,
    }).then((respone) => {
      parseMessage(respone);
      resolve(respone);
    });
  });
}

export function getWorkStation() {
  return request({
    url: `/api/workStation/search`,
    method: "GET",
  });
}
