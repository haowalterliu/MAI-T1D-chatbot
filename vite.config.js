import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env file
  const env = loadEnv(mode, process.cwd(), '')

  const isGHPages = mode === 'production'

  return {
    base: isGHPages ? '/MAI-T1D-chatbot/' : '/',
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

            try {
              const parsed = JSON.parse(body)

              // Set API key in process.env for the handler
              process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

              // Dynamic import to avoid top-level await issues
              const { handleChatRequest } = await import('./server/api.js')
              const result = await handleChatRequest(parsed)

              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify(result))
            } catch (err) {
              console.error('API Error:', err)
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 500
              res.end(JSON.stringify({
                error: err.message || 'Internal server error',
                content: 'Sorry, I encountered an error connecting to the AI service. Please try again.',
              }))
            }
          })
        },
      },
    ],
  }
})
