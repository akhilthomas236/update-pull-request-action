#!/bin/bash
# This is a debugging script to help understand how the GitHub event payload
# is structured for PR events and issue_comment events

if [ -z "$1" ]; then
  echo "Usage: $0 <event-json-file>"
  exit 1
fi

EVENT_FILE="$1"

if [ ! -f "$EVENT_FILE" ]; then
  echo "Event file not found: $EVENT_FILE"
  exit 1
fi

echo "Event file content:"
cat "$EVENT_FILE"
echo

# Try different ways to extract PR number
echo "Trying to extract PR number..."
echo "Method 1 (.pull_request.number):"
jq -r '.pull_request.number // "Not found"' "$EVENT_FILE"

echo "Method 2 (.issue.number where .issue.pull_request exists):"
jq -r 'if .issue.pull_request then .issue.number else "Not found" end' "$EVENT_FILE"

# Extract repository information
echo
echo "Repository information:"
echo "Owner: $(jq -r '.repository.owner.login // "Not found"' "$EVENT_FILE")"
echo "Name: $(jq -r '.repository.name // "Not found"' "$EVENT_FILE")"

# Event type
echo
echo "Event type: $(jq -r '.action // "No action field"' "$EVENT_FILE")"
