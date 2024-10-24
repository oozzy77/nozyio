export const getCurWorkflow = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const workflow = searchParams.get("wf");
  return workflow;
};

export const setCurWorkflow = (workflow: string) => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("wf", encodeURIComponent(workflow));
  window.history.pushState(
    {},
    "",
    `${window.location.pathname}?${searchParams.toString()}`
  );
  dispatchEvent(new CustomEvent("setCurWorkflow", { detail: workflow }));
};
