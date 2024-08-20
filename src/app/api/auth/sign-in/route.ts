import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return Response.json({ error: "Email and password are required" }, { status: 400 });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ data }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}