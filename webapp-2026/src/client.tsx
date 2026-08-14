import { initClient, initClientNavigation } from "rwsdk/client";

const { handleResponse, onHydrated } = initClientNavigation({
  scrollBehavior: "instant",
  scrollToTop: true,
});

initClient({ handleResponse, onHydrated });
