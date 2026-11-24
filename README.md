# RISE_client

## Hostname-based branding

The shared application selects its visual identity before rendering:

| Hostname | Branding |
| --- | --- |
| `emergencylu.wasdi.net` | RISE for Emergency: light surfaces and red accents |
| Any other hostname, including `localhost` | Existing RISE branding |

Matching is exact, case-insensitive, and accepts a DNS trailing dot.
Ports, paths, query parameters, and authenticated users do not select a brand.
DNS, TLS, and hosting for the emergency hostname must be configured separately.

The mapping and document identity are defined in
[brand.config.ts](src/app/config/brand.config.ts) and applied by
[BrandingService](src/app/services/branding.service.ts) during Angular initialization.
[Emergency tokens](src/themes/emergency.css) and the scoped
[Material theme](src/custom-theme.scss) style the same application components.
Existing RISE color literals are retained as token fallbacks to preserve its
appearance. New styling should use purpose-based tokens rather than brand colors.
The existing color-named variables remain compatibility aliases; in particular,
`--rise-white` represents legacy foreground text in the light emergency theme.

[BrandLogoDirective](src/app/directives/brand-logo.directive.ts) replaces application
logos for the emergency brand, with an inverse variant for the public hero.
The supplied wordmark and favicon are provisional application assets, not an
official ministry identity. Marketing copy, partner logos, screenshots,
hazard data palettes, subscriptions, routes, permissions, and backend behavior are unchanged.
This is visual branding, not a tenant or authorization boundary.

When no basemap preference is saved, RISE for Emergency defaults to OSM Standard
and RISE defaults to Dark Gray. The account settings show the same default.
Saved basemap choices take precedence for both brands.

For local testing, map `emergencylu.wasdi.net` to the development machine using
a local DNS/hosts override and serve the app on that hostname, for example:

```sh
npm start -- --host emergencylu.wasdi.net --port 4200
```

Open `http://emergencylu.wasdi.net:4200`. Remove the override when finished;
opening `http://localhost:4200` uses the normal RISE identity.

Organization administrators and HQ users can see unaccepted invitations in the
members list. They are marked pending or expired; role and removal controls
remain available only after the invitee has completed registration. This
requires the corresponding backend change to `/org/list_users`.

Focused branding tests use a narrow TypeScript configuration because the general
test configuration currently includes unrelated, noncompiling legacy specs:

```sh
npm run test:branding
```