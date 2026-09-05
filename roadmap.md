# IBB Wagini Data Sub — Build Roadmap

## Phase 1 — Foundation (done)
- [x] Lovable Cloud backend, schema, RLS, roles (user / agent enum / admin), atomic wallet function
- [x] Design system, logo, favicon
- [x] Landing page, auth (register / login / reset), user dashboard, service pages (catalogue view)
- [x] Admin console: overview, users, services, products & pricing, transactions, wallets, providers, settings, audit logs

## Phase 2 — Wallet funding
- [ ] Monnify + Flutterwave server functions, webhooks with signature verification + idempotency

## Phase 3 — Services (transaction engine + VTpass adapter)
- [ ] Airtime, Data, Electricity (validate + pay), Cable (validate + subscribe), Exams, NIN
- [ ] Reconciliation job for pending transactions, receipts

## Phase 4 — Admin extras
- [ ] Reports & exports (CSV/PDF), commissions ledger, notification engine (email/SMS via Termii), refund/reverse actions, provider test-connection

## Notes
- No agent dashboard (client decision). Roles keep `agent` enum for future pricing tiers only.
