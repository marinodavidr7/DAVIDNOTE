# Implementation Plan - Session Persistence, Bottom Nav Visibility, and Mobile Layout Fixes

## 1. Session Persistence on Page Refresh
- Save the current view (`currentView`), admin tab (`adminTab`), and logged-in admin status in `localStorage`.
- On initial app load, restore the saved admin session and view so that refreshing the page does not log out the user or return them to the landing screen.

## 2. Bottom Navigation Bar Visibility on Audit Screen
- Ensure the bottom navigation bar (highlighted in red) is rendered persistently across all admin views (`admin-dashboard`, `admin-fiado`, `admin-abono`, `admin-autorizado`, `admin-crear-cliente`, `admin-detalle-cliente`, `admin-auditoria`), instead of disappearing on certain views.

## 3. Mobile Layout Responsiveness Fixes (Client Cards Overlap)
- Fix the client card layout (highlighted in green) to prevent text/amounts/share buttons from overlapping on narrow mobile screens (using responsive flex columns, proper spacing, and min-w-0 truncation).
