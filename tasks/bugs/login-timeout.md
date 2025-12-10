---
title: Login times out after 30 seconds
status: in-progress
priority: high
assignee: sarah
---

# Login times out after 30 seconds

Users are reporting that the login page times out even with correct credentials.

## Steps to reproduce

1. Go to login page
2. Enter valid credentials
3. Wait 30+ seconds
4. Error: "Request timeout"

## Investigation

- Seems related to slow DB queries
- May need connection pooling
