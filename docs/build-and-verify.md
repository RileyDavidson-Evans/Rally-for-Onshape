# Build and Verify

This guide explains how to verify that a published Onshape Plus release corresponds to the publicly available source code.

## Source Availability

All Onshape Plus releases are published from source code available in this repository.

Each published extension release corresponds to a GitHub Release and Git tag.

Reviewers can inspect the exact source code associated with a published release by checking out the matching tag.

## Clone the Repository

```bash
git clone https://github.com/RileyDavidson-Evans/onshape-plus.git
cd onshape-plus
```

## Checkout a Specific Release

For example:

```bash
git checkout v1.1.3
```

Replace the version with the tag corresponding to the release being evaluated.

## Install Dependencies

```bash
npm install
```

## Build

```bash
npm run build
```

The production extension files will be generated in:

```text
dist/
```

## Review the Manifest

Before loading the extension, review:

```text
dist/manifest.json
```

Confirm:

* The extension only runs on `https://cad.onshape.com/*`
* The requested permissions match the documented permissions
* No unexpected permissions have been added

## Load the Extension Locally

### Chrome / Edge

1. Open `chrome://extensions` or `edge://extensions`
2. Enable Developer Mode
3. Click **Load unpacked**
4. Select the `dist` directory

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `dist/manifest.json`

## Verify Network Activity

Reviewers can use browser Developer Tools to inspect network activity while using the extension.

Onshape Plus is designed to operate locally within the browser and does not intentionally transmit Onshape document data, CAD geometry, user information, company information, authentication tokens, or session data to external services.

## Independent Review

Because Onshape Plus is open source, organizations may:

* Review all source code
* Review dependency manifests and lockfiles
* Review extension permissions
* Build directly from source
* Compare published releases against tagged source code
* Perform internal security reviews before deployment

Organizations are encouraged to perform their own security assessment and validation before approving the extension for production use.
