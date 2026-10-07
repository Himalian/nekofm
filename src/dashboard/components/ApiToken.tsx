import { JSX } from "hono/jsx/jsx-runtime";

interface ApiTokenProps {
  initialToken?: string;
}

/**
 * ApiToken component renders API token management controls and endpoint details.
 */
export default function ApiToken({ initialToken = "" }: ApiTokenProps): JSX.Element {
  return (
    <section id="token-section" class="border p-4 rounded-md flex flex-col gap-4">
      <h2 class="text-xl font-semibold">API Token</h2>

      {/* View Token & Endpoint */}
      <div class="flex flex-col gap-2">
        <label for="current-token" class="text-sm font-medium">
          Current Token
        </label>
        <div class="flex gap-2">
          <input
            id="current-token"
            type="text"
            readOnly
            value={initialToken}
            class="border px-3 py-1.5 rounded flex-1 font-mono text-sm bg-gray-50"
          />
          <button
            id="btn-copy-token"
            type="button"
            class="border px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-100"
          >
            Copy
          </button>
        </div>
        <p class="text-xs text-gray-500">
          Submission Endpoint:{" "}
          <code id="endpoint-url" class="bg-gray-100 px-1 py-0.5 rounded">
            /api/listenbrainz/1/submit-listens
          </code>
        </p>
      </div>

      {/* New (Generate Token) */}
      <div class="flex items-center gap-2 pt-2 border-t">
        <button
          id="btn-generate-token"
          type="button"
          class="border px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-100"
        >
          Generate New Token
        </button>
      </div>

      {/* Edit (Custom Token) */}
      <div class="flex flex-col gap-2 pt-2 border-t">
        <label for="custom-token-input" class="text-sm font-medium">
          Edit Custom Token
        </label>
        <div class="flex gap-2">
          <input
            id="custom-token-input"
            type="text"
            placeholder="Enter custom token..."
            class="border px-3 py-1.5 rounded flex-1 text-sm font-mono"
          />
          <button
            id="btn-save-token"
            type="button"
            class="border px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-100"
          >
            Save
          </button>
        </div>
        <span id="token-status" class="text-xs text-gray-600 min-h-4"></span>
      </div>
    </section>
  );
}
