import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";

import { setCommonHeaders } from "./app/headers";

export interface Env {}

export type AppContext = {};

export default defineApp([
  setCommonHeaders(),
  render(Document, [route("/", () => <Home />)]),
]);
