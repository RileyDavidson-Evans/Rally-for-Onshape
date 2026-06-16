# Security Policy

## Overview

Onshape Plus is a browser extension that adds local UI/UX improvements to Onshape.

The extension is designed to run only on Onshape CAD pages and to operate locally in the user's browser. It does not collect, transmit, sell, or share user data.

Onshape Plus is an independent community project and is not affiliated with, endorsed by, or sponsored by Onshape or PTC.

## Data Handling

Onshape Plus does not intentionally collect or transmit:

* CAD geometry
* document names
* workspace names
* company names
* user names
* email addresses
* account information
* cookies
* authentication tokens
* session data
* Onshape API keys
* telemetry
* analytics
* crash reports

Extension settings are stored locally using browser extension storage.

## Network Requests

Onshape Plus does not make external network requests for analytics, telemetry, tracking, or data collection.

The extension code runs locally in the browser.

## Permissions

Onshape Plus requests only the permissions required to provide its UI enhancements.

| Permission                  | Purpose                                                                       |
| --------------------------- | ----------------------------------------------------------------------------- |
| `storage`                   | Stores local extension settings, such as enabled features and UI preferences. |
| `https://cad.onshape.com/*` | Allows the extension to run only on Onshape CAD pages.                        |

## Onshape Interaction

Onshape Plus modifies the local browser interface by adding toolbar buttons, floating controls, numeric input helpers, fullscreen improvements, and context-aware UI actions.

Some features may trigger existing Onshape UI commands in the same way a user would click a button or use a keyboard shortcut. The extension does not use Onshape API credentials or directly call private Onshape APIs.

## Source Code and Auditability

The source code is publicly available and can be reviewed on GitHub.

Companies and security teams are encouraged to audit the source code, permissions, dependencies, and build process before approving use in managed environments.

## Reporting Security Issues

If you believe you have found a security issue, please report it privately by opening a GitHub security advisory or contacting the maintainer directly.

Please do not publicly disclose security issues until they have been reviewed.
