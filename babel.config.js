module.exports = {
    presets: ['module:babel-preset-expo'],
    plugins: [
        ...(process.env.NODE_ENV === "production" ? ["module:transform-remove-console"] : []),
        ["module:react-native-dotenv"]
    ]
};
  