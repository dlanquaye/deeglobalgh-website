# Educational Domain Model (EDM)

## Purpose

The Educational Domain Model defines the educational concepts managed by the DeeglobalGH Educational Knowledge Platform.

It is independent of:

- Products
- Inventory
- Pricing
- Orders
- Customers

Those systems consume educational knowledge but do not own it.

---

# Core Domains

## Educational Reference Data

Publisher

Book Line

Subject

Curriculum

Curriculum Version

Language

Educational Level

Resource Type

Edition

ISBN

Academic Year

---

## Curriculum Structure

Learning Area

Strand

Sub-Strand

Indicator

Learning Outcome

Competency

---

## Educational Resources

Approved Textbook

Teacher Guide

Workbook

Assessment Book

Supplementary Reader

Digital Resource

---

## Educational Institutions

School

School Type

District

Region

Country

---

## Commercial Layer

Product

Supplier

Warehouse

Inventory

Price

Order

Customer

The Commercial Layer references the Educational Layer.

---

# Knowledge Sources

NACCA

GES

Publishers

Internal Product Catalogue

OCR

Manual Administration

---

# Knowledge Consumers

Parser

Educational Fingerprint Engine

OCR Engine

Matching Engine

School List Estimator

Admin Portal

Online Shop

Reporting

Future Mobile Applications

---

# Design Principles

Single Source of Truth

Database Driven

Version Controlled

Synchronisable

Auditable

Extensible

Testable

Independent of Commerce