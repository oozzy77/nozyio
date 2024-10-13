import type { NozyGraph } from "@/type/types";

export const apiBase = import.meta.env.DEV ? "http://127.0.0.1:7070" : "";
const apiHost = import.meta.env.DEV ? "127.0.0.1:7070" : window.location.host;
export const fetchApi = async (url: string, options?: RequestInit) => {
  return fetch(apiBase + url, options);
};

export const common_app: {
  fetchApi: typeof fetchApi;
  wsUrl: string;
  graph: NozyGraph;
  osSep: string;
} = {
  fetchApi,
  wsUrl: `ws${
    window.location.protocol === "https:" ? "s" : ""
  }://${apiHost}/ws`,
  graph: {
    workflow_id: null,
    job_status: null,
    nodes: [],
    edges: [],
    values: {},
  },
  osSep: ".",
};

fetchApi("/get_os_sep")
  .then((res) => res.text())
  .then((sep) => {
    if (sep.length) {
      common_app.osSep = sep;
    } else {
      console.error("Failed to get OS separator");
    }
  });
