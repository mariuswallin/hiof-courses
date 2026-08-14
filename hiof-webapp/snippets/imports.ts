// file1.ts
const defineAppDefault = () => {};
export const defineApp = () => {};

export default defineAppDefault;

// file.t2

import LoremIpsum from "./file1";
import { defineApp } from "./file1";

import something from "@/app/Document";
// app/components/layouts/settings/demo.tsx

// import {calc} from '../../../lib/math'
// import {calc} from '@/lib/math'
// app/lib/math.ts
