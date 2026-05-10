import json
import shutil
import re
from pathlib import Path

ROOT = Path(r"D:\HTR-Control-Center")
DATA = ROOT / "data"
ARTISTS_FILE = DATA / "artists.json"
SONGS_FILE = DATA / "master-songs.json"

LABEL_REPO_CANDIDATES = [
    Path(r"D:\Hello-Texas-Records"),
    Path(r"D:\HELLO TEXAS RECORDS"),
    Path(r"D:\hello-texas-records"),
]
ROSTER_FOLDER_NAME = "Roster Photos"

THEMES = {
    "warm_country": {
        "font_head": "Bebas Neue", "font_body": "Barlow", "font_alt": "Barlow Condensed",
        "google": "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap",
        "black":"#0A0805", "ink":"#131009", "deep":"#1A1510", "mid":"#221C12",
        "accent":"#C8922A", "accent_lite":"#E8AD4A", "cream":"#F2EBD8", "muted":"#8A7E68", "white":"#F8F2E4",
        "title_transform":"uppercase", "hero_filter":"brightness(.42)", "radius":"0px"
    },
    "rose_alt": {
        "font_head": "Lora", "font_body": "Nunito Sans", "font_alt": "Lora",
        "google": "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Nunito+Sans:wght@300;400;600&display=swap",
        "black":"#070508", "ink":"#0E0A0D", "deep":"#150F14", "mid":"#1C1318",
        "accent":"#C06878", "accent_lite":"#D88898", "cream":"#F4EAE8", "muted":"#806870", "white":"#FBF3F2",
        "title_transform":"none", "hero_filter":"brightness(.40)", "radius":"0px"
    },
    "worship_gold": {
        "font_head": "Cormorant Garamond", "font_body": "Montserrat", "font_alt": "Cormorant Garamond",
        "google": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap",
        "black":"#080709", "ink":"#111013", "deep":"#0D0C10", "mid":"#151318",
        "accent":"#C8A84B", "accent_lite":"#E2C97A", "cream":"#F0E8D8", "muted":"#9B93A8", "white":"#F5F2EC",
        "title_transform":"none", "hero_filter":"brightness(.45)", "radius":"0px"
    },
    "blue_edm": {
        "font_head": "Rajdhani", "font_body": "Inter", "font_alt": "Rajdhani",
        "google": "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap",
        "black":"#020408", "ink":"#060C14", "deep":"#08101C", "mid":"#0C1826",
        "accent":"#6FD3FF", "accent_lite":"#A8E8FF", "cream":"#C8D8E8", "muted":"#4A6480", "white":"#E8F4FF",
        "title_transform":"uppercase", "hero_filter":"brightness(.38)", "radius":"0px"
    },
    "violet_indie": {
        "font_head": "DM Serif Display", "font_body": "DM Sans", "font_alt": "DM Serif Display",
        "google": "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap",
        "black":"#06070C", "ink":"#0C0D14", "deep":"#10111A", "mid":"#161820",
        "accent":"#7C6FA0", "accent_lite":"#A99DC8", "cream":"#D4D6E4", "muted":"#5C5F72", "white":"#EEEEF6",
        "title_transform":"none", "hero_filter":"brightness(.45)", "radius":"0px"
    },
    "soft_rock": {
        "font_head": "Cinzel Decorative", "font_body": "Special Elite", "font_alt": "Cinzel",
        "google": "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700;900&family=Special+Elite&display=swap",
        "black":"#070604", "ink":"#100C09", "deep":"#17110B", "mid":"#20160E",
        "accent":"#B9473D", "accent_lite":"#E8C89A", "cream":"#D9C7AC", "muted":"#8F7158", "white":"#F3E5CE",
        "title_transform":"uppercase", "hero_filter":"brightness(.32) contrast(1.1) sepia(.22)", "radius":"0px"
    },
    "latin_orange": {
        "font_head": "Syne", "font_body": "Inter", "font_alt": "Syne",
        "google": "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap",
        "black":"#080404", "ink":"#120A06", "deep":"#1A0E08", "mid":"#221408",
        "accent":"#E07D3A", "accent_lite":"#F0A060", "cream":"#F4EAD8", "muted":"#78604A", "white":"#FBF4EA",
        "title_transform":"none", "hero_filter":"brightness(.45)", "radius":"0px"
    },
    "swing_gold": {
        "font_head": "Playfair Display", "font_body": "EB Garamond", "font_alt": "Lato",
        "google": "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=EB+Garamond:ital,wght@0,400;1,400&family=Lato:wght@300;400;700&display=swap",
        "black":"#060403", "ink":"#0E0B08", "deep":"#141008", "mid":"#1C1510",
        "accent":"#C8A050", "accent_lite":"#E8C878", "cream":"#F0E8D0", "muted":"#786050", "white":"#F8F0E0",
        "title_transform":"uppercase", "hero_filter":"brightness(.35) sepia(.25)", "radius":"0px"
    },
    "new_age_blue": {
        "font_head": "Cormorant Garamond", "font_body": "Jost", "font_alt": "Cormorant Garamond",
        "google": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400&display=swap",
        "black":"#07090F", "ink":"#0D1220", "deep":"#141C2E", "mid":"#1A2440",
        "accent":"#7BA3CC", "accent_lite":"#A8C4DF", "cream":"#CDD8E8", "muted":"#8A9BB0", "white":"#EEF2F7",
        "title_transform":"none", "hero_filter":"brightness(.48)", "radius":"4px"
    },
    "night_rock": {
        "font_head": "Anton", "font_body": "Barlow", "font_alt": "Barlow Condensed",
        "google": "https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400&display=swap",
        "black":"#030508", "ink":"#060B14", "deep":"#080E1C", "mid":"#0C1428",
        "accent":"#D4902A", "accent_lite":"#EAB050", "cream":"#E8E0D0", "muted":"#505870", "white":"#F4F0E8",
        "title_transform":"uppercase", "hero_filter":"brightness(.32) contrast(1.08)", "radius":"0px"
    }
}

DEFAULT_THEME = "warm_country"

def read_json(path, default):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8-sig"))
    return default

def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", str(text).lower()).strip("-")

def repo_path(artist):
    if artist.get("repoFolder") or artist.get("repoPath"):
        return Path(artist.get("repoFolder") or artist.get("repoPath"))
    repo = artist.get("githubRepo", "")
    return Path(r"D:\{}".format(repo.split("/")[-1])) if "/" in repo else None

def normalize_cover_path(value):
    value = (value or "").strip().replace("\\", "/")
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

def videos_for(song):
    if isinstance(song.get("videos"), list):
        return song.get("videos")
    y = (song.get("youtubeUrl") or song.get("videoUrl") or "").strip()
    return [{"title": "Official Video", "youtube": y}] if y else []

