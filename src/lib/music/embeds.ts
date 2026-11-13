export type ExternalMusicProvider = "youtube" | "apple";

/** Turn supported share links into embeds on fixed, trusted hosts. */
export function musicEmbed(
  provider: ExternalMusicProvider,
  input: string,
): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port)
    return null;
  if (provider === "youtube") {
    if (
      ![
        "music.youtube.com",
        "www.youtube.com",
        "youtube.com",
        "youtu.be",
      ].includes(url.hostname)
    )
      return null;
    const video =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.pathname === "/watch"
          ? url.searchParams.get("v")
          : null;
    const list = url.searchParams.get("list");
    if (video && /^[\w-]{11}$/.test(video))
      return `https://www.youtube.com/embed/${video}${list && /^[\w-]{10,100}$/.test(list) ? `?list=${list}` : ""}`;
    if (url.pathname === "/playlist" && list && /^[\w-]{10,100}$/.test(list))
      return `https://www.youtube.com/embed?listType=playlist&list=${list}`;
    return null;
  }
  if (
    url.hostname !== "music.apple.com" &&
    url.hostname !== "embed.music.apple.com"
  )
    return null;
  if (
    !/^\/[a-z]{2}\/(album|playlist|song)\/[\w%-]+\/[\w.-]+\/?$/i.test(
      url.pathname,
    )
  )
    return null;
  const song = url.searchParams.get("i");
  if (song && !/^\d+$/.test(song)) return null;
  return `https://embed.music.apple.com${url.pathname}${song ? `?i=${song}` : ""}`;
}
