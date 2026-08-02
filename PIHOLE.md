# Pi-hole

`pihole.yml` is the desired Portainer stack definition for Pi-hole on
`192.168.1.122`.

## Host prerequisites

- External Docker networks `main_default` and `unbound_dns` must exist.
- The Unbound container must be reachable as `unbound` on `unbound_dns`.
- Persistent data is stored outside Git in:
  - `/service/docker/data/pihole/etc-pihole`
  - `/service/docker/data/pihole/etc-dnsmasq.d`
- The web password is stored outside Git in
  `/service/docker/.secrets/pihole/webpassword`, owned by `root:root` with mode
  `0600`.

The stack publishes DNS only on `192.168.1.122:53`. The web interface is
reachable internally on container port 80 through the `main_default` network;
Traefik routing is maintained separately.

Do not commit persistent data, query databases, backup archives, or secret
files to this repository.
