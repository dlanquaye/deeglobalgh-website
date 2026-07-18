# Educational Entity Relationships (EER)

## Purpose

This document defines how every educational entity relates to every other entity within the DeeglobalGH Educational Knowledge Platform (EKP).

It serves as the blueprint for the future Prisma schema.

---

# High-Level Architecture

```text
Country
    │
    ▼
Region
    │
    ▼
District
    │
    ▼
School
```

```text
Publisher
    │
    ▼
Book Line
    │
    ▼
Edition
    │
    ▼
ISBN
```

```text
Curriculum
    │
    ▼
Curriculum Version
    │
    ▼
Learning Area
    │
    ▼
Strand
    │
    ▼
Sub-Strand
    │
    ▼
Indicator
```

```text
Educational Level
        │
        ▼
Approved Textbook
        ▲
        │
Book Line
        │
Publisher
```

---

# Core Educational Relationships

## Publisher

A Publisher:

- publishes many Book Lines
- publishes many Editions
- may publish many Approved Textbooks

Relationship

Publisher

↓

BookLine (1 : Many)

---

## Book Line

A Book Line:

belongs to one Publisher

belongs to one Subject

may have many Editions

may support multiple Resource Types

may appear in multiple Curriculum Versions

Relationship

Publisher

↓

BookLine

↓

Edition

---

## Edition

Each Edition:

belongs to one Book Line

may have one ISBN

may be approved under multiple Curriculum Versions

Relationship

BookLine

↓

Edition

↓

ISBN

---

## Subject

A Subject:

contains many Book Lines

contains many Learning Areas

Relationship

Subject

↓

BookLine

↓

LearningArea

---

## Curriculum

A Curriculum:

contains many Versions

Relationship

Curriculum

↓

CurriculumVersion

---

## Curriculum Version

Each Version:

contains many Learning Areas

Relationship

CurriculumVersion

↓

LearningArea

---

## Learning Area

Each Learning Area:

contains many Strands

Relationship

LearningArea

↓

Strand

---

## Strand

Each Strand:

contains many Sub-Strands

Relationship

Strand

↓

SubStrand

---

## Sub-Strand

Each Sub-Strand:

contains many Indicators

Relationship

SubStrand

↓

Indicator

---

# Educational Resource Relationships

Approved Textbook

belongs to:

Publisher

Book Line

Edition

Educational Level

Subject

Curriculum Version

Resource Type

---

# Commercial Relationships

Product

references:

Educational Publisher

Educational Book Line

Educational Level

Educational Resource Type

Educational Subject

Educational Curriculum Version

Product NEVER owns educational information.

---

# OCR Relationships

OCR Image

↓

OCR Text

↓

Educational Fingerprint

↓

Knowledge Match

↓

Educational Record

↓

Product

---

# Estimator Relationships

School List

↓

Educational Fingerprint

↓

Educational Record

↓

Product

↓

Estimate

---

# Synchronisation Relationships

NACCA

↓

Curriculum

↓

Learning Areas

↓

Strands

↓

Sub-Strands

↓

Indicators

GES

↓

Approved Textbooks

↓

Book Lines

↓

Publishers

Publisher Catalogues

↓

Book Lines

↓

Editions

↓

ISBNs

---

# Administration Relationships

Admin User

↓

Sync Job

↓

Sync Log

↓

Knowledge Updates

---

# Future Relationships

The Educational Knowledge Platform will support:

Publisher APIs

NACCA Synchronisation

GES Synchronisation

ISBN Lookups

AI Classification

OCR Recognition

School List Intelligence

Curriculum Coverage Reports

Duplicate Book Detection

Edition Tracking

Book Recommendation Engine

Educational Analytics