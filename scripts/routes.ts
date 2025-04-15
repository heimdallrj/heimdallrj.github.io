/// <reference types="node" />

import fs from 'fs'
import path from 'path'

function walkBlogDir(blogRoot: string): Record<string, any> {
  const entries = fs.readdirSync(blogRoot, { withFileTypes: true })
  const result: Record<string, any> = {}

  for (const entry of entries) {
    const fullPath = path.join(blogRoot, entry.name)

    if (entry.isDirectory()) {
      Object.assign(result, walkBlogDir(fullPath)) // recursive
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const url = `/__blog__/${path.relative(path.resolve(blogRoot, '..'), fullPath).replace(/\\/g, '/')}`
      const name = path.basename(entry.name, '.md')
      const key = name.includes('-') ? name.split('-')[1] : name

      result[key] = { url }
    }
  }

  return result
}

export function generateRoutes() {
  const blogDir = path.resolve(__dirname, '../__blog__')
  const distPath = path.resolve(__dirname, '../dist/routes.json')

  const structure = {
    __blog__: walkBlogDir(blogDir)
  }

  fs.mkdirSync(path.dirname(distPath), { recursive: true })
  fs.writeFileSync(distPath, JSON.stringify(structure, null, 2), 'utf-8')
  console.log(`✅ routes.json written to /dist with ${Object.keys(structure.__blog__).length} entries`)
}