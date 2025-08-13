const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/kakao/map': {
        target: 'https://dapi.kakao.com',   // 호스트까지만
        changeOrigin: true,
        secure: true,
        pathRewrite: { '^/kakao/map': '/v2/maps/sdk.js' },  // 경로 변환
      },
    },
  },
});
