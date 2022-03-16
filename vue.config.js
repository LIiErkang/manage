module.exports = {
	publicPath: '/',

	configureWebpack: {
		resolve: {
			alias: {
				assets: '@/assets',
				common: '@/common',
				components: '@/components',
				http: '@/http',
				style: '@/style',
				utils: '@/utils',
				views: '@/views'
			}
		}
	}
}
