import { config } from './build.js';
import esbuild from 'esbuild';

esbuild.serve({ port: 3000, servedir: 'public' }, config).then((/* server */) => {
  // Call "stop" on the web server to stop serving
  //server.stop();
  console.log('watching on port 3000...');
});
