# Google Search Console Setup Guide

## Step 1: Verify ownership
1. Go to https://search.google.com/search-console
2. Add property: `https://periodictable.travel-tracker.org/`
3. Choose DNS verification or HTML file verification
   - For HTML file: download the verification file and place it in `public/`
   - For DNS: add TXT record to your domain DNS

## Step 2: Submit sitemap
1. In Search Console, go to "Sitemaps" in left sidebar
2. Enter: `https://periodictable.travel-tracker.org/sitemap.xml`
3. Click "Submit"

## Step 3: Request indexing
1. In Search Console, go to "URL Inspection"
2. Enter your homepage URL
3. Click "Request Indexing"
4. Repeat for key pages: /about, /download, /glossary, /history

## Step 4: Monitor
- Check "Coverage" report after 3-7 days
- Look for crawl errors and fix them
- Monitor "Core Web Vitals" report

## Bing Webmaster Tools (also recommended)
1. Go to https://www.bing.com/webmasters
2. Add your site
3. Submit sitemap
4. Run IndexNow script: `./scripts/indexnow-submit.sh`

## Google Indexing API (optional, for faster indexing)
For new/updated pages, you can use the Indexing API:
https://developers.google.com/search/apis/indexing-api/v3/quickstart
