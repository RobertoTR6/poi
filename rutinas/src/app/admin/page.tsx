
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Loader2, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [logs, setLogs] = useState<{ [key: string]: string }>({});
    const [status, setStatus] = useState<{ [key: string]: 'success' | 'error' | null }>({});

    const runScraper = async (scriptName: string) => {
        setLoading(scriptName);
        setLogs(prev => ({ ...prev, [scriptName]: 'Initiating request...' }));
        setStatus(prev => ({ ...prev, [scriptName]: null }));

        try {
            const response = await fetch('/api/run-scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script: scriptName }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus(prev => ({ ...prev, [scriptName]: 'success' }));
                setLogs(prev => ({
                    ...prev,
                    [scriptName]: data.message + (data.output ? `\n\nOutput:\n${data.output}` : '')
                }));
            } else {
                setStatus(prev => ({ ...prev, [scriptName]: 'error' }));
                setLogs(prev => ({
                    ...prev,
                    [scriptName]: `Error: ${data.error}\n${data.stderr || ''}`
                }));
            }
        } catch (error: any) {
            setStatus(prev => ({ ...prev, [scriptName]: 'error' }));
            setLogs(prev => ({ ...prev, [scriptName]: `Network Error: ${error.message}` }));
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Manage system automations and execute scrapers manually.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Normativa Scraper Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Normativa Scraper
                            {status['normativa'] && (
                                <Badge variant={status['normativa'] === 'success' ? 'default' : 'destructive'}>
                                    {status['normativa'] === 'success' ? 'Success' : 'Failed'}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Extracts latest laws from El Peruano & Gob.pe
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm h-48 overflow-y-auto whitespace-pre-wrap">
                            {logs['normativa'] || <span className="text-slate-500">// Waiting for execution...</span>}
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => runScraper('normativa')}
                            disabled={loading === 'normativa'}
                        >
                            {loading === 'normativa' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Run Scraper
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Convocatorias Scraper Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Convocatorias Scraper
                            {status['convocatorias'] && (
                                <Badge variant={status['convocatorias'] === 'success' ? 'default' : 'destructive'}>
                                    {status['convocatorias'] === 'success' ? 'Success' : 'Failed'}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Scrapes job opportunities from ConvocatoriasCAS & PeruTrabajos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm h-48 overflow-y-auto whitespace-pre-wrap">
                            {logs['convocatorias'] || <span className="text-slate-500">// Waiting for execution...</span>}
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => runScraper('convocatorias')}
                            disabled={loading === 'convocatorias'}
                        >
                            {loading === 'convocatorias' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Run Scraper
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        System Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Supabase Connection: Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-500" />
                            <span>Environment: {process.env.NODE_ENV === 'production' ? 'Production (Cloud)' : 'Development (Local)'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