def song_out(song, artist_name, idx):
    cover = normalize_cover_path(song.get("coverImage") or song.get("cover") or song.get("image"))
    album_cover = normalize_cover_path(song.get("albumCover") or cover)
    audio = song.get("audioFile") or song.get("audioSrc") or song.get("audio") or ""
    return {
        "id": song.get("id") or slugify(f"{artist_name}-{song.get('title','song')}"),
        "num": str(song.get("num") or idx + 1).zfill(2),
        "title": song.get("title", ""),
        "artist": artist_name,
        "album": song.get("album") or "Singles",
        "albumCover": album_cover,
        "type": song.get("releaseType") or song.get("type") or "Single",
        "isLatest": bool(song.get("featured") or song.get("isLatest")),
        "cover": cover,
        "audio": audio,
        "audioSrc": audio,
        "videos": videos_for(song),
        "includeOnRadio": bool(song.get("includeOnRadio", True)),
        "includeOnHomepage": bool(song.get("includeOnHomepage", False)),
        "explicit": bool(song.get("explicit", False)),
        "tags": song.get("tags") or []
    }

def make_latest(name, songs):
    latest = next((s for s in songs if s.get("isLatest")), None) or (songs[0] if songs else {})
    return {
        "title": latest.get("title", "New Music Coming Soon"),
        "artist": name,
        "album": latest.get("album", ""),
        "type": "Latest Single",
        "cover": latest.get("cover", ""),
        "image": latest.get("cover", ""),
        "audio": latest.get("audio", ""),
        "audioSrc": latest.get("audio", ""),
        "videos": latest.get("videos", [])
    }

def make_radio(name, songs):
    playable = [s for s in songs if s.get("audio") and s.get("includeOnRadio", True)]
    featured = next((s for s in songs if s.get("isLatest") and s.get("audio")), None) or (playable[0] if playable else (songs[0] if songs else {}))
    return {
        "artist": name,
        "latestUrl": "latest.json",
        "featuredTrack": {
            "title": featured.get("title", ""),
            "artist": name,
            "album": featured.get("album", ""),
            "cover": featured.get("cover", ""),
            "audioSrc": featured.get("audio", ""),
            "videos": featured.get("videos", [])
        },
        "tracks": [
            {
                "title": s.get("title", ""),
                "artist": name,
                "album": s.get("album", ""),
                "cover": s.get("cover", ""),
                "audioSrc": s.get("audio", ""),
                "videos": s.get("videos", [])
            }
            for s in playable
        ]
    }

def find_label_repo():
    for root in LABEL_REPO_CANDIDATES:
        if (root / ROSTER_FOLDER_NAME).exists():
            return root
    return LABEL_REPO_CANDIDATES[0]

def roster_photo_disk_path(artist_id):
    return find_label_repo() / ROSTER_FOLDER_NAME / f"{artist_id}-roster-photo.png"

def label_asset_source_path(artist_id, suffix):
    return find_label_repo() / ROSTER_FOLDER_NAME / f"{artist_id}-{suffix}.png"

def local_artist_asset_url(artist_id, suffix):
    return f"images/artist/{artist_id}-{suffix}.png"

def local_artist_asset_path(repo, artist_id, suffix):
    return repo / "images" / "artist" / f"{artist_id}-{suffix}.png"

def copy_roster_assets_to_artist_repo(repo, artist_id):
    """
    Source of truth stays in:
      D:\hello-texas-records\Roster Photos\

    Published artist site assets are copied into:
      D:\<ArtistRepo>\images\artist\

    This makes GitHub Pages work while keeping Steve's workflow centralized.
    """
    copied = []
    missing = []
    (repo / "images" / "artist").mkdir(parents=True, exist_ok=True)

    for suffix in ["hero-photo", "discography-bg", "video-bg", "about-bg", "photo-1", "photo-2", "photo-3"]:
        src = label_asset_source_path(artist_id, suffix)
        dst = local_artist_asset_path(repo, artist_id, suffix)
        if src.exists():
            shutil.copy2(src, dst)
            copied.append(str(dst))
        else:
            missing.append(str(src))
    return copied, missing

def ensure_gitignore(repo):
    gi = repo / ".gitignore"
    lines = []
    if gi.exists():
        lines = gi.read_text(encoding="utf-8", errors="ignore").splitlines()
    if "update-log.txt" not in lines:
        lines.append("update-log.txt")
    gi.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")

def update_bat(repo_name, repo_url):
    return '@echo off\ncd /d "%~dp0"\npowershell -NoExit -ExecutionPolicy Bypass -File "%~dp0update.ps1"\n'

def update_ps1(repo_name, repo_url):
    return f"""$ErrorActionPreference = "Stop"

$RepoName = "{repo_name}"
$RepoUrl = "{repo_url or ''}"
$LogPath = Join-Path $PSScriptRoot "update-log.txt"

function Write-Both($Text) {{
    Write-Host $Text
    Add-Content -Path $LogPath -Value $Text
}}

Set-Content -Path $LogPath -Value @(
"==========================================",
"HTR Update - $RepoName",
"==========================================",
"Running from: $PSScriptRoot",
""
)

try {{
    Set-Location $PSScriptRoot
    Write-Both "Checking Git..."
    $git = Get-Command git -ErrorAction SilentlyContinue
    if (-not $git) {{ throw "Git is not installed or not available in PATH." }}

    if (-not (Test-Path ".git")) {{
        Write-Both "No .git folder found. Initializing repo..."
        git init | Tee-Object -FilePath $LogPath -Append
        git branch -M main | Tee-Object -FilePath $LogPath -Append
        git remote add origin $RepoUrl | Tee-Object -FilePath $LogPath -Append
    }} else {{
        Write-Both "Existing .git folder found."
        $remote = ""
        try {{ $remote = git remote get-url origin }} catch {{ $remote = "" }}
        if ([string]::IsNullOrWhiteSpace($remote)) {{
            Write-Both "No origin remote found. Adding origin..."
            git remote add origin $RepoUrl | Tee-Object -FilePath $LogPath -Append
        }} elseif ($remote.Trim() -ne $RepoUrl) {{
            Write-Both "Origin remote is wrong. Replacing it."
            git remote set-url origin $RepoUrl | Tee-Object -FilePath $LogPath -Append
        }}
        git branch -M main | Tee-Object -FilePath $LogPath -Append
    }}

    Write-Both ""
    Write-Both "Fetching remote..."
    git fetch origin main | Tee-Object -FilePath $LogPath -Append

    Write-Both ""
    Write-Both "Syncing remote before commit..."
    git pull origin main --allow-unrelated-histories --no-rebase -X ours | Tee-Object -FilePath $LogPath -Append

    Write-Both ""
    Write-Both "Making update-log.txt local-only going forward..."
    Set-Content -Path ".gitignore" -Value "update-log.txt"

    Write-Both ""
    Write-Both "Staging files..."
    git add -A | Tee-Object -FilePath $LogPath -Append

    Write-Both ""
    Write-Both "Git status:"
    git status | Tee-Object -FilePath $LogPath -Append

    $changes = git status --porcelain
    if ($changes) {{
        Write-Both ""
        $msg = Read-Host "Commit message (Enter = update artist site)"
        if ([string]::IsNullOrWhiteSpace($msg)) {{ $msg = "update artist site" }}
        Write-Both "Committing..."
        git commit -m $msg | Tee-Object -FilePath $LogPath -Append
    }} else {{
        Write-Both "No changes to commit."
    }}

    Write-Both ""
    Write-Both "Pushing to GitHub..."
    git push -u origin main | Tee-Object -FilePath $LogPath -Append
    Write-Both ""
    Write-Both "SUCCESS: $RepoName pushed to GitHub."
}}
catch {{
    Write-Both ""
    Write-Both "ERROR:"
    Write-Both $_.Exception.Message
    Write-Both ""
    Write-Both "See update-log.txt in this folder."
}}
Write-Host ""
Read-Host "Press Enter to close"
"""

