#!/bin/bash
echo "Testing Rumble HLS Endpoint for video ID: v5xwnen"
curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" "https://rumble.com/embedJS/u3/?request=video&v=v5xwnen" | grep -o '"hls":{"url":"[^"]*"' | head -1
