import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(r"D:\HTR-Control-Center")
DATA = ROOT / "data"

ARTISTS_FILE = DATA / "artists.json"
SONGS_FILE = DATA / "master-songs.json"
RADIO_FILE = DATA / "radio-data.json"

EXCLUDE_ARTIST_IDS = {"lucas-harlow", "neon-thunder"}
EXCLUDE_TITLE_PARTS = {"texxxas tales"}


def read_json(path, default):
    return json.loads(path.read_text(encoding="utf-8-sig")) if path.exists() else default


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def slugify(text):
    text = str(text or "").lower()
    text = text.replace("&", "and")
    text = text.replace("'", "").replace("’", "").replace("‘", "")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def normalize_cover_path(value):
    value = (value or "").strip().strip('"').strip("'").replace("\\", "/")
    if not value:
        return ""
    if value.startswith(("http://", "https://")):
        return value.replace("/main/covers/", "/main/images/covers/")
    value = value.lstrip("./")
    if value.startswith("images/covers/"):
        return value
    if value.startswith("covers/"):
        return "images/covers/" + Path(value).name
    return "images/covers/" + Path(value).name


def repo_slug_for_song(song, artist_lookup):
    artist = artist_lookup.get(song.get("artistId") or "", {})
    repo = (artist.get("githubRepo") or "").strip()
    if "/" in repo:
        return repo.split("/")[-1]

    repo_folder = (artist.get("repoFolder") or artist.get("repoPath") or "").replace("\\", "/").rstrip("/")
    if repo_folder:
        return repo_folder.split("/")[-1]

    return (song.get("artistId") or "").strip()


def raw_github_asset(song, artist_lookup, value):
    value = normalize_cover_path(value)
    if not value:
        return ""
    if value.startswith(("http://", "https://")):
        return value

    repo_slug = repo_slug_for_song(song, artist_lookup)
    if not repo_slug:
        return value

    safe_path = "/".join(quote(part) for part in value.split("/"))
    return f"https://raw.githubusercontent.com/SteveP999/{repo_slug}/main/{safe_path}"


def expected_album_cover(song):
    artist_id = (song.get("artistId") or "").strip()
    album = (song.get("album") or "").strip()
    if not artist_id or not album or album.lower() == "singles":
        return ""
    return f"images/covers/{artist_id}-{slugify(album)}-ALBUM-cover.png"


def song_cover(song):
    return song.get("coverImage") or song.get("cover") or song.get("image") or ""


artists = read_json(ARTISTS_FILE, [])
artist_lookup = {a.get("id", ""): a for a in artists}

tracks = []
for song in read_json(SONGS_FILE, []):
    if song.get("artistId") in EXCLUDE_ARTIST_IDS:
        continue

    title = (song.get("title") or "").lower()
    album = (song.get("album") or "").lower()
    if any(x in title or x in album for x in EXCLUDE_TITLE_PARTS):
        continue

    if not song.get("includeOnRadio", True):
        continue

    audio = song.get("audioFile") or song.get("audioSrc") or song.get("audio") or ""
    if not audio:
        continue

    local_song_cover = song_cover(song)
    local_album_cover = song.get("albumCover") or expected_album_cover(song)

    song_cover_url = raw_github_asset(song, artist_lookup, local_song_cover)
    album_cover_url = raw_github_asset(song, artist_lookup, local_album_cover)

    cover_url = song_cover_url or album_cover_url

    tracks.append({
        "id": song.get("id", ""),
        "artist": song.get("artist", ""),
        "artistId": song.get("artistId", ""),
        "title": song.get("title", ""),
        "album": song.get("album", ""),
        "genre": song.get("genre", ""),
        "coverImage": cover_url,
        "cover": cover_url,
        "albumCover": album_cover_url or cover_url,
        "albumArt": album_cover_url or cover_url,
        "audioFile": audio,
        "audioSrc": audio,
        "youtubeUrl": song.get("youtubeUrl", ""),
        "videos": song.get("videos", []),
        "explicit": song.get("explicit", False),
        "tags": song.get("tags", [])
    })

write_json(RADIO_FILE, tracks)

print("radio-data.json generated.")
print(f"Tracks: {len(tracks)}")
print("HTR Records homepage radio fields written: coverImage, cover, albumCover, albumArt, audioFile, audioSrc")