def theme_for_artist(artist):
    raw = (artist.get("theme") or artist.get("styleTheme") or artist.get("siteTheme") or "").strip()
    if raw in THEMES:
        return raw, THEMES[raw]
    genre = (artist.get("genre") or "").lower()
    name = (artist.get("name") or "").lower()
    if "edm" in genre or "electronic" in genre or "skyline" in name:
        key = "blue_edm"
    elif "worship" in genre or "christian" in genre or "parsons cross" in name:
        key = "worship_gold"
    elif "vincent" in name or "swing" in genre or "big band" in genre:
        key = "swing_gold"
    elif "new age" in genre or "instrumental" in genre or "lucas" in name:
        key = "new_age_blue"
    elif "latin" in genre or "rio" in name:
        key = "latin_orange"
    elif "alternative" in genre or "indie" in genre or "ivey" in name or "silent" in name:
        key = "rose_alt" if "ivey" in name else "violet_indie"
    elif "rock" in genre or "night" in name or "vanta" in name:
        key = "night_rock"
    elif "soft rock" in genre or "adult contemporary" in genre or "borrowed" in name or "daniel" in name:
        key = "soft_rock"
    else:
        key = DEFAULT_THEME
    return key, THEMES[key]

def render_index(artist, songs):
    name = artist.get("name", "Artist")
    artist_id = artist.get("id", slugify(name))
    genre = artist.get("genre", "")
    tagline = artist.get("tagline") or artist.get("bio") or f"{name} is part of the Hello Texas Records roster."
    bio = artist.get("bio") or tagline
    theme_key, theme = theme_for_artist(artist)
    latest = make_latest(name, songs)
    has_video_section = not bool(artist.get("noVideoSection", False))

    logo_path = artist.get("logo") or f"images/logos/{artist_id}-logo.png"

    hero_path = artist.get("hero") or local_artist_asset_url(artist_id, "hero-photo")
    discography_bg_path = artist.get("discographyBg") or local_artist_asset_url(artist_id, "discography-bg")
    video_bg_path = artist.get("videoBg") or local_artist_asset_url(artist_id, "video-bg")
    about_bg_path = artist.get("aboutBg") or local_artist_asset_url(artist_id, "about-bg")
    photo_paths = [
        artist.get("photo1") or local_artist_asset_url(artist_id, "photo-1"),
        artist.get("photo2") or local_artist_asset_url(artist_id, "photo-2"),
        artist.get("photo3") or local_artist_asset_url(artist_id, "photo-3"),
    ]

    data = {
        "artist": {
            "id": artist_id, "name": name, "genre": genre, "tagline": tagline, "bio": bio,
            "theme": theme_key, "logo": logo_path, "hero": hero_path,
            "discographyBg": discography_bg_path, "videoBg": video_bg_path, "aboutBg": about_bg_path,
            "photos": photo_paths
        },
        "latest": latest,
        "songs": songs,
        "hasVideoSection": has_video_section
    }
    data_json = json.dumps(data, ensure_ascii=False)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4PCFSEQJZ1"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){{dataLayer.push(arguments);}}
gtag('js', new Date());
gtag('config', 'G-4PCFSEQJZ1');
</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{name} — {genre}</title>
<link rel="manifest" href="manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="{theme['google']}" rel="stylesheet">
<style>
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
:root{{
--black:{theme['black']};--ink:{theme['ink']};--deep:{theme['deep']};--mid:{theme['mid']};
--accent:{theme['accent']};--accent-lt:{theme['accent_lite']};--cream:{theme['cream']};--muted:{theme['muted']};--white:{theme['white']};
--accent-glow:color-mix(in srgb, var(--accent) 30%, transparent);
--line:color-mix(in srgb, var(--accent) 34%, transparent);
--faded-line:color-mix(in srgb, var(--accent) 16%, transparent);
--discography-bg:url('{discography_bg_path}');
--video-bg:url('{video_bg_path}');
--about-bg:url('{about_bg_path}');
--radius:{theme['radius']};
}}
html{{scroll-behavior:smooth}}
body{{
  background:var(--black);
  color:var(--cream);
  font-family:'{theme['font_body']}',sans-serif;
  font-weight:300;
  font-size:15px;
  line-height:1.75;
  overflow-x:hidden;
}}
body::before{{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:0;
  opacity:.16;
  background:
    radial-gradient(circle at 50% 8%, var(--accent-glow), transparent 34%),
    radial-gradient(circle at 12% 82%, rgba(255,255,255,.04), transparent 25%),
    radial-gradient(circle at 90% 60%, var(--accent-glow), transparent 28%);
}}
body::after{{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:0;
  opacity:.10;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E");
  background-size:220px 220px;
}}
a{{color:inherit}}
#topnav{{
  position:fixed;
  top:0;left:0;right:0;
  z-index:100;
  height:64px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 2rem;
  background:rgba(0,0,0,.68);
  border-bottom:1px solid var(--faded-line);
  backdrop-filter:blur(14px);
}}
.nav-left,.nav-right{{display:flex;align-items:center;gap:2rem;list-style:none}}
.nav-left a,.nav-right a{{
  color:var(--cream);
  opacity:.86;
  text-decoration:none;
  font-family:'{theme['font_alt']}',serif;
  font-size:.78rem;
  letter-spacing:.21em;
  text-transform:uppercase;
  transition:color .2s,opacity .2s;
}}
.nav-left a:hover,.nav-right a:hover{{color:var(--accent-lt);opacity:1}}

