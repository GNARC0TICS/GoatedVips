{pkgs}: {
  deps = [
    pkgs.killall
    pkgs.jq
    pkgs.procps
    pkgs.nodePackages.prettier
    pkgs.lsof
    pkgs.postgresql
    pkgs.redis
    pkgs.nodejs_20
    pkgs.tsx
  ];
}
