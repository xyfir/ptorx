# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0).

Breaking changes may be introduced in minor versions for v6 while its use in the wild is limited to the official Ptorx.com instances. Afterwards the project will adhere to [Semantic Versioning](https://semver.org).

Changes that require manual, atypical updates for those running their own instances of Ptorx will be listed at the bottom of their respective groups (Added, Changed, etc) and prefixed with `!!`. Dependency updates will not be mentioned unless the dependency is a submodule like Accownt.

## [Unreleased]

## [6.5.1] - 2019-05-04

### Fixed

- Links in HTML mail to open in a new tab
- Dark theme not working in certain parts of app

### Changed

- !! Update Accownt and CCashCow

## [6.5.0] - 2019-04-27

### Added

- Primary emails that can automatically link themselves to new aliases
- Cancel button when in a manage mode
- "Select All" button for each category when in manage mode

### Changed

- An account's email is now automatically added as a verified, autolinking primary email upon registration

### Fixed

- Improve color contrast in dark theme ([#1](https://github.com/Xyfir/ptorx/issues/1))

## [6.4.1] - 2019-04-15

### Changed

- Increase rows per page for aliases and messages

### Fixed

- Deleting multiple items multiple times
- Displaying alias name in search matches

## [6.4.0] - 2019-04-14

### Added

- Helpful alert for new users
- Pricing section on homepage

### Changed

- !! Update CCashCow, and Yalcs

## [6.3.0] - 2019-04-12

### Added

- Ability to delete multiple items at once

## [6.2.1] - 2019-04-10

### Changed

- !! Update Yalcs

## [6.2.0] - 2019-04-09

### Added

- !! [Yalcs](https://github.com/Xyfir/yalcs)

## [6.1.1] - 2019-04-03

### Fixed

- Broken links in email templates used by Accownt

## [6.1.0] - 2019-04-02

### Added

- Allow sending mail through third-party clients with our MSA server and alias SMTP credentials
- !! `MSA_PORT` to server config

### Changed

- !! Database structure
- !! `SMTP_PORT` to `MTA_PORT` in server config
- !! `TEST_SMTP_PORT` to `TEST_MTA_PORT` in server config

### Removed

- !! Hard-coded message size limit

## [6.0.0] - 2019-03-29

### Changed

- Release 6.0.0

[unreleased]: https://github.com/Xyfir/ptorx/compare/6.5.0...HEAD
[6.5.0]: https://github.com/Xyfir/ptorx/compare/6.4.1...6.5.0
[6.4.1]: https://github.com/Xyfir/ptorx/compare/6.4.0...6.4.1
[6.4.0]: https://github.com/Xyfir/ptorx/compare/6.3.0...6.4.0
[6.3.0]: https://github.com/Xyfir/ptorx/compare/6.2.1...6.3.0
[6.2.1]: https://github.com/Xyfir/ptorx/compare/6.2.0...6.2.1
[6.2.0]: https://github.com/Xyfir/ptorx/compare/6.1.1...6.2.0
[6.1.1]: https://github.com/Xyfir/ptorx/compare/6.0.1...6.1.1
[6.1.0]: https://github.com/Xyfir/ptorx/compare/6.0.0...6.1.0
[6.0.0]: https://github.com/Xyfir/ptorx/releases/tag/6.0.0