.stage{{
  position:relative;
  min-height:78vh;
  overflow:hidden;
  border-bottom:1px solid var(--faded-line);
  background:var(--black);
}}
.stage-bg{{
  position:absolute;
  inset:0;
  background-image:url('{hero_path}');
  background-size:cover;
  background-position:center 44%;
  background-repeat:no-repeat;
  filter:{theme['hero_filter']};
  transform:scale(1.035);
}}
.stage-bg::after{{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(to bottom,rgba(0,0,0,.56) 0%,rgba(0,0,0,.22) 38%,rgba(0,0,0,.52) 78%,rgba(0,0,0,.86) 100%),
    radial-gradient(ellipse 68% 40% at 50% 28%,rgba(255,255,255,.16),transparent 62%),
    linear-gradient(to right,rgba(0,0,0,.44),transparent 28%,transparent 72%,rgba(0,0,0,.48));
}}
.stage-inner{{
  position:relative;
  z-index:2;
  min-height:78vh;
  display:flex;
  flex-direction:column;
  justify-content:flex-start;
  align-items:center;
  text-align:center;
  padding:6.5rem 2rem 2.6rem;
}}
.stage-logo img{{
  width:min(1080px,96vw);
  max-height:390px;
  object-fit:contain;
  mix-blend-mode:screen;
  filter:brightness(1.36) drop-shadow(0 0 36px rgba(0,0,0,.85));
}}
.stage-title-fallback{{
  display:none;
  font-family:'{theme['font_head']}',serif;
  font-size:clamp(4rem,9vw,8rem);
  line-height:.95;
  color:var(--white);
  text-transform:{theme['title_transform']};
  letter-spacing:.06em;
  margin-bottom:1.2rem;
}}
.stage-tag{{
  margin-top:.85rem;
  color:var(--accent);
  font-family:'{theme['font_alt']}',serif;
  font-size:.72rem;
  letter-spacing:.36em;
  text-transform:uppercase;
}}
.stage-tagline{{
  max-width:760px;
  margin:.7rem auto 1.25rem;
  color:var(--cream);
  font-family:'{theme['font_head']}',serif;
  font-size:clamp(1.1rem,2vw,1.65rem);
  font-style:italic;
  opacity:.94;
  line-height:1.42;
}}
.stage-actions{{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}}
.cta-primary,.latest-play-btn,.track-play-btn,.video-btn{{cursor:pointer}}
.cta-primary{{
  background:var(--accent);
  color:var(--black);
  border:none;
  padding:.86rem 2.15rem;
  font-family:'{theme['font_alt']}',serif;
  font-size:.8rem;
  font-weight:700;
  letter-spacing:.18em;
  text-transform:uppercase;
  transition:background .2s,transform .15s;
}}
.cta-primary:hover{{background:var(--accent-lt);transform:translateY(-1px)}}
.cta-secondary{{
  background:rgba(0,0,0,.24);
  color:var(--cream);
  border:1px solid var(--line);
  padding:.86rem 2.15rem;
  text-decoration:none;
  display:inline-block;
  font-family:'{theme['font_alt']}',serif;
  font-size:.8rem;
  letter-spacing:.18em;
  text-transform:uppercase;
  transition:border-color .2s,color .2s,background .2s;
}}
.cta-secondary:hover{{border-color:var(--accent);color:var(--accent-lt);background:rgba(0,0,0,.42)}}

.section-header{{position:relative;text-align:center;padding:3.7rem 2rem 2.25rem;z-index:1}}
.section-eyebrow{{
  font-family:'{theme['font_alt']}',serif;
  font-size:.66rem;
  letter-spacing:.32em;
  text-transform:uppercase;
  color:var(--accent);
  margin-bottom:.85rem;
}}
.section-title{{font-family:'{theme['font_head']}',serif;font-size:clamp(2.1rem,4vw,3.5rem);font-weight:400;color:var(--white);text-transform:{theme['title_transform']};letter-spacing:.045em}}
.rule{{width:78px;height:1px;background:linear-gradient(to right,transparent,var(--accent),transparent);margin:1rem auto 0;opacity:.88}}

#latest-single{{
  position:relative;
  background:var(--mid);
  padding:2.2rem 0;
  border-top:1px solid var(--faded-line);
  border-bottom:1px solid var(--faded-line);
  z-index:1;
}}
.latest-inner{{max-width:1080px;margin:0 auto;padding:0 2.5rem;display:grid;grid-template-columns:210px 1fr;gap:2.25rem;align-items:center}}
.latest-cover{{width:100%;aspect-ratio:1;object-fit:cover;display:block;border-radius:var(--radius);box-shadow:0 0 36px var(--accent-glow),0 18px 46px rgba(0,0,0,.75)}}
.latest-badge,.album-badge{{font-family:'{theme['font_alt']}',serif;display:inline-block;font-size:.58rem;letter-spacing:.25em;text-transform:uppercase;color:var(--accent);border:1px solid var(--line);padding:.28rem .85rem;margin-bottom:.9rem}}
.latest-title{{font-family:'{theme['font_head']}',serif;font-size:clamp(1.8rem,3.3vw,2.75rem);font-weight:400;color:var(--white);line-height:1.08;margin-bottom:.25rem;text-transform:{theme['title_transform']}}}
.latest-sub,.album-artist{{font-family:'{theme['font_alt']}',serif;font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-bottom:1.35rem}}
.latest-play-btn{{display:inline-flex;align-items:center;gap:.75rem;background:transparent;color:var(--accent);border:1px solid var(--line);padding:.75rem 1.8rem;font-family:'{theme['font_alt']}',serif;font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;transition:border-color .2s,background .2s}}
.latest-play-btn:hover{{background:var(--accent-glow)}}

#albums{{
  position:relative;
  z-index:1;
  padding-bottom:0;
  background:
    linear-gradient(to bottom,rgba(0,0,0,.46),rgba(0,0,0,.58)),
    var(--discography-bg) center center / cover fixed no-repeat,
    var(--black);
  border-top:1px solid var(--faded-line);
}}
.discography-header{{text-align:center;padding:4rem 2rem 2.6rem;border-top:1px solid var(--faded-line)}}

.album-detail-section{{padding:0 0 0}}
.album-stage{{
  position:relative;
  padding:3.2rem 0 2.4rem;
  border-top:1px solid var(--faded-line);
}}
.album-layout{{
  max-width:1180px;
  margin:0 auto;
  padding:0 2.5rem;
  display:grid;
  grid-template-columns:300px 1fr;
  gap:3.2rem;
  align-items:center;
}}
.album-layout.reverse{{direction:rtl}}
.album-layout.reverse>*{{direction:ltr}}
.album-cover{{width:100%;aspect-ratio:1;object-fit:cover;display:block;border-radius:var(--radius);box-shadow:0 0 34px var(--accent-glow),0 18px 54px rgba(0,0,0,.75)}}
.album-title{{font-family:'{theme['font_head']}',serif;font-size:clamp(1.8rem,3vw,2.6rem);font-weight:400;color:var(--white);line-height:1.15;margin-bottom:.4rem;text-transform:{theme['title_transform']}}}
.track-solid-bar{{
  background:linear-gradient(135deg,var(--mid),var(--ink));
  border-top:1px solid var(--faded-line);
  border-bottom:1px solid var(--faded-line);
  padding:2.2rem 0 2.7rem;
}}
.trackbar-inner{{
  max-width:1180px;
  margin:0 auto;
  padding:0 2.5rem;
}}
.tracklist{{border-top:1px solid color-mix(in srgb,var(--accent) 12%, transparent)}}
.track-row{{display:grid;grid-template-columns:2rem 1fr auto auto;align-items:center;gap:.75rem;padding:.8rem 0;border-bottom:1px solid color-mix(in srgb,var(--accent) 7%, transparent);transition:background .2s}}
.track-row:hover{{background:color-mix(in srgb,var(--accent) 5%, transparent)}}
.track-num{{font-family:'{theme['font_alt']}',serif;font-size:.68rem;color:var(--muted);opacity:.45;text-align:right}}
.track-title{{font-size:.92rem;color:var(--cream)}}
.track-badge{{font-family:'{theme['font_alt']}',serif;font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;padding:.18rem .55rem;color:var(--accent);border:1px solid var(--line)}}
.track-play-btn{{background:transparent;border:1px solid var(--line);color:var(--accent);width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:.6rem;flex-shrink:0;transition:background .2s,border-color .2s}}
.track-play-btn:hover,.track-play-btn.playing{{background:var(--accent-glow);border-color:var(--accent-lt)}}

