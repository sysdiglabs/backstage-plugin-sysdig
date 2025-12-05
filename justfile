
_default:
    just -l

# Bumps dependencies
bump:
    nix flake update
    nix develop --command yarn backstage-cli versions:bump
    nix develop --command pre-commit autoupdate

# Checks for unused dependencies
check-unused:
    npx -y depcheck
