
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

// Environment variables needed:
// GITHUB_TOKEN: Personal Access Token with repo scope (for production)
// GITHUB_REPO: "username/repo" (for production)
// NEXT_PUBLIC_SUPABASE_URL: (for local execution context)

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { script } = body;

        if (!script || !['normativa', 'convocatorias'].includes(script)) {
            return NextResponse.json({ error: 'Invalid script name' }, { status: 400 });
        }

        // Determine Mode: Local or Production
        // We assume production if NODE_ENV is production AND we have GitHub credentials
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
            // --- PRODUCTION MODE (GitHub Actions) ---
            const githubToken = process.env.GITHUB_TOKEN;
            const githubRepo = process.env.GITHUB_REPO; // e.g. "robertotr6/rutinas"

            if (!githubToken || !githubRepo) {
                return NextResponse.json({
                    error: 'GitHub credentials not configured for production execution.'
                }, { status: 500 });
            }

            const eventType = `scrape_${script}`; // Matches workflow types

            const response = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    event_type: eventType,
                    client_payload: {
                        triggered_by: 'web_dashboard'
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                return NextResponse.json({ error: `GitHub API Error: ${errorText}` }, { status: response.status });
            }

            return NextResponse.json({
                success: true,
                message: `GitHub Action '${eventType}' triggered successfully. Check Actions tab.`
            });

        } else {
            // --- LOCAL MODE (Child Process) ---

            // Determine script path
            // Assuming scripts are in /scripts at the project root
            const projectRoot = process.cwd();
            const scriptPath = path.join(projectRoot, 'scripts', `scrape_${script}.py`);

            // Command to run python
            // On Windows, it might be 'python' or 'py'. On Mac/Linux 'python3'. 
            // We'll try 'python' as standard for the user's Windows environment.
            const command = `python "${scriptPath}"`;

            return new Promise<NextResponse>((resolve) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        resolve(NextResponse.json({
                            success: false,
                            error: error.message,
                            stderr
                        }, { status: 500 }));
                        return;
                    }

                    resolve(NextResponse.json({
                        success: true,
                        message: 'Script executed successfully (Local)',
                        output: stdout
                    }));
                });
            });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
