const { resolve } = require("path");

module.exports = {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        turing: resolve(__dirname, "turing/index.html"),
      },
    },
  },
};