.album-track-art-heading{{
  font-family:'{theme['font_alt']}',serif;
  font-size:.72rem;
  letter-spacing:.32em;
  text-transform:uppercase;
  color:var(--accent);
  margin-bottom:1.35rem;
  text-align:center;
}}
.release-wall{{
  width:100%;
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(210px,240px));
  justify-content:center;
  gap:1.7rem;
}}
.release-card{{cursor:pointer;max-width:240px;text-align:center}}
.release-art{{position:relative;aspect-ratio:1;border:1px solid var(--faded-line);overflow:hidden;background:var(--black);box-shadow:0 16px 42px rgba(0,0,0,.46)}}
.release-art img{{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.9);transition:transform .35s,filter .35s}}
.release-card:hover img{{transform:scale(1.04);filter:brightness(1)}}
.release-overlay{{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0);transition:background .25s}}
.release-card:hover .release-overlay{{background:rgba(0,0,0,.32)}}
.release-play{{width:48px;height:48px;border:2px solid var(--accent);background:rgba(0,0,0,.65);color:var(--accent);display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.86);transition:opacity .25s,transform .25s}}
.release-card:hover .release-play{{opacity:1;transform:scale(1)}}
.release-title{{font-family:'{theme['font_head']}',serif;font-size:1.08rem;color:var(--white);line-height:1.15;margin-top:.85rem;text-transform:{theme['title_transform']}}}
.release-album{{font-family:'{theme['font_alt']}',serif;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:.25rem}}

.lower-video-section{{
  position:relative;
  z-index:1;
  padding:0 0 4rem;
  border-top:1px solid var(--faded-line);
  background:
    linear-gradient(to bottom,rgba(0,0,0,.42),rgba(0,0,0,.56)),
    var(--video-bg) center center / cover fixed no-repeat,
    var(--black);
}}
.video-card-bar{{
  background:linear-gradient(135deg,var(--mid),var(--ink));
  border-top:1px solid var(--faded-line);
  border-bottom:1px solid var(--faded-line);
  padding:2.4rem 0;
}}
.feature-video{{position:relative;z-index:3;width:min(920px,86vw);margin:0 auto}}
.video-panel{{background:rgba(0,0,0,.32);border:1px solid var(--line);box-shadow:0 22px 80px rgba(0,0,0,.60);backdrop-filter:blur(3px)}}
.video-thumb{{position:relative;display:none;aspect-ratio:16/9;overflow:hidden;background:#000;cursor:pointer}}
.video-thumb.has-video{{display:block}}
.video-thumb img{{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.88);transition:filter .25s,transform .35s}}
.video-thumb:hover img{{filter:brightness(1);transform:scale(1.02)}}
.video-play-overlay{{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.18)}}
.video-play-circle{{width:76px;height:76px;border-radius:50%;background:transparent;border:2px solid var(--accent);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:1.55rem;padding-left:5px;box-shadow:0 0 24px var(--accent-glow)}}
.video-coming-soon{{display:none;color:var(--cream);padding:4rem 2rem;min-height:230px;align-items:center;justify-content:center;flex-direction:column;background:linear-gradient(to bottom,rgba(0,0,0,.05),rgba(0,0,0,.34))}}
.video-coming-soon.visible{{display:flex}}
.video-coming-soon .play-triangle{{width:0;height:0;border-top:28px solid transparent;border-bottom:28px solid transparent;border-left:46px solid var(--accent);opacity:.9;margin-bottom:1.6rem;filter:drop-shadow(0 0 18px var(--accent-glow))}}
.video-coming-soon strong{{font-family:'{theme['font_head']}',serif;font-size:1.65rem;font-weight:400;color:var(--white);margin-bottom:.55rem;text-transform:{theme['title_transform']}}}
.video-coming-soon span{{color:var(--muted);font-size:.92rem;max-width:560px;text-align:center}}

#bio{{
  position:relative;
  background:
    linear-gradient(to bottom,rgba(0,0,0,.46),rgba(0,0,0,.62)),
    var(--about-bg) center center / cover fixed no-repeat,
    var(--black);
  padding-bottom:4rem;
  border-bottom:1px solid var(--faded-line);
  z-index:1;
}}
.bio-inner{{max-width:780px;margin:0 auto;padding:0 2rem;text-align:center}}
.bio-logo{{margin-bottom:2rem}}
.bio-logo img{{height:180px;max-width:min(900px,94vw);object-fit:contain;mix-blend-mode:screen;filter:brightness(1.22) drop-shadow(0 0 22px var(--accent-glow))}}
.bio-inner p{{background:linear-gradient(135deg,rgba(0,0,0,.52),rgba(0,0,0,.34));border:1px solid var(--faded-line);padding:1.5rem;color:var(--cream);line-height:1.95;font-size:1.02rem;margin-bottom:1.2rem}}

.photo-strip{{display:grid;grid-template-columns:repeat(3,1fr);height:360px;overflow:hidden;border-top:1px solid var(--line)}}
.photo-strip img{{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.82) saturate(.92);transition:filter .4s,transform .5s}}
.photo-strip img:hover{{filter:brightness(1) saturate(1);transform:scale(1.03)}}
.photo-strip img.missing{{display:none}}
.photo-strip.empty{{display:none}}

