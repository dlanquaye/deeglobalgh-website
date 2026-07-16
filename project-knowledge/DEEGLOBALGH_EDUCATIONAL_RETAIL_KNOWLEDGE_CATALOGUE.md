# DeeglobalGH Educational Retail Knowledge Catalogue

Version: 1.0 (Working Draft)

---

## Purpose

This document is the master knowledge reference for the DeeglobalGH Product Intelligence Platform.

It defines how the ERP understands educational products, stationery, dormitory items, school requirements, customer terminology, publisher terminology and product identification.

The Product Intelligence Platform must always use this document as the primary business knowledge reference.

---

## Vision

The goal is not simply to search products.

The goal is to understand what the customer is requesting regardless of whether the request comes from:

- Website Search
- POS Search
- WhatsApp
- OCR
- School Requirement Lists
- Voice Input (Future)
- AI Assistant (Future)

before attempting product matching.

---

# Guiding Principles

## GP-0001

Knowledge must never be derived from products.

Products derive from knowledge.

---

## GP-0002

The Product Intelligence Platform must understand customer language rather than forcing customers to use official terminology.

---

## GP-0003

Retail knowledge takes precedence over curriculum terminology.

Curriculum mappings may be added without changing the retail knowledge model.

---

## GP-0004

Every canonical entity may have recognition vocabulary.

Recognition vocabulary represents how customers, schools, publishers and OCR may refer to the same entity.

---

## GP-0005

The Product Intelligence Platform should understand a request before attempting to identify products.

Understanding always comes before matching.

---

# Education Structure

The Product Intelligence Platform recognises the Ghana Education structure as a hierarchy.

Education

- Pre School
- Primary
- Junior High School (JHS)
- Senior High School (SHS)

The hierarchy represents educational stages rather than products.

Products are linked to the hierarchy but never define it.

---

# Education Levels

## Pre School

- Creche
- Nursery 1
- Nursery 2
- KG 1
- KG 2

---

## Primary

- Basic 1
- Basic 2
- Basic 3
- Basic 4
- Basic 5
- Basic 6

---

## Junior High School

- JHS 1
- JHS 2
- JHS 3

Historical terminology recognised:

- JSS 1
- JSS 2
- JSS 3

Alternative terminology recognised where applicable:

- Form 1
- Form 2
- Form 3

- Level 1
- Level 2
- Level 3

---

## Senior High School

- SHS 1
- SHS 2
- SHS 3

Historical terminology recognised:

- SSS 1
- SSS 2
- SSS 3

Alternative terminology recognised where applicable:

- Form 1
- Form 2
- Form 3

- Level 1
- Level 2
- Level 3

---

# Education Groups

Education Groups are logical collections of education levels.

Groups improve product searching, reporting and recommendations.

Current Groups

## Lower Primary

- Basic 1
- Basic 2
- Basic 3

---

## Upper Primary

- Basic 4
- Basic 5
- Basic 6

Future groups may be added without changing the education hierarchy.