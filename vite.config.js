import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { chatErrorEvent } from './server/chatErrors.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env file
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',
    plugins: [
      react(),
      {
        name: 'openai-api-proxy',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            // Parse JSON body
            let body = ''
            for await (const chunk of req) {
              body += chunk
            }

            // Stream events back as Server-Sent Events. The frontend reads these
            // as they arrive so the chain-of-thoughts UI can update live.
            res.setHeader('Content-Type', 'text/event-stream')
            res.setHeader('Cache-Control', 'no-cache, no-transform')
            res.setHeader('Connection', 'keep-alive')
            res.setHeader('X-Accel-Buffering', 'no')
            res.statusCode = 200

            const emit = (event) => {
              res.write(`data: ${JSON.stringify(event)}\n\n`)
            }

            try {
              const parsed = JSON.parse(body)
              if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
              if (env.OPENAI_MODEL) process.env.OPENAI_MODEL = env.OPENAI_MODEL
              const { runAgent } = await import('./server/api.js')
              await runAgent(parsed, emit)
              res.end()
            } catch (err) {
              const event = chatErrorEvent(err)
              console.error('Chat error:', event.error)
              emit(event)
              res.end()
            }
          })
        },
      },
    ],
  }
})
