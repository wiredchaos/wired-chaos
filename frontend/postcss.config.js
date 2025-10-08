const tailwindPlugin = (() => {
  try {
    return require('@tailwindcss/postcss');
  } catch (err) {
    return require('tailwindcss');
  }
})();

module.exports = {
  plugins: [
    typeof tailwindPlugin === 'function' ? tailwindPlugin() : tailwindPlugin,
    require('autoprefixer'),
  ],
};
