{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    let
      overlays.default = final: prev: { };
      flake = flake-utils.lib.eachDefaultSystem (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config.allowUnfree = true;
            overlays = [ self.overlays.default ];
          };
        in
        {
          devShells.default =
            with pkgs;
            mkShell {
              packages =
                [
                  nodejs
                  typescript
                  yarn-berry
                  (python3.withPackages (p: with p; [ gyp ]))
                ]
                ++ (with nodePackages; [
                  typescript-language-server
                  node-gyp
                ]);
            };

          formatter = pkgs.nixfmt-rfc-style;
        }
      );
    in
    flake // { inherit overlays; };
}
