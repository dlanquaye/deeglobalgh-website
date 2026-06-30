# DEEGLOBALGH BUSINESS OPERATING SYSTEM

# Database Architecture

Document ID: DBOS-DB-001

Version: 1.0

Status: Draft

Author: DeeglobalGH Architecture Team

Owner: Solution Architecture

Created: 29 June 2026

Last Updated: 29 June 2026

Reviewed By:

Approved By:

---

# Purpose

This document defines the official database architecture of the DeeglobalGH Business Operating System (DBOS).

It serves as the master reference for:

- Database design
- Prisma schema
- Entity relationships
- Business domains
- Future modules
- Database governance

This document is considered the single source of truth for all database development.

---

# Database Philosophy

The database is designed around business processes rather than website pages.

Every table represents a real business entity.

Examples include:

- Product
- Order
- Inventory
- Warehouse
- Staff
- Purchase
- Shipment
- Return

No table should exist unless it represents a real business concept.

---

# Business Domains

The database is organised into the following domains:

1. Commerce
2. Inventory
3. Finance
4. Procurement & Importation
5. Returns & After Sales
6. CRM
7. Operations
8. Reporting
9. System Administration

Each domain owns its own business entities.

---

# Current Database Status

| Domain | Status |
|---------|--------|
| Commerce | Complete |
| Inventory | Complete |
| Finance | Complete |
| Procurement | Complete |
| Returns | Under Development |
| CRM | Planned |
| Operations | Foundation Complete |
| Reporting | Foundation Complete |
| Administration | Complete |

---

# Database Standards

Every model must follow these standards:

- Singular model names
- Primary key named `id`
- `createdAt`
- `updatedAt` (where applicable)
- Explicit relationships
- Appropriate indexes
- Business-friendly naming
- Audit support

---

# Documentation Rule

No new model may be added to the database until:

1. It has been documented.
2. Business purpose is defined.
3. Relationships are approved.
4. Naming follows standards.

---

END OF DOCUMENT