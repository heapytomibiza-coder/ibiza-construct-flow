import React from "react";

export default function App() {
  React.useEffect(() => {
    // quick sanity
    // eslint-disable-next-line no-console
    console.log("React useEffect ok:", typeof React.useEffect === "function");
  }, []);
  return <div>App OK</div>;
}
