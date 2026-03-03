{
  description = "CLI tool to control Sennheiser Ambeo soundbar";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in {
      packages = forAllSystems (system:
        let pkgs = nixpkgs.legacyPackages.${system};
        in {
          default = pkgs.buildNpmPackage {
            pname = "soundbar-control";
            version = "1.0.0";
            src = ./.;
            npmDepsHash = "sha256-O7wzHvcD6TyXf7PQP2+ICPn7vQx8rjTAnh6AQR9Ap7Q=";
            buildPhase = ''
              runHook preBuild
              npm run build
              runHook postBuild
            '';
            installPhase = ''
              runHook preInstall
              mkdir -p $out/lib/node_modules/soundbar-control
              cp -r dist package.json node_modules $out/lib/node_modules/soundbar-control/
              mkdir -p $out/bin
              ln -s $out/lib/node_modules/soundbar-control/dist/index.js $out/bin/soundbar
              chmod +x $out/bin/soundbar
              runHook postInstall
            '';
          };
        }
      );
    };
}
