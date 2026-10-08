import { useState } from 'react';
import { Radio, KeyRound, Sliders } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StatusPage from './pages/StatusPage';
import TokenPage from './pages/TokenPage';
import RulesPage from './pages/RulesPage';

type TabType = 'status' | 'token' | 'rules';

const navItems = [
	{ id: 'status' as TabType, label: 'Current Status', icon: Radio },
	{ id: 'token' as TabType, label: 'API & Tokens', icon: KeyRound },
	{ id: 'rules' as TabType, label: 'Scrobble Rules', icon: Sliders },
];

export default function App() {
	const [activeTab, setActiveTab] = useState<TabType>('status');

	return (
		<div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
			<header className="">
				<div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
					<h1 className="text-xl font-bold tracking-tight">NekoFM</h1>
				</div>
			</header>

			<Tabs
				value={activeTab}
				onValueChange={(v) => setActiveTab(v as TabType)}
				className="flex flex-1 flex-col gap-0"
			>
				<div className="">
					<div >
						<TabsList variant="line" className="w-full justify-start gap-0 rounded-none bg-transparent p-0">
							{navItems.map((tab) => {
								const Icon = tab.icon;
								return (
									<TabsTrigger
										key={tab.id}
										value={tab.id}
										className=""
									>
										<Icon className="h-4 w-4" />
										<span>{tab.label}</span>
									</TabsTrigger>
								);
							})}
						</TabsList>
					</div>
				</div>

				<main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6 lg:p-8">
					<TabsContent value="status" className="mt-0">
						<StatusPage />
					</TabsContent>
					<TabsContent value="token" className="mt-0">
						<TokenPage />
					</TabsContent>
					<TabsContent value="rules" className="mt-0">
						<RulesPage />
					</TabsContent>
				</main>
			</Tabs>
		</div>
	);
}