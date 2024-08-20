import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { email, password, image } = body;
        console.log(body);

        if (!email || !password) {
            return Response.json({ error: "Email and password are required" }, { status: 400 });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        if (data.user && image) {
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(`${data.user.id}.png`, image);

            if (uploadError) throw uploadError;
        }

        return Response.json({ data }, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}