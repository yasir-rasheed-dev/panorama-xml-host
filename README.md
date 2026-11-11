# Panorama Studio public tours

Open `index.html` through GitHub Pages to browse the registered panoramas. `viewer.html?id=coastal-horizon` opens a real interactive Three.js panorama with drag, zoom, reset and fullscreen controls.

The approved `config/registry.json` maps tour IDs to XML configurations and images. Unknown IDs and arbitrary XML query URLs are rejected. `xml/main.xml` includes the first available tour as a default entry; each `xml/tours/<id>.xml` can be loaded independently. Shared defaults live in `xml/common/settings.xml`.

For licensed krpano playback, install your runtime at `viewer/krpano.js` and open `viewer.html?id=coastal-horizon&engine=krpano`. The runtime and its license are supplied by the viewer operator. A partner can include an approved HTTPS tour XML URL in their own viewer; they must configure their viewer and browser policies for that origin. Base64 XML is optional transport, using `application/xml`, and still requires the receiving viewer to support it.

Panorama Studio publishes XML, assets, and registry updates from its authenticated backend. The admin dashboard, database credentials and GitHub token do not belong in this repository.
