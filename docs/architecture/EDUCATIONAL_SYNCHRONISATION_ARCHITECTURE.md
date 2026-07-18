# Educational Synchronisation Architecture (ESA)

## Purpose

The Educational Synchronisation Architecture (ESA) defines how educational information is imported, validated, versioned and synchronised into the Educational Knowledge Platform (EKP).

The Educational Knowledge Platform is the single source of truth for all educational metadata used by DeeglobalGH.

It is designed to support automated synchronisation from multiple authoritative sources while maintaining data integrity and a complete audit trail.

---

# Design Goals

- Fully automated
- Incremental updates
- Version controlled
- Auditable
- Recoverable
- Source aware
- Conflict aware
- Extensible

---

# Knowledge Sources

## Primary Sources

NACCA

GES

Official Publisher Catalogues

ISBN Registries

---

## Secondary Sources

Internal Product Catalogue

OCR

School Lists

Manual Administration

---

# Synchronisation Pipeline

```text
External Source
        │
        ▼
Download
        │
        ▼
Validation
        │
        ▼
Normalisation
        │
        ▼
Educational Fingerprint
        │
        ▼
Matching
        │
        ▼
Conflict Detection
        │
        ▼
Version Creation
        │
        ▼
Database Update
        │
        ▼
Audit Log
```

---

# Synchronisation Stages

## Stage 1

Source Discovery

Determine whether new data exists.

Examples

New curriculum

New publisher catalogue

New approved textbook list

---

## Stage 2

Download

Retrieve the latest data.

Supported formats

HTML

PDF

Excel

CSV

JSON

XML

API

---

## Stage 3

Validation

Validate:

Required fields

Document integrity

Checksum

Version

Publication date

Source authenticity

---

## Stage 4

Normalisation

Convert source data into standard educational entities.

Example

Publisher

Book Line

Subject

Level

Curriculum

Edition

ISBN

---

## Stage 5

Educational Fingerprint

Generate fingerprint.

Publisher

Book Line

Subject

Level

Resource Type

Curriculum

Language

Edition

ISBN

---

## Stage 6

Knowledge Matching

Compare against EKP.

Existing record

New record

Updated record

Retired record

Duplicate

Alias

---

## Stage 7

Conflict Detection

Examples

Different ISBN

Different Edition

Changed Subject

Publisher Rename

Curriculum Changes

Approval Removed

---

## Stage 8

Version Management

Never overwrite educational history.

Each synchronisation creates a new version.

---

## Stage 9

Database Update

Insert

Update

Retire

Archive

No destructive deletes.

---

## Stage 10

Audit

Every synchronisation is logged.

---

# Synchronisation Frequency

Publisher Catalogues

Weekly

NACCA

Daily check

Synchronise only if changes exist.

GES

Daily check

ISBN

Monthly

Internal Catalogue

Immediate

OCR

Real-time

---

# Versioning

Every record contains

Created Date

Effective Date

Retired Date

Version

Source

Source Version

Checksum

Status

---

# Audit Trail

Every synchronisation records

Start Time

Finish Time

Duration

Source

Records Created

Records Updated

Records Retired

Warnings

Errors

User

---

# Conflict Resolution

Priority Order

1. Manual Administrator

2. Official Government Source

3. Official Publisher

4. ISBN Registry

5. Existing EKP

6. OCR

7. AI Suggestion

---

# Rollback

Every synchronisation can be rolled back.

Rollback never deletes history.

Rollback creates a new version.

---

# Future Enhancements

Automatic publisher notifications

Automatic curriculum comparison

Automatic edition comparison

Automatic duplicate detection

AI-assisted conflict resolution

Historical curriculum browsing

Educational analytics

Recommendation engine

Predictive catalogue updates