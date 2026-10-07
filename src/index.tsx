import { Hono } from 'hono'
import { renderer } from './renderer'
import Dash from './dashboard/Dash'
import type ListenBrainz from './types/listenbrainz'

const app = new Hono()

app.use(renderer)

app.get("/", (c) => { return c.render(<Dash />) })
app.get("/dashboard", (c) => { return c.render(<Dash />) })

app.get("/api/test", (c) => { return c.text("Hello from hono") })

app.post("/api/submit-scrobble", async (c) => {
	const body = await c.req.json<ListenBrainz.SubmitPayload>()
	return c.json({
		status: "ok",
		listenType: body.listen_type,
		totalCount: 325,
		listens: {},
		rawPlayload: body
	})
})

export default app
