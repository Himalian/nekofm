import { JSX } from "hono/jsx/jsx-runtime";

export default function Dash(): JSX.Element {
	return <div>
		<p class={"app-title" + "bg-sky-400 justify-center text-4xl ps-2 py-2 font-semibold"}>NekoFM</p>
		<div class={'now-playing' + ''}></div>

	</div>
}
