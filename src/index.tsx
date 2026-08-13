import { Hono } from 'hono'
import { renderer } from './renderer'
import Dash from './dashboard/Dash'

const app = new Hono()

app.use(renderer)

app.get("/",(c)=>{return c.render(<Dash />)})
app.get("/dashboard",(c)=>{return c.render(<Dash />)})

export default app
