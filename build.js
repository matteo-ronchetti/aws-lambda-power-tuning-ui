import path from 'node:path';
import esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import tailwindConfig from './tailwind.config.js';

export const config = {
  entryPoints: ['src/index.js', 'src/style.scss'],
  platform: 'browser',
  bundle: true,
  //minify: true,
  sourcemap: true,
  target: ['es2020'],
  outdir: 'public',
  plugins: [
    sassPlugin({
      async transform(source, resolveDir) {
        const { css } = await postcss(autoprefixer, tailwindcss(tailwindConfig)).process(source, { from: undefined });
        return css;
      },
    }),
  ],
};

if (getLaunchFile() === 'build.js') {
  // I am the main launch file
  await build();
}

function build() {
  return esbuild.build(config);
}

function getLaunchFile() {
  return path.basename(process.argv[1]);
}
