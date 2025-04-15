import { defineConfig, type ConfigEnv, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import chokidar from 'chokidar';

import { generateRoutes } from './scripts/routes';

export default defineConfig(({ command }: ConfigEnv) => {
  const isDev = command === 'serve';

  const plugins: PluginOption[] = [
    react(),
    viteStaticCopy({
      targets: [{
        src: '__blog__',
        dest: '.'
      }]
    }),

    {
      name: 'generate-routes-after-build',
      apply: 'build',
      closeBundle() {
        generateRoutes()
      }
    },
  ];

  // Add dev-only plugin safely
  if (isDev) {
    plugins.push({
      name: 'watch-blog-routes',
      apply: 'serve',
      configureServer(server) {
        const watcher = chokidar.watch('./__blog__', { ignoreInitial: true })

        const onChange = (path: string) => {
          generateRoutes()
          console.log(`📦 [routes.json] updated due to: ${path}`)
        }

        watcher.on('add', onChange)
        watcher.on('unlink', onChange)
        watcher.on('change', onChange)
        watcher.on('addDir', onChange)
        watcher.on('unlinkDir', onChange)

        server.httpServer?.once('close', () => {
          watcher.close()
        })
      }
    })
  }

  return {
    base: '/',
    plugins
  }
})
