import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello from hono</h1>)
})

app.get("/api/start", (c) => {return c.text("hello from hono api")})

export default app
