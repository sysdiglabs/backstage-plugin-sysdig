_default:
    just -l

# Installs dependencies
install:
    yarn install

# Starts the development server
start: install
    yarn start

# Runs the tests
test: install
    yarn test --watchAll=false

# Lints the code
lint: install
    yarn lint

# Lints and fixes the code
lint-fix: install
    yarn lint --fix

# Builds the package
build: install lint test
    yarn build

# Cleans the package
clean:
    yarn clean

# Bumps dependencies
bump:
    nix flake update
    nix develop --command yarn backstage-cli versions:bump
    nix develop --command pre-commit autoupdate

# Checks for unused dependencies
check-unused:
    npx -y depcheck
