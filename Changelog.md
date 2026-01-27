## 1.7.2 - Unreleased

### Added

- Button linking to Nordic Developer Academy in all Asset Tracker evaluation
  steps for all supported DKs (nRF9151 DK, nRF9161 DK, nRF9151 SMA DK, and
  Thingy:91 X). The DevAcademy exercise provides step-by-step guidance for the
  Quick Start process and nRF Cloud claiming and provisioning.

### Changed

- Asset Tracker app descriptions across all board configurations to include
  extra help text.

## 1.7.1 - 2025-01-14

### Changed

- Updated modem firmware packages for the nRF9151 DK, the nRF9151 SMA DK, the
  nRF9161 DK, and the Thingy:91 X to v2.0.4.

## 1.7.0 - 2025-12-16

### Added

- Modem firmware package v2.0.3 for Nordic Thingy:91 X.

### Changed

- Modem firmware package is now programmed on devices only if not already
  programmed.

### Fixed

- Issue with the app crashing at the verification step when the device was
  disconnected and connected again.

## 1.6.0 - 2025-11-24

### Added

- Firmware for programming the Connectivity bridge application on Nordic
  Thingy:91 X.
- Support for the nRF54LV10 DK.

### Changed

- Updated modem firmware packages for the nRF9151 DK, the nRF9151 SMA DK, and
  the nRF9161 DK to v2.0.3.

### Fixed

- Rare issue where the quick start progress would be reset. This has been
  observed on Windows when using Nordic Thingy:91 X.

## 1.5.2 - 2025-10-22

### Changed

- Changed "Open Instructions" URL to point to the Asset Tracker Template steps
  about how to claim the device on nRF Cloud.

## 1.5.1 - 2025-10-15

### Changed

- Updated firmware for Nordic Thingy:91 X.

## 1.5.0 - 2025-10-01

### Added

- Asset Tracker sample to the nRF9161 DK.
- The Evaluation step for the Asset Tracker sample for the Nordic Thingy:91 X,
  the nRF 9151 SMA DK and the nRF 9151 DK now reads the attestation token and
  directs you to nRF Cloud.

### Removed

- nRF Cloud multi-service sample from the nRF9161 DK.

### Fixed

- Re-added the AT Commands sample for the nRF9161 DK.

## 1.4.0 - 2025-09-18

### Added

- Support for the nRF9151 SMA DK.
- Support for the nRF54LM20 DK.
- `Asset Tracker Template` firmware for the nRF9151 DK and the Thingy:91 X.

### Changed

- Order of samples for the nRF9151 DK, the nRF9161 DK, and the Thingy:91 X.
- Text in the Info step for the nRF54L15 DK.
- Renamed `Asset Tracker` to `Asset Tracker Legacy` for the nRF9151 DK and the
  nRF9161 DK.

### Removed

- nRF Cloud multi-service sample from the nRF9151 DK and the Thingy:91 X quick
  start flow.

## 1.3.1 - 2025-08-21

### Changed

- Text in the Info step for the nRF54L15 DK.

## 1.3.0 - 2025-06-24

### Added

- Support for nRF7002 DK.

## 1.2.1 - 2025-05-22

### Added

- Notification that informs user if device is disconnected. This notification
  can appear in relevant steps.

### Changed

- Update dependencies to support the nRF Connect for Desktop v5.2.0 release.

## 1.2.0 - 2024-12-06

### Changed

- The Evaluation step for the Nordic Thingy:91 X now reads the attestation token
  and directs you to nRF Cloud.

## 1.1.0 - 2024-11-29

### Added

- Support for Nordic Thingy:91 X.

### Changed

- Updated modem firmware packages for nRF9151 DK and nRF9161 DK to 2.0.2.
- Updated modem firmware packages for nRF9160 DK to 1.3.7.

### Fixed

- Some cases when programming the network core on the nRF5340 DK would fail.

## 1.0.1 - 2024-11-11

### Changed

- Updated `nrfutil device` to v2.6.4.

## 1.0.0 - 2024-10-10

### Added

- Opening the nRF Connect Serial Terminal app from the Evaluate step now always
  automatically selects the correct serial port.
- Support for the nRF54L15 DK, nRF5340 DK, nRF52 DK, nRF52840 DK, and nRF52833
  DK.
- New learning resource links in the Learn step for the nRF9151 DK, nRF9160 DK
  and nRF9161 DK.
- Automatic selection of the device if only one is connected when at the Select
  step.

## 0.3.0 - 2024-09-04

### Changed

- Improved the verify step stability for the nRF9160 DK, the nRF9161 DK, and the
  nRF9151 DK.

### Fixed

- The hardware documentation links for the nRF9151 DK and nRF9160 DK that led to
  non-existent pages.

## 0.2.7 - 2024-08-07

### Added

- Option to program and evaluate the nRF Cloud multi-service firmware on the
  nRF9161 DK and the nRF9151 DK.
- `SIM Card` step for nRF9151 DK and nRF9161 DK.

### Changed

- `Verify` step starts verifying automatically.

## 0.2.6 - 2024-04-12

### Changed

- Updated Nordic Semiconductor documentation links.

### Fixed

- Skip button is now shown consistently upon failure in the verification step.
- Modem firmware version v2.0.1 was wrongly displayed as v2.0.0 for nRF9151 DK
  and nRF9161 DK.

## 0.2.5 - 2024-03-26

### Changed

- Updated mfw for nRF9151 DK and nRF9161 DK to 2.0.1.

## 0.2.4 - 2024-03-20

### Added

- Information on high power consumption for related firmware files.

## 0.2.3 - 2024-03-13

### Changed

- Increased required nRF Connect for Desktop version to 4.4.1.

## 0.2.2 - 2024-02-23

### Changed

- Lowered required nRF Connect for Desktop version to 4.4.0.

## 0.2.1 - 2024-02-21

### Added

- Support for nRF9151 DK.
- Better usage data.
- `Program` step now ensures that device is connected before programming.

### Changed

- Improved error/notice UI.

### Fixed

- Reading the ICCID value sometimes never finished.
- Incorrect button label when failing to program.

## 0.2.0 - 2023-12-07

### Added

- `SIM Card` step for nRF9160 DK.

### Fixed

- Failed to list devices sometimes.

### Removed

- `Activate SIM Card` option in evaluate step for nRF9160 DK.

## 0.1.0 - 2023-09-28

- Initial public release
