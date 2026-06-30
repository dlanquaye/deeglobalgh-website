# DEEGLOBALGH BUSINESS OPERATING SYSTEM

# Importation & Procurement Domain

Document ID: DBOS-DB-005

Version: 1.0

Status: Draft

Author: DeeglobalGH Architecture Team

Owner: Procurement Domain

Created: 29 June 2026

Last Updated: 29 June 2026

Reviewed By:

Approved By:

---

# Purpose

The Procurement & Importation Domain manages the complete purchasing lifecycle from supplier selection through international shipping, customs clearance, warehouse receiving and inventory allocation.

---

# Business Responsibilities

This domain manages:

- Suppliers
- Purchase Planning
- Import Shipments
- Shipping Costs
- Freight Forwarders
- Clearing Costs
- Container Tracking
- Warehouse Receiving
- Inventory Allocation
- Landed Cost Calculation

---

# Database Models

Current Models

- ImportShipment
- ImportCost

Future Models

- Supplier
- PurchaseOrder
- SupplierInvoice
- Container
- FreightForwarder
- ClearingAgent
- ShipmentDocument

---

# Relationships

Supplier

↓

Purchase Order

↓

Import Shipment

↓

Import Cost

↓

Warehouse

↓

Inventory

---

# Business Rules

Every shipment belongs to one supplier.

Every shipment can have multiple costs.

Inventory is updated only after warehouse receiving.

Import costs contribute to landed cost.

Every shipment must be auditable.

---

# APIs

Current

- Shipment Management
- Import Cost Management

Future

- Supplier Portal
- Purchase Orders
- Shipment Tracking
- Document Management

---

# Current Status

Completed

Import Shipment

Import Costs

Warehouse Allocation

Outstanding

Supplier Management

Purchase Orders

Container Tracking

Shipment Documents

Landed Cost

---

END OF DOCUMENT