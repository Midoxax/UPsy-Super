#!/usr/bin/env bash
# Reinstalls the agent skills this project uses into ~/.claude/skills.
# Runs from the SessionStart hook in .claude/settings.json, because cloud
# sessions start from a fresh container. Every source is pinned to a commit;
# bump a SHA only after reading what changed.
set -euo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

DEST="$HOME/.claude/skills"
STAMP="$DEST/.upsy-skills-v1"
[ -f "$STAMP" ] && exit 0

# repo  commit  directory-with-skills
SOURCES="
JuliusBrussee/caveman            9b68f7ed12b05e7efaff18e65c5a3fc2849fd0a4 skills
Leonxlnx/taste-skill             12af471f627f866411b4bd785b19646d3672784c skills
anthropics/skills                dbd4588f9e1033efb41dad4bef2f7947c8993d44 skills
obra/superpowers                 2ce8aa15d05bd57213e6f746f953aafb7ded7a8b skills
nextlevelbuilder/ui-ux-pro-max-skill 28b3b8dee8c976df4fa3e94aed4e092ad43fcb03 .claude/skills
"
# These two send your Anthropic API key to a third-party gateway (caveman.so).
SKIP="caveman-setup caveman-discover"

mkdir -p "$DEST"
work="$(mktemp -d)"
trap 'rm -rf -- "${work:?}"' EXIT

echo "$SOURCES" | while read -r repo sha dir; do
  [ -n "$repo" ] || continue
  src="$work/${repo//\//_}"
  git init -q "$src"
  git -C "$src" fetch -q --depth 1 "https://github.com/$repo.git" "$sha"
  git -C "$src" checkout -q FETCH_HEAD
  for skill in "$src/$dir"/*/; do
    name="$(basename "$skill")"
    case " $SKIP " in *" $name "*) continue ;; esac
    [ -f "$skill/SKILL.md" ] || continue
    [ -e "$DEST/$name" ] || cp -rL "$skill" "$DEST/$name"
  done
done

# graphify: code knowledge graph CLI, registers its own skill.
if ! command -v graphify >/dev/null 2>&1; then
  if command -v uv >/dev/null 2>&1; then uv tool install -q graphifyy==0.9.96; else pip install -q graphifyy==0.9.96; fi
fi
graphify install --platform claude >/dev/null 2>&1 || true

touch "$STAMP"
