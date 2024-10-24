import type { NozyGraph } from "@/type/types";

export const getCurWorkflow = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const workflow = searchParams.get("wf");
  return workflow ? decodeURIComponent(workflow) : null;
};

export const setCurWorkflow = (workflow: string | null, graph?: NozyGraph) => {
  const searchParams = new URLSearchParams(window.location.search);
  if (workflow) {
    searchParams.set("wf", encodeURIComponent(workflow));
  } else {
    searchParams.delete("wf");
  }
  const newUrl = searchParams.toString()
    ? `${window.location.pathname}?${searchParams.toString()}`
    : window.location.pathname;
  window.history.pushState({}, "", newUrl);
  dispatchEvent(
    new CustomEvent("setCurWorkflow", { detail: { workflow, graph } })
  );
};