#player{{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:color-mix(in srgb,var(--black) 97%, transparent);border-top:1px solid var(--line);backdrop-filter:blur(16px);grid-template-columns:auto 1fr auto;align-items:center;gap:1.5rem;padding:.8rem 2rem;transform:translateY(100%);transition:transform .35s cubic-bezier(.4,0,.2,1)}}
#player.visible{{display:grid;transform:translateY(0)}}
.p-info{{display:flex;align-items:center;gap:1rem;min-width:0}}
.p-thumb{{width:42px;height:42px;object-fit:cover;flex-shrink:0;border:1px solid var(--line)}}
.p-title{{font-family:'{theme['font_head']}',serif;font-size:1rem;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.p-sub{{font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);opacity:.7}}
.p-controls{{display:flex;align-items:center;flex-direction:column;flex:1;gap:.5rem;min-width:0}}
.p-btn-row{{display:flex;align-items:center;gap:1.2rem}}
.p-btn{{background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:.9rem;padding:.25rem;transition:color .2s}}
.p-btn:hover{{color:var(--accent-lt)}}
#p-playbtn{{width:36px;height:36px;border:1px solid var(--line);background:transparent;color:var(--accent);cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center}}
.progress-wrap{{height:4px;background:color-mix(in srgb,var(--accent) 14%, transparent);width:100%;max-width:520px;cursor:pointer}}
.progress-fill{{height:100%;width:0;background:linear-gradient(to right,var(--accent),var(--accent-lt))}}
.p-extra{{display:flex;align-items:center;gap:.8rem}}
#volume{{width:90px;accent-color:var(--accent)}}

footer{{background:var(--black);border-top:1px solid var(--line);padding:4rem 2rem 3rem;text-align:center}}
.foot-logo{{height:160px;width:auto;max-width:min(960px,94vw);object-fit:contain;opacity:.96;mix-blend-mode:screen;filter:brightness(1.22) drop-shadow(0 0 22px var(--accent-glow))}}
.foot-text{{font-size:.65rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-top:1rem}}

@media(max-width:900px){{
  #topnav{{padding:0 1.25rem;height:62px}}
  .nav-left,.nav-right{{gap:1rem}}
  .nav-left a,.nav-right a{{font-size:.64rem}}
  .nav-right li:nth-child(2){{display:none}}
  .stage{{min-height:68vh}}
  .stage-inner{{min-height:68vh;padding:5.2rem 1rem 2.2rem}}
  .stage-logo img{{width:min(780px,96vw);max-height:260px}}
  .latest-inner{{grid-template-columns:120px 1fr;gap:1rem;padding:0 1rem}}
  .latest-title{{font-size:1.55rem}}
  .latest-sub{{margin-bottom:.75rem}}
  .latest-play-btn{{padding:.62rem 1rem;font-size:.62rem}}
  #albums,.lower-video-section,#bio{{background-attachment:scroll}}
  .album-layout{{grid-template-columns:150px 1fr;gap:1.15rem;padding:0 1rem;align-items:center}}
  .album-layout.reverse{{direction:ltr}}
  .album-cover{{max-width:150px}}
  .album-title{{font-size:1.45rem}}
  .album-artist{{margin-bottom:.75rem}}
  .track-solid-bar{{padding:1.5rem 0 2rem}}
  .trackbar-inner{{padding:0 1rem}}
  .release-wall{{grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:1rem}}
  .release-card{{max-width:none}}
  .section-header{{padding:3rem 1rem 1.8rem}}
  .bio-logo img{{height:120px}}
  .foot-logo{{height:120px}}
  .photo-strip{{grid-template-columns:1fr;height:auto}}
  .photo-strip img{{height:340px}}
  #player{{grid-template-columns:1fr;padding:.9rem 1rem}}
  .p-extra{{display:none}}
}}
@media(max-width:560px){{
  .album-layout{{grid-template-columns:1fr;text-align:center}}
  .album-cover{{margin:0 auto;max-width:190px}}
  .latest-inner{{grid-template-columns:1fr;text-align:center}}
  .latest-cover{{max-width:190px;margin:0 auto}}
}}
</style>
</head>
<body>
<nav id="topnav">
  <ul class="nav-left">
    <li><a href="#">Home</a></li>
    <li><a href="#albums">Music</a></li>
    {('<li><a href="#video-stage">Videos</a></li>' if has_video_section else '')}
  </ul>
  <ul class="nav-right">
    <li><a href="#bio">About</a></li>
    <li><a href="#photos">Photos</a></li>
    <li><a href="https://hellotexasrecords.com">Label</a></li>
  </ul>
</nav>

<section class="stage">
  <div class="stage-bg"></div>
  <div class="stage-inner">
    <div class="stage-logo"><img src="{logo_path}" alt="{name} logo" onerror="this.style.display='none';document.getElementById('stage-fallback').style.display='block';"></div>
    <h1 id="stage-fallback" class="stage-title-fallback">{name}</h1>
    <div class="stage-tag">Hello Texas Records</div>
    <p class="stage-tagline">{tagline}</p>
    <div class="stage-actions">
      <button class="cta-primary" onclick="playLatest()">Listen Now</button>
      <a class="cta-secondary" href="#albums">Discography</a>
    </div>
  </div>
</section>

<section id="latest-single">
  <div class="latest-inner" id="latest-render"></div>
</section>

<div id="albums"></div>

{('<section id="video-stage" class="lower-video-section"><div class="section-header"><div class="section-eyebrow">Latest Video</div><h2 class="section-title">Video Coming Soon</h2><div class="rule"></div></div><div class="video-card-bar"><div class="feature-video"><div id="video-render" class="video-panel"></div></div></div></section>' if has_video_section else '')}

<section id="bio">
  <div class="section-header">
    <div class="section-eyebrow">Artist</div>
    <h2 class="section-title">About</h2>
    <div class="rule"></div>
  </div>
  <div class="bio-inner">
    <div class="bio-logo"><img src="{logo_path}" alt="{name} logo" onerror="this.style.display='none'"></div>
    <p>{bio}</p>
  </div>
</section>

<div id="photos"></div>
<div id="photo-strip" class="photo-strip">
  <img src="{photo_paths[0]}" alt="{name} photo 1" onerror="this.classList.add('missing');checkPhotoStrip();">
  <img src="{photo_paths[1]}" alt="{name} photo 2" onerror="this.classList.add('missing');checkPhotoStrip();">
  <img src="{photo_paths[2]}" alt="{name} photo 3" onerror="this.classList.add('missing');checkPhotoStrip();">
</div>

<footer>
  <img class="foot-logo" src="{logo_path}" alt="{name} logo" onerror="this.style.display='none'">
  <div class="foot-text">Hello Texas Records</div>
</footer>

<div id="player">
  <div class="p-info">
    <img id="p-thumb" class="p-thumb" alt="">
    <div>
      <div id="p-title" class="p-title"></div>
      <div id="p-sub" class="p-sub"></div>
    </div>
  </div>
  <div class="p-controls">
    <div class="p-btn-row">
      <button class="p-btn" onclick="prevTrack()">&#9664;&#9664;</button>
      <button id="p-playbtn" onclick="togglePlay()">&#9654;</button>
      <button class="p-btn" onclick="nextTrack()">&#9654;&#9654;</button>
    </div>
    <div class="progress-wrap" onclick="seek(event)"><div id="progress-fill" class="progress-fill"></div></div>
  </div>
  <div class="p-extra"><input id="volume" type="range" min="0" max="1" step="0.01" value="0.85"></div>
</div>

<audio id="audio"></audio>
<script id="artist-data" type="application/json">{data_json}</script>
<script>
const DATA = JSON.parse(document.getElementById('artist-data').textContent);
const SONGS = DATA.songs || [];
let currentIndex = -1;
const audio = document.getElementById('audio');

function esc(value) {{
  return String(value ?? '').replace(/[&<>"']/g, ch => ({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}}[ch]));
}}
function songCover(song) {{ return song.cover || song.albumCover || ''; }}
function videoUrl(song) {{
  const videos = Array.isArray(song.videos) ? song.videos : [];
  if (!videos.length) return '';
  return videos[0].youtube || videos[0].url || videos[0].href || '';
}}
function videoMarkup(song) {{
  const url = videoUrl(song);
  if (!url) return '<span class="track-badge">Video Coming Soon</span>';
  return `<a class="track-badge" target="_blank" rel="noreferrer" href="${{esc(url)}}">Watch Video</a>`;
}}
function renderLatest() {{
  const latest = SONGS.find(s => s.isLatest) || SONGS[0];
  const el = document.getElementById('latest-render');
  if (!latest) {{
    el.innerHTML = '<div><div class="latest-badge">Latest Release</div><h2 class="latest-title">New Music Coming Soon</h2></div>';
    return;
  }}
  el.innerHTML = `
    <img class="latest-cover" src="${{esc(songCover(latest))}}" alt="${{esc(latest.title)}}">
    <div>
      <div class="latest-badge">${{esc(latest.type || 'Latest Release')}}</div>
      <h2 class="latest-title">${{esc(latest.title)}}</h2>
      <div class="latest-sub">${{esc(latest.album || '')}}</div>
      <button class="latest-play-btn" onclick="playSongById('${{esc(latest.id)}}')">&#9654; Play</button>
      ${{videoMarkup(latest)}}
    </div>`;
}}
function renderVideo() {{
  const container = document.getElementById('video-render');
  if (!container) return;
  const song = SONGS.find(s => videoUrl(s)) || SONGS.find(s => s.isLatest) || SONGS[0];
  if (!song || !videoUrl(song)) {{
    container.innerHTML = '<div class="video-coming-soon visible"><div class="play-triangle"></div><strong>Video Coming Soon</strong><span>' + esc(DATA.artist.name) + ' does not have a video assigned yet. The video system is installed and ready.</span></div>';
    return;
  }}
  const thumb = song.cover || song.albumCover || '';
  container.innerHTML = `
    <div class="video-thumb has-video" onclick="window.open('${{esc(videoUrl(song))}}','_blank')">
      <img src="${{esc(thumb)}}" alt="${{esc(song.title)}} video">
      <div class="video-play-overlay"><div class="video-play-circle">&#9654;</div></div>
    </div>`;
}}
function renderAlbums() {{
  const root = document.getElementById('albums');
  if (!SONGS.length) {{
    root.innerHTML = '<section class="album-detail-section"><div class="discography-header"><div class="section-eyebrow">Music</div><h2 class="section-title">Music Coming Soon</h2><div class="rule"></div></div></section>';
    return;
  }}

  const albums = new Map();
  SONGS.forEach(song => {{
    const album = song.album || 'Singles';
    if (!albums.has(album)) albums.set(album, []);
    albums.get(album).push(song);
  }});

  let html = '<div class="discography-header"><div class="section-eyebrow">Latest Releases</div><h2 class="section-title">Discography</h2><div class="rule"></div></div>';

  Array.from(albums.entries()).forEach(([album, songs], idx) => {{
    const cover = songs.find(s => s.albumCover)?.albumCover || songCover(songs[0]) || '';
    html += `
    <section class="album-detail-section">
      <div class="album-stage">
        <div class="album-layout ${{idx % 2 ? 'reverse' : ''}}">
          <img class="album-cover" src="${{esc(cover)}}" alt="${{esc(album)}}">
          <div>
            <div class="album-badge">Album</div>
            <h2 class="album-title">${{esc(album)}}</h2>
            <div class="album-artist">${{esc(DATA.artist.name)}}</div>
          </div>
        </div>
      </div>

      <div class="track-solid-bar">
        <div class="trackbar-inner">
          <div class="tracklist">
            ${{songs.map((song, i) => `
              <div class="track-row">
                <div class="track-num">${{String(i+1).padStart(2,'0')}}</div>
                <div class="track-title">${{esc(song.title)}}</div>
                <div>${{song.isLatest ? '<span class="track-badge">Latest</span>' : ''}}</div>
                <button class="track-play-btn" onclick="playSongById('${{esc(song.id)}}')">&#9654;</button>
              </div>`).join('')}}
          </div>

          <div style="height:2rem"></div>
          <div class="album-track-art-heading">Album Tracks</div>
          <div class="release-wall">
            ${{songs.map(song => `
              <div class="release-card" onclick="playSongById('${{esc(song.id)}}')">
                <div class="release-art">
                  <img src="${{esc(songCover(song))}}" alt="${{esc(song.title)}}">
                  <div class="release-overlay"><div class="release-play">&#9654;</div></div>
                </div>
                <div class="release-title">${{esc(song.title)}}</div>
                <div class="release-album">${{esc(song.album || '')}}</div>
              </div>`).join('')}}
          </div>
        </div>
      </div>
    </section>`;
  }});

  root.innerHTML = html;
}}
function playLatest() {{
  const latest = SONGS.find(s => s.isLatest) || SONGS[0];
  if (latest) playSongById(latest.id);
}}
function playSongById(id) {{
  const idx = SONGS.findIndex(s => s.id === id);
  if (idx >= 0) playIndex(idx);
}}
function playIndex(idx) {{
  const song = SONGS[idx];
  if (!song || !(song.audio || song.audioSrc)) return;
  currentIndex = idx;
  audio.src = song.audio || song.audioSrc;
  document.getElementById('p-thumb').src = songCover(song);
  document.getElementById('p-title').textContent = song.title;
  document.getElementById('p-sub').textContent = `${{song.artist || DATA.artist.name}} • ${{song.album || ''}}`;
  document.getElementById('player').classList.add('visible');
  audio.play();
  document.getElementById('p-playbtn').innerHTML = '&#10074;&#10074;';
}}
function togglePlay() {{
  if (!audio.src) return playLatest();
  if (audio.paused) {{ audio.play(); document.getElementById('p-playbtn').innerHTML='&#10074;&#10074;'; }}
  else {{ audio.pause(); document.getElementById('p-playbtn').innerHTML='&#9654;'; }}
}}
function nextTrack() {{ if (SONGS.length) playIndex((currentIndex + 1) % SONGS.length); }}
function prevTrack() {{ if (SONGS.length) playIndex((currentIndex - 1 + SONGS.length) % SONGS.length); }}
function seek(e) {{
  if (!audio.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
}}
audio.addEventListener('timeupdate', () => {{
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
}});
audio.addEventListener('ended', nextTrack);
document.getElementById('volume').addEventListener('input', e => audio.volume = e.target.value);
function checkPhotoStrip() {{
  const strip = document.getElementById('photo-strip');
  if ([...strip.querySelectorAll('img')].every(img => img.classList.contains('missing'))) strip.classList.add('empty');
}}
renderLatest();
renderVideo();
renderAlbums();
</script>
</body>
</html>"""

def validate_assets(repo, artist_id, songs):
    warnings = []
    roster_disk = roster_photo_disk_path(artist_id)
    if not roster_disk.exists():
        warnings.append(f"Missing LABEL roster photo: {roster_disk}")

    for required in [
        label_asset_source_path(artist_id, "hero-photo"),
        label_asset_source_path(artist_id, "discography-bg"),
        label_asset_source_path(artist_id, "video-bg"),
        label_asset_source_path(artist_id, "photo-1"),
        label_asset_source_path(artist_id, "photo-2"),
        label_asset_source_path(artist_id, "photo-3"),
        local_artist_asset_path(repo, artist_id, "discography-bg"),
        local_artist_asset_path(repo, artist_id, "video-bg"),
        local_artist_asset_path(repo, artist_id, "hero-photo"),
        local_artist_asset_path(repo, artist_id, "photo-1"),
        local_artist_asset_path(repo, artist_id, "photo-2"),
        local_artist_asset_path(repo, artist_id, "photo-3"),
        repo / "images" / "logos" / f"{artist_id}-logo.png",
    ]:
        if not required.exists():
            warnings.append(f"Missing optional-but-standard asset: {required}")

    for s in songs:
        title = s.get("title", "Untitled")
        for key in ["cover", "albumCover"]:
            p = s.get(key, "")
            if not p:
                warnings.append(f"Missing {key} path for {title}")
                continue
            if p.startswith(("http://", "https://")):
                continue
            disk = repo / p
            if not disk.exists():
                warnings.append(f"Missing {key} for {title}: {p}")
    return warnings

def main():
    print("\n==========================================")
    print(" HTR Build Artist Site - DYNAMIC STAGE ENGINE v2.5 ALBUM STAGE BARS")
    print("==========================================\n")

    artists = read_json(ARTISTS_FILE, [])
    master = read_json(SONGS_FILE, [])
    artist_id = input("Artist ID to build: ").strip().lower()

    artist = next((a for a in artists if a.get("id", "").lower() == artist_id), None)
    if not artist:
        raise SystemExit(f"Artist not found: {artist_id}")

    rp = repo_path(artist)
    if not rp:
        raise SystemExit("Could not determine repo path.")

    rp.mkdir(parents=True, exist_ok=True)
    for d in ["images/covers", "images/logos", "images/artist"]:
        (rp / d).mkdir(parents=True, exist_ok=True)

    copied_assets, missing_roster_assets = copy_roster_assets_to_artist_repo(rp, artist_id)

    source = [s for s in master if s.get("artistId", "").lower() == artist_id]
    source = sorted(source, key=lambda s: (s.get("album", ""), s.get("releaseDate", ""), s.get("title", "")))
    out = [song_out(s, artist.get("name", "Artist"), i) for i, s in enumerate(source)]
    if out and not any(s.get("isLatest") for s in out):
        out[0]["isLatest"] = True

    write_json(rp / "songs.json", out)
    write_json(rp / "latest.json", make_latest(artist.get("name", "Artist"), out))
    write_json(rp / "radio.json", make_radio(artist.get("name", "Artist"), out))
    write_json(rp / "manifest.json", {
        "name": artist.get("name", "Artist"),
        "short_name": artist.get("name", "Artist")[:12],
        "description": f"{artist.get('name','Artist')} on Hello Texas Records",
        "start_url": "./",
        "display": "standalone",
        "background_color": "#090806",
        "theme_color": "#d49a25",
        "icons": []
    })

    (rp / "index.html").write_text(render_index(artist, out), encoding="utf-8")
    (rp / "STANDARD.md").write_text(
        "# Hello Texas Records Unified Artist Standard v1\n\n"
        "LOCKED RULES:\n"
        "- One architecture for all artist sites.\n"
        "- Per-artist uniqueness comes from theme, fonts, colors, logo, hero image, and copy.\n"
        "- Required folders in artist repo: images/covers/, images/logos/, images/artist/.\n"
        "- User-managed source photos live in Hello-Texas-Records/Roster Photos/.\n"
        "- Build copies hero/gallery photos into artist repo images/artist/ for GitHub Pages.\n"
        "- Hero source: Roster Photos/<artist-id>-hero-photo.png, aspect ratio 16:9.\n"
        "- Discography background: Roster Photos/<artist-id>-discography-bg.png, aspect ratio 16:9.\n"
        "- Video background: Roster Photos/<artist-id>-video-bg.png, aspect ratio 16:9.\n"
        "- Gallery sources: Roster Photos/<artist-id>-photo-1.png through photo-3.png, aspect ratio 3:4.\n"
        "- Roster photo: Roster Photos/<artist-id>-roster-photo.png, aspect ratio 1:1.\n"
        "- Album covers: images/covers/<artist-id>-<album-id>-ALBUM-cover.png.\n"
        "- Song covers: images/covers/<artist-id>-<song-id>-cover.png.\n"
        "- Every song object includes videos: [].\n"
        "- Album Tracks render beneath each album.\n"
        "- No Featured Tracks, All Tracks, or Singles dump sections.\n"
        "- If videos exist, show Watch Video. If empty, show Video Coming Soon.\n"
        "- Lucas Harlow can set noVideoSection true.\n",
        encoding="utf-8"
    )
    ensure_gitignore(rp)

    repo_name = artist.get("githubRepo", "").split("/")[-1] or artist.get("id") or artist.get("name", "Artist")
    repo_url = f"https://github.com/{artist.get('githubRepo','')}.git" if artist.get("githubRepo") else ""
    (rp / "update.bat").write_text(update_bat(repo_name, repo_url), encoding="utf-8")
    (rp / "update.ps1").write_text(update_ps1(repo_name, repo_url), encoding="utf-8")

    site = artist.get("siteUrl", "")
    if "hellotexasrecords.com" in site:
        (rp / "CNAME").write_text(site.split("//", 1)[-1].strip("/"), encoding="utf-8")

    theme_key, _ = theme_for_artist(artist)
    print(f"Built {artist.get('name')} at {rp}")
    print(f"Theme: {theme_key}")
    print(f"Songs: {len(out)}")
    print(f"Copied roster assets: {len(copied_assets)}")

    warnings = validate_assets(rp, artist_id, out)
    print("\nAsset check:")
    if warnings:
        for w in warnings:
            print(f"  WARNING: {w}")
    else:
        print("  OK: Required assets found.")

if __name__ == "__main__":
    main()
