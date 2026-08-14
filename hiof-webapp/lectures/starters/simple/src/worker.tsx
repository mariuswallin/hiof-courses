import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { Document } from "@/app/Document";

import { setCommonHeaders } from "./app/headers";

export interface Env {}

export type AppContext = {};

export default defineApp([
  setCommonHeaders(),
  render(Document, [
    route("/", () => {
      return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
          <h1>Frontpage</h1>
        </div>
      );
    }),
  ]),
]);
