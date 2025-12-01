# VAULT 33 — Tier 1 Access Key Hardware Package

## Overview
The Tier 1 Access Key is a manufacturable NFC-enabled card that establishes the entry point to the Vault 33 progression system. It provides a CHAOS OS identity handshake, PRG-33 LED glimmer response, and an embedded 589 cipher trace for ARG mechanics. The design assumes a 1.6 mm FR-4 PCB (85.6 mm × 54 mm) with an obsidian base and neon accents per the Wired Chaos palette.

## Core Objectives
- **Safe, manufacturable, simulation-clean** design using standard PCB processes.
- **NFC-enabled identity** via ISO14443A (NTAG424 DNA recommended) with QR backup zone.
- **Tiered unlock path**: Tier 1 payload unlocks Tier 2 when signed nonce validates against CHAOS OS.
- **ARG layer** embedding the 589 cipher (Fibonacci/Golden-ratio spacing) and Merovingian Sangréal loop in copper.
- **PRG-33 signal logic** using tri-color LEDs with personality-assessment patterning.

## Hardware Architecture
- **Microcontroller**: Low-power MCU with NFC bridge support (e.g., nRF52840-QIAA) handling LED patterns and handshake timing.
- **NFC/SECURE ELEMENT**: NTAG424 DNA (tag-only mode) or ST25TN; stores signed Tier 1 token, public key hash, and tier progression counter.
- **Power**: CR2032 coin cell with reverse-polarity protection (Schottky + PFET) and 3.0 V LDO (TPS78330). Enable pin driven by wake button to conserve idle power.
- **LED Subsystem (PRG-33)**: Three 0603 LEDs (Glitch Red, Neon Cyan, Electric Green) plus current-limited drivers controlled via MCU PWM for glimmer response; shared ground pour shaped into Doginal Dog #1787 silhouette.
- **User I/O**: Tactile wake button (Tier 1 activation) and test pads for SWD programming.
- **ARG Trace Layer**: Inner-copper Sangréal loop routed at golden-ratio spacing (34 mil / 21 mil) with Fibonacci-numbered test pads (1,1,2,3,5,8) leading to a hidden net tied to shield copper.

## Schematic Notes (manufacturable, ERC-clean)
1. **Power Block**
   - CR2032 → Schottky (BAT60A) → PFET ideal-diode (SI2301) → LDO TPS78330 → 3.0 V rail.
   - Decoupling: 10 µF + 0.1 µF at LDO input; 4.7 µF + 0.1 µF at output.
2. **MCU Block**
   - nRF52840, 32.768 kHz crystal (12.5 pF caps) + 32 MHz crystal (12 pF caps).
   - SWDIO/SWCLK exposed via 1.27 mm pogo pads; RESET via hidden pad.
   - Status LEDs on PWM pins P0.13 (Red), P0.14 (Cyan), P0.15 (Green) with 180 Ω series resistors.
3. **NFC/Secure Element**
   - NTAG424 DNA antenna loop tuned to 13.56 MHz with matching network: 100 pF NP0, 39 pF NP0, and series 1.2 Ω resistor; keep loop clear of ground pour.
   - Optional I2C link to MCU for dynamic NDEF updates (10 k pull-ups, 0.1 µF filter).
4. **ARG Layer**
   - Inner copper spiral (Sangréal loop) tied to shield and reachable via Fibonacci test pads; pads numerically silk-labeled for the 589 cipher clue.
5. **PRG-33 LEDs**
   - PWM pattern: idle breathing (Cyan), handshake sparkle (Cyan→Green), reject pulse (Red double-flash), Tier progression unlocked (Cyan/Green/Red Fibonacci durations 1/1/2/3 seconds).

