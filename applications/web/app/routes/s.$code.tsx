import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { shortenedUrls, incrementClickCount } from "@url-shortener/engine";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  const url = await shortenedUrls.get(code);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  // Incrementar contador de clicks en la base de datos
  await incrementClickCount(code);

  return redirect(url);
}
