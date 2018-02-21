var webpack            = require('webpack');
var path               = require('path');
var ExtractTextPlugin  = require('extract-text-webpack-plugin');
var glob               = require('glob');
var PurifyCSSPlugin    = require('purifycss-webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var inProduction       = (process.env.NODE_ENV === 'production');

module.exports = {
	entry   : {
		app   : [
			'./src/main.js',
			'./src/main.scss',
		],
		vendor : ['jquery'],
	},
	output  : {
		path     : path.resolve(__dirname, './dist'),
		filename : '[name].[chunkhash].js',
	},
	module  : {
		rules : [
			{
				test : /\.s[ac]ss$/,
				use  : ExtractTextPlugin.extract({
					loader   : ["css-loader", "sass-loader"],
					fallback : "style-loader",
				}),
			},
			{
				test    : /\.(png|jpe?g|gif|svg|bmp|eot|ttf|woff|woff2)$/,
				loader  : "file-loader",
				options : {
					name : '[name].[chunkhash].[ext]',
				},
			},
			{
				test    : /\.js$/,
				exclude : '/node_modules/',
				use     : 'babel-loader',
			},
		],
	},
	plugins : [
		// new webpack.optimize.UglifyJsPlugin()
		new ExtractTextPlugin("[name].[chunkhash].css"),

		new CleanWebpackPlugin(['dist'], {
			root    : __dirname,
			verbose : true,
			dry     : false,
		}),

		new PurifyCSSPlugin({
			paths    : glob.sync(path.join(__dirname, 'index.html')),
			minimize : inProduction,
		}),

		new webpack.LoaderOptionsPlugin({
			minimize : inProduction,
		}),

		function() {
			this.plugin('done', stats => {
				require('fs').writeFileSync(
					path.join(__dirname, 'dist/manifest.json'),
					JSON.stringify(stats.toJson().assetsByChunkName)
				);
			});
		}
	],
};

if (inProduction) {
	module.exports.plugins.push(
		new webpack.optimize.UglifyJsPlugin(),
	);
}