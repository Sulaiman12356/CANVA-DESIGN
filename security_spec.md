# Security Specification & Threat Model

## 1. Data Invariants
- **Participants**: Any participant document must have an identifier, valid full name (2–100 chars), valid email format, WhatsApp phone number (5–30 chars), and assigned ticket number. Status defaults to 'REGISTERED' or valid lifecycle status. Updates and deletes are restricted to authorized administrators.
- **Class Settings**: Single source of truth at `class_settings/current`. Publicly readable so prospective students can view schedule, countdown target date, and WhatsApp links. Modifications require authorized administrator authentication.
- **Admin Users & Account**: Restricted strictly to authorized academy administrators (`ipesolasulaiman@gmail.com`, `onifadesulaiman@gmail.com`, or domain `@clarity.edu`). No public access.
- **Email Templates & Audit Logs**: Sensitive administrative tools restricted to administrator reads and writes.
- **Telemetry (Analytics & Visitor Sessions)**: Creation and heartbeats allowed for tracking funnel metrics; reads restricted to administrator dashboards.

## 2. The "Dirty Dozen" Threat Payloads
1. **P1 (Privilege Escalation via Self-Promotion)**: An unauthenticated visitor attempting to write to `admin_users/hacker` with `role: 'super_admin'`. -> Must return `PERMISSION_DENIED`.
2. **P2 (Malicious Settings Override)**: An attacker attempting to change `class_settings/current` WhatsApp link to a phishing URL. -> Must return `PERMISSION_DENIED`.
3. **P3 (Participant Mass Deletion)**: An attacker issuing a `delete` on `participants/{id}` without admin credentials. -> Must return `PERMISSION_DENIED`.
4. **P4 (Participant Table Exfiltration)**: An unauthenticated user executing a query to list all documents in `/participants`. -> Must return `PERMISSION_DENIED`.
5. **P5 (Corrupted Participant Schema)**: A registration payload missing `ticket_number` or with a 100,000-character payload to cause Denial of Wallet. -> Must return `PERMISSION_DENIED`.
6. **P6 (Negative / Invalid Slots Injection)**: Writing a non-number or negative count to `available_slots`. -> Must return `PERMISSION_DENIED`.
7. **P7 (Audit Log Tampering)**: An attacker attempting to delete or overwrite previous `audit_logs` entries. -> Must return `PERMISSION_DENIED`.
8. **P8 (Email Template Modification)**: An unauthorized user attempting to alter password reset or class confirmation email templates. -> Must return `PERMISSION_DENIED`.
9. **P9 (Participant Status Forgery)**: A public user attempting to mark their own registration as `attendance_day_1: true`. -> Must return `PERMISSION_DENIED`.
10. **P10 (Admin Account Impersonation)**: Attempting to read master credential hashes in `/admin_account`. -> Must return `PERMISSION_DENIED`.
11. **P11 (Junk ID Injection)**: Attempting to write a document with an ID containing path traversal `../` or special control characters. -> Must return `PERMISSION_DENIED`.
12. **P12 (Blanket Catch-All Read)**: Attempting to access non-existent or internal collections through `{document=**}` wildcards. -> Must return `PERMISSION_DENIED`.
