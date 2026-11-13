# Agntia Engineering Factory — Clientes

**factoryVersion: 0.1.0 | domainProfile: clientes | DESIGN/PREP | 2026-11-13**

Preparación conceptual comparable a Marketing, Formación, Branding, Finanzas, Legal, Seguros y Ventas. No granularizar patchsets ni crear código. Astra revisará libremente conceptos cuando founder aporte meta-auditoría; después reconciliación y campañas granulares.

## Lectura
docs/prep/README.md → docs/factory/00-README.md a 06-READINESS-AUDIT.md → originales de producto/arquitectura/contratos/seguridad/research → docs/campaigns/campaign.json y documento original → docs/implementation/NN-*/README.md → handoffs y N−1/N/N+1.

## Invariantes
Padre agente mantiene identidad, kernel, grafo, bus, SOP, policy, aprobaciones y agentes canónicos; especialista mantiene twins vinculados y servicios delegados, no kernel paralelo. Funciones solapadas sí, efectos duplicados no. Tenant, ACL de conversación/caso/contacto, supresión, minimización, consentimientos/base válida, idempotencia y auditoría. LLM propone, sistema autoriza. No responder a clientes reales, enviar mensajes, cancelar contratos, devolver dinero ni cambiar CRM sin permiso.

## Certeza
DOC_ONLY, PROPOSED, CODE_VERIFIED, TEST_VERIFIED, STALE, UNKNOWN. No confundir diseño con aplicación. No tocar main/padre/proveedores.
