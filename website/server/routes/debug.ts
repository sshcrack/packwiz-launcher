import { Elysia } from 'elysia';

// Debug routes for local development
export const debugRoutes = (app: Elysia): Elysia => {
    if (process.env.DEBUG === "true") {
        app.get("*", async ({ set, path }) => {
            const f = await fetch("http://localhost:5173" + path)

            if (!f.ok) {
                set.status = f.status;
                return { error: `Failed to fetch from Vite dev server: ${await f.text()}` };
            }

            return new Response(f.body, {
                headers: f.headers,
                status: f.status
            });
        });
    }

    return app;
};
