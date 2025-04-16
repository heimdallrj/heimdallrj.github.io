/// <reference types="node" />

import fs from 'fs'
import path from 'path'

function readDir(contentRoot: string, projectRoot: string, nest = false): Record<string, any> {
  const entries = fs.readdirSync(contentRoot, { withFileTypes: true })
  const result: Record<string, any> = {}

  for (const entry of entries) {
    const fullPath = path.join(contentRoot, entry.name)

    if (entry.isDirectory()) {
      const nested = readDir(fullPath, projectRoot, nest)
      if (!nest) {
        Object.assign(result, nested)
      } else {
        for (const [key, value] of Object.entries(nested)) {
          result[key] = value
        }
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (ext !== '.md' && ext !== '.html') continue // 👈 STRICT EXTENSION CHECK

      const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, '/')
      const uri = `/${relativePath}`
      const type = ext.slice(1) // removes the dot
      const name = path.basename(entry.name, ext)
      const key = name.includes('-') ? name.split('-')[1] : name

      if (!nest) {
        result[key] = { uri, type }
      } else {
        const pathParts = relativePath
          .replace(/\.(md|html)$/i, '')
          .split('/')
          .slice(1) // skip "__pages__"

        let current = result
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i]
          if (!current[part]) current[part] = {}
          current = current[part]
        }

        const lastKey = pathParts[pathParts.length - 1]
        current[lastKey] = { uri, type }
      }
    }
  }

  return result
}

export function generateRoutes() {
  const projectRoot = path.resolve(__dirname, '..')
  const postsDir = path.resolve(projectRoot, '__posts__')
  const pagesDir = path.resolve(projectRoot, '__pages__')
  const distPath = path.resolve(projectRoot, 'dist/routes.json')

  const structure = {
    post: readDir(postsDir, projectRoot, false),
    ...readDir(pagesDir, projectRoot, true)
  }

  fs.mkdirSync(path.dirname(distPath), { recursive: true })
  fs.writeFileSync(distPath, JSON.stringify(structure, null, 2), 'utf-8')
  console.log(`✅ routes.json written to /dist with ${Object.keys(structure.post).length} posts`)
}