module.exports = (api) => ({
  presets: api.env("test")
    ? [
        ["@babel/preset-env", { targets: { node: "current" } }],
        "@babel/preset-typescript",
      ]
    : [],
  plugins: ["emotion"],
});
