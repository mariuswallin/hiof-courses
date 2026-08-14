import Demo from "@/components/demo";
import { RequestInfo } from "rwsdk/worker";

export function Home({ ctx }: RequestInfo) {
  console.log("Home page context:", ctx);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-800 text-white">
      <h1 className="text-4xl font-bold">Velkommen til HIOF home page</h1>
      <Demo ctx={ctx} />
    </main>
  );
}
