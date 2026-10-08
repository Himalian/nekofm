import React, { useEffect, useState } from 'react';
import { KeyRound, Copy, Check, Sparkles, Save, ShieldAlert, ArrowUpRight, ExternalLink } from 'lucide-react';
import { fetchApiToken, generateApiToken, updateApiToken } from '../services/api';

export default function TokenPage() {
	const [token, setToken] = useState('');
	const [customToken, setCustomToken] = useState('');
	const [copied, setCopied] = useState(false);
	const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchApiToken().then(setToken);
	}, []);

	const notify = (text: string, error = false) => {
		setStatusMessage({ text, error });
		setTimeout(() => setStatusMessage(null), 3000);
	};

	const handleCopy = async () => {
		if (!token) return;
		try {
			await navigator.clipboard.writeText(token);
			setCopied(true);
			notify('Token copied to clipboard!');
			setTimeout(() => setCopied(false), 2000);
		} catch {
			notify('Failed to copy to clipboard', true);
		}
	};

	const handleGenerate = async () => {
		setLoading(true);
		try {
			const newToken = await generateApiToken();
			setToken(newToken);
			notify('New token generated successfully!');
		} catch {
			notify('Failed to generate new token', true);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveCustom = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = customToken.trim();
		if (!trimmed) {
			notify('Token cannot be empty', true);
			return;
		}
		setLoading(true);
		try {
			const savedToken = await updateApiToken(trimmed);
			setToken(savedToken);
			setCustomToken('');
			notify('Custom token saved successfully!');
		} catch {
			notify('Failed to save custom token', true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Toast Notification */}
			{statusMessage && (
				<div
					className={`p-3 text-sm rounded-lg border font-medium flex items-center justify-between transition-all ${statusMessage.error
							? 'bg-rose-50 text-rose-800 border-rose-200'
							: 'bg-emerald-50 text-emerald-800 border-emerald-200'
						}`}
				>
					<span>{statusMessage.text}</span>
				</div>
			)}

			{/* Ingestion Token Management */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="p-5 border-b border-gray-100 flex items-center gap-2.5">
					<KeyRound className="w-5 h-5 text-indigo-600" />
					<h2 className="text-lg font-semibold text-gray-900">Ingestion API Token</h2>
				</div>

				<div className="p-6 space-y-6">
					{/* Active Token Display */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">Active Token</label>
						<div className="flex gap-2">
							<input
								type="text"
								readOnly
								value={token}
								className="w-full font-mono text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none"
							/>
							<button
								type="button"
								onClick={handleCopy}
								className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shrink-0 shadow-sm cursor-pointer"
							>
								{copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
								{copied ? 'Copied' : 'Copy'}
							</button>
						</div>
					</div>

					{/* Submission Endpoint Guide */}
						<div className="font-medium text-indigo-950 flex items-center gap-1.5">
							<span>ListenBrainz API Endpoint:</span>
						</div>
						<code className="block font-mono text-xs text-indigo-800 bg-white/80 p-2 rounded border border-indigo-200/60 select-all">
							{window.location.origin}/api/listenbrainz/

						</code>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
						{/* Generate New Token */}
						<div className="space-y-3">
							<h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
								<Sparkles className="w-4 h-4 text-amber-500" />
								Regenerate Token
							</h3>
							<p className="text-xs text-gray-500">
								Generate a random cryptographically secure token. Previous clients using the old token will need to be updated.
							</p>
							<button
								type="button"
								onClick={handleGenerate}
								disabled={loading}
								className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
							>
								<Sparkles className="w-4 h-4" />
								Generate New Token
							</button>
						</div>

						{/* Custom Token Input */}
						<form onSubmit={handleSaveCustom} className="space-y-3">
							<h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
								<Save className="w-4 h-4 text-blue-500" />
								Set Custom Token
							</h3>
							<p className="text-xs text-gray-500">
								Prefer using an existing memorable passphrase or UUID? Set it here.
							</p>
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="Enter custom token..."
									value={customToken}
									onChange={(e) => setCustomToken(e.target.value)}
									className="w-full text-sm font-mono px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
								<button
									type="submit"
									disabled={loading || !customToken.trim()}
									className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors shrink-0 cursor-pointer"
								>
									Save
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>

			{/* Upstream Scrobble Services Integration */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="p-5 border-b border-gray-100 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<ArrowUpRight className="w-5 h-5 text-gray-600" />
						<h2 className="text-lg font-semibold text-gray-900">Upstream Forwarding Services</h2>
					</div>
					<span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
						Relay Ready
					</span>
				</div>

				<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Last.fm Card */}
					<div className="p-4 rounded-lg border border-gray-200 space-y-3 hover:border-gray-300 transition-colors">
						<div className="flex items-center justify-between">
							<span className="font-semibold text-gray-900">Last.fm Integration</span>
							<span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Not Linked</span>
						</div>
						<p className="text-xs text-gray-600">
							Forward processed scrobbles to your Last.fm account via official Scrobble API.
						</p>
						<button
							type="button"
							className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
							onClick={() => alert('Last.fm OAuth flow integration is ready to be linked.')}
						>
							Connect Last.fm Account
							<ExternalLink className="w-3.5 h-3.5" />
						</button>
					</div>

					{/* ListenBrainz Card */}
					<div className="p-4 rounded-lg border border-gray-200 space-y-3 hover:border-gray-300 transition-colors">
						<div className="flex items-center justify-between">
							<span className="font-semibold text-gray-900">ListenBrainz Official</span>
							<span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Not Linked</span>
						</div>
						<p className="text-xs text-gray-600">
							Synchronize filtered audio streams directly into MetaBrainz database with your User Token.
						</p>
						<button
							type="button"
							className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
							onClick={() => alert('ListenBrainz User Token configuration dialog ready.')}
						>
							Configure User Token
							<ExternalLink className="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
