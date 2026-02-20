# Race Training Tracker for Runners

A web application that syncs with Strava to help you prepare for race day. Track your pace trends, monitor weekly volume, and stay accountable to your training plan.

## Features

### 🏃 Strava Integration

- **OAuth2 login** — Secure authentication with your Strava account
- **Automatic sync** — Pull all your runs with pace and distance

### 📊 Performance Dashboard

- **Race countdown cards** — Days remaining to race day with current vs target pace
- **Pace trend chart** — Visual progress towards race goals (sub-4:30/km, 1:40 HM)
- **Weekly volume bars** — Track training load week-over-week
- **Recent runs table** — Last 10 activities

### 📅 Training Calendar

- **8-week periodized plan** — Base building → Peak volume → Taper
- **Planned vs actual tracking** — Track sessions completed completed
- **Compliance scoring** — Weekly completion percentage
- **Distance validation** — Sessions only count if you hit 90% of target distance

## System Architecture

![System Diagram](/race-training-tracker.drawio.png)
