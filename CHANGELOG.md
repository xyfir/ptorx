# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0).

Breaking changes may be introduced in minor versions for v6 while its use in the wild is limited to the official Ptorx.com instances. Afterwards the project will adhere to [Semantic Versioning](https://semver.org).

Changes that require manual, atypical updates for those running their own instances of Ptorx will be listed at the bottom of their respective groups (Added, Changed, etc) and prefixed with `!!`.

## [Unreleased]

## [6.3.0] - 2019-04-12

### Added

- Ability to delete multiple items at once

### Changed

- Update dependencies

## [6.2.1] - 2019-04-10

### Changed

- Update dependencies and Yalcs

## [6.2.0] - 2019-04-09

### Added

- !! [Yalcs](https://github.com/Xyfir/yalcs)

### Changed

- Update dependencies

## [6.1.1] - 2019-04-03

### Changed

- Update dependencies

### Fixed

- Broken links in email templates used by Accownt

## [6.1.0] - 2019-04-02

### Added

- Allow sending mail through third-party clients with our MSA server and alias SMTP credentials
- !! `MSA_PORT` to server config

### Changed

- Update dependencies
- !! Database structure
- !! `SMTP_PORT` to `MTA_PORT` in server config
- !! `TEST_SMTP_PORT` to `TEST_MTA_PORT` in server config

### Removed

- !! Hard-coded message size limit

## [6.0.0] - 2019-03-29

### Changed

- Release 6.0.0

[unreleased]: https://github.com/Xyfir/ptorx/compare/6.3.0...HEAD
[6.3.0]: https://github.com/Xyfir/ptorx/compare/6.2.1...6.3.0
[6.2.1]: https://github.com/Xyfir/ptorx/compare/6.2.0...6.2.1
[6.2.0]: https://github.com/Xyfir/ptorx/compare/6.1.1...6.2.0
[6.1.1]: https://github.com/Xyfir/ptorx/compare/6.0.1...6.1.1
[6.1.0]: https://github.com/Xyfir/ptorx/compare/6.0.0...6.1.0
[6.0.0]: https://github.com/Xyfir/ptorx/releases/tag/6.0.0
