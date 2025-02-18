{pkgs}: {
  deps = [
    pkgs.openssh
    pkgs.killall
    pkgs.mailman
    pkgs.jq
    pkgs.procps
    pkgs.nodePackages.prettier
    pkgs.lsof
    pkgs.postgresql
  ];
}
