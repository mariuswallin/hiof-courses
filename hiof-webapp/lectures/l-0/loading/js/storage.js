// js/storage.js

console.log("Script loading storage.js");

// Module that handles all storage
export const Storage = {
  // Lagrer utstillinger i LocalStorage
  save: function (exhibitions) {
    localStorage.setItem("exhibitions", JSON.stringify(exhibitions));
  },

  // Read exhibitions from localStorage
  load: function () {
    const data = localStorage.getItem("exhibitions");
    return data ? JSON.parse(data) : [];
  },

  // Delete every exhibition
  clear: function () {
    localStorage.removeItem("exhibitions");
  },
};
