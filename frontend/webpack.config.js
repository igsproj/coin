const HtmlWebpackPlugin = require('html-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const webpack = require('webpack') //to access built-in plugins
const path = require('path')

module.exports = (env) => ({
  entry: './src/App.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    publicPath: '/',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]]
          }
        }
      },

      {
        test: /\.css$/,
        use: [env.prod ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader']
      },

      {
        test: /\.(webp|avif|jpe?g|png|gif|svg)$/i,
        type: 'asset/resource',
        generator: {  //If emitting file, the file path is
          filename: 'img/[name].[contenthash][ext]'
        }
      },

      {
        test: /\.(woff(2)?|eot|ttf|otf)$/,
        type: 'asset',   // <-- Assets module - asset
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb
          }
        },
        generator: {  //If emitting file, the file path is
          filename: 'fonts/[name].[contenthash][ext]'
        }
      },

      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-react', { targets: 'defaults' }]]
          }
        }
      }
    ]
  },

  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
      new ImageMinimizerPlugin({
        generator: [
          {
            // You can apply generator using `?as=webp-100-50`, you can use any name and provide more options
            preset: 'webp',
            // implementation: ImageMinimizerPlugin.squooshGenerate,
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              resize: {
                enabled: true
              },
              encodeOptions: {
                webp: {
                  quality: 90
                  // lossless: true,
                }
              }
            }
          }
        ]
      })
    ]
  },

  // optimization: {
  //   minimizer: [
  //     new ImageMinimizerPlugin({
  //       minimizer: {
  //         implementation: ImageMinimizerPlugin.sharpMinify,
  //         options: {
  //           encodeOptions: {
  //             jpeg: {
  //               // https://sharp.pixelplumbing.com/api-output#jpeg
  //               quality: 100
  //             },
  //             webp: {
  //               // https://sharp.pixelplumbing.com/api-output#webp
  //               lossless: true,

  //             },
  //             avif: {
  //               // https://sharp.pixelplumbing.com/api-output#avif
  //               lossless: true
  //             },

  //             // png by default sets the quality to 100%, which is same as lossless
  //             // https://sharp.pixelplumbing.com/api-output#png
  //             png: {},

  //             // gif does not support lossless compression at all
  //             // https://sharp.pixelplumbing.com/api-output#gif
  //             gif: {}
  //           }
  //         }
  //       }
  //     })
  //   ]
  // },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/templates/layout.html',
      title: 'coin',
      filename: 'index.html'
    }),

    new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' })
  ],

  devServer: {
    historyApiFallback: true,
    hot: true
  }
})
