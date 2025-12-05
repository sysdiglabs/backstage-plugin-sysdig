
_default:
    just -l

# Bumps dependencies
bump:
    nix flake update
    nix develop --command yarn backstage-cli versions:bump

# Checks for unused dependencies
check-unused:
    npx -y depcheck

