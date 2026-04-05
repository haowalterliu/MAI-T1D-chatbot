import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env file
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',
    plugins: [
      react(),
      {
        name: 'claude-api-proxy',
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
              process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
              const { runAgent } = await import('./server/api.js')
              await runAgent(parsed, emit)
              res.end()
            } catch (err) {
              console.error('API Error:', err)
              emit({
                type: 'error',
                error: err.message || 'Internal server error',
                content: 'Sorry, I encountered an error connecting to the AI service. Please try again.',
              })
              res.end()
            }
          })
        },
      },
    ],
  }
})
