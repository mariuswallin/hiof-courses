// js/analytics.js

console.log("Analytics script loaded");

export function analyticsDelayed() {
  setTimeout(() => {
    console.log("Analytics delayed loaded");
  }, 1000);
}

analyticsDelayed();