## PCB Layout Guidance
- **Palette**: Obsidian black base (#000000) solder mask; silkscreen accents Neon Cyan (#00FFFF), Glitch Red (#FF3131), Electric Green (#39FF14), and Accent Pink (#FF00FF) on legend and annotations.
- **Stackup**: 4-layer recommended — L1 signals + NFC loop, L2 ground, L3 power/shield, L4 signals.
- **Keepouts**: Maintain 5 mm clearance around NFC loop; avoid stitching vias through antenna region.
- **Hidden ARG Symbol**: Copper pour on L3 forming Doginal Dog #1787 silhouette under the NFC zone; visible only in Gerber copper layer.
- **Mounting/Handling**: Chamfered corners; fiducials on L1/L4 for assembly; QR zone reserved on back (pink outline) containing fallback URL and tier signature hash.

## Bill of Materials (BOM)
| Ref | Description | Example Part | Qty | Notes |
| --- | --- | --- | --- | --- |
| U1 | nRF52840-QIAA MCU | Nordic nRF52840-QIAA | 1 | Core controller, BLE-capable for future tiers |
| U2 | NFC Tag/Secure Element | NXP NTAG424 DNA | 1 | ISO14443A, secure NDEF |
| U3 | LDO 3.0 V | TI TPS78330DBVR | 1 | 500 nA IQ |
| D1 | Schottky diode | BAT60A | 1 | Reverse protection |
| Q1 | PFET | SI2301 | 1 | Ideal-diode ORing |
| LED1 | Red LED | 0603, 625 nm | 1 | Glitch Red |
| LED2 | Cyan LED | 0603, 505 nm | 1 | Neon Cyan |
| LED3 | Green LED | 0603, 525 nm | 1 | Electric Green |
| R1–R3 | LED resistors | 180 Ω 0603 | 3 | Current limit |
| C* | Decoupling caps | 0.1 µF / 4.7 µF / 10 µF | 8 | X5R/X7R |
| X1/X2 | Crystals | 32 kHz, 32 MHz | 2 | w/ load caps |
| SW1 | Tactile button | TL3305 | 1 | Wake/activate |
| ANT1 | NFC antenna | PCB trace loop | 1 | Tuned for 13.56 MHz |
| TP* | Test pads | 1.27 mm | 8 | SWD + Fibonacci ARG pads |

## CHAOS OS Integration
- **Handshake**: NFC tag holds `tier=1`, `nonce`, `pubkey_hash`, and `signature`. MCU performs BLE advertisement with the same nonce; CHAOS OS verifies signature and increments progression.
- **Payload format (NDEF JSON)**: `{ "tier":1, "nonce":"<128-bit>", "sig":"ed25519:<base64>", "arg_hint":"589-fib" }`.
- **Swarm API**: On activation, MCU blinks PRG-33 pattern and emits BLE packet `CHAOS-T1:<nonce>`; host app posts to `/vault33/progression` with nonce and scan timestamp.

## ARG / 589 Puzzle Layer
- **Fibonacci pads** labeled 1,1,2,3,5,8; shorting 3→5 pads during power-on toggles a hidden `Tier1-Lab` BLE name for training mode.
- **Golden-ratio spacing** used for antenna clearance (phi multiples) and trace spiral.
- **Copper Sangréal loop** references Merovingian lore; continuity test reveals resistance value encoding the next-hint hash.

## Fabrication Package Checklist
- Gerber set with L3 copper ARG symbol intact.
- NC drill + pick-and-place CSV for LEDs, MCU, and passives.
- Readme for assembly specifying neon silkscreen colors.
- DRC: 4/4 mil minimums; antenna clearance validated; impedance not required.

## Validation & Test
- ERC/DRC pass in KiCad/Altium; NFC resonance verified at 13.56 MHz ± 200 kHz.
- Current draw: <2 µA shipping mode, <6 mA during full LED glimmer.
- Functional test: tap-to-unlock with signed NDEF; verify PRG-33 LED patterns; confirm BLE nonce broadcast in training jig.

## Firmware Behavior (Tier 1)
1. **Shipping mode**: MCU off, tag passive.
2. **Wake press**: Power rails enable; MCU boots, reads NFC NDEF, and broadcasts BLE nonce.
3. **Handshake success** (phone/app confirms): LED sparkle Cyan→Green, then Fibonacci-duration tri-color display.
4. **Failure**: Double Red flash; return to idle after 5 seconds.
5. **ARG toggle**: If Fibonacci pads shorted at boot, broadcast `Tier1-Lab` and emit alternating Cyan/Pink pulses.
