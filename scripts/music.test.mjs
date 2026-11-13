import test from "node:test";
import assert from "node:assert/strict";
import { musicEmbed } from "../src/lib/music/embeds.ts";

test("YouTube music links produce trusted video and playlist embeds", () => {
  assert.equal(
    musicEmbed(
      "youtube",
      "https://music.youtube.com/watch?v=abcdefghijk&list=PL1234567890",
    ),
    "https://www.youtube.com/embed/abcdefghijk?list=PL1234567890",
  );
  assert.equal(
    musicEmbed(
      "youtube",
      "https://music.youtube.com/playlist?list=PL1234567890",
    ),
    "https://www.youtube.com/embed?listType=playlist&list=PL1234567890",
  );
  assert.equal(
    musicEmbed(
      "youtube",
      "https://music.youtube.com.evil.test/watch?v=abcdefghijk",
    ),
    null,
  );
  assert.equal(
    musicEmbed("youtube", "https://music.youtube.com/watch?v=bad"),
    null,
  );
});
test("Apple Music links preserve selected songs and reject untrusted hosts", () => {
  assert.equal(
    musicEmbed(
      "apple",
      "https://music.apple.com/us/album/example/12345?i=6789",
    ),
    "https://embed.music.apple.com/us/album/example/12345?i=6789",
  );
  assert.equal(
    musicEmbed("apple", "https://music.apple.com/us/playlist/example/pl.12345"),
    "https://embed.music.apple.com/us/playlist/example/pl.12345",
  );
  assert.equal(
    musicEmbed(
      "apple",
      "https://music.apple.com.evil.test/us/album/example/12345",
    ),
    null,
  );
  assert.equal(
    musicEmbed("apple", "http://music.apple.com/us/album/example/12345"),
    null,
  );
});
