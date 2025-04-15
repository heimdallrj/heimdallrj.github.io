import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [content, setContent] = useState("")

  async function load() {
    const url = "/__blog__/2025-01-01/1735723445-hello.md";
    const response = await fetch(url)
    const markdown = await response.text()
    setContent(markdown)
  }

  useEffect(() => {
    load();
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <ReactMarkdown>{content}</ReactMarkdown>
    </>
  )
}

export default App
