# Setting up Custom Domain on AWS Amplify

Since your domain is **`periodictable.travel-tracker.org`**, follow these steps to connect it to your deployed app.

## Prerequisites
1.  You have deployed the app to **AWS Amplify** (as recommended in the previous guide).
2.  You have access to the DNS settings for `travel-tracker.org` (e.g., in Route53, GoDaddy, Namecheap).

---

## Step 1: Add Domain in Amplify
1.  Open the **AWS Amplify Console**.
2.  Click on your app: **`periodic-table`**.
3.  In the left sidebar, under **App settings**, click **Domain management**.
4.  Click **Add domain**.
5.  Enter `periodictable.travel-tracker.org` in the domain field.
6.  Click **Configure domain**.
7.  Uncheck the "Redirect" options if they appear (you just want the subdomain).
8.  Click **Save**.

## Step 2: Update DNS Records
Amplify will generate an **SSL Certificate** and provide you with a **CNAME Record** to verify ownership.

1.  Amplify will show a screen saying **"SSL creation"** or **"Domain activation"**.
2.  Look for the **DNS Record** section. It will give you two CNAMEs:
    *   **Validation CNAME**: Used to prove you own the domain for the SSL certificate.
    *   **Traffic CNAME**: Used to point users to your app.

### If your DNS is in AWS Route53:
*   Amplify often automates this. If not, go to **Route53 > Hosted Zones > travel-tracker.org**.
*   Create a **CNAME** record for `periodictable`.
*   Value: The CloudFront URL provided by Amplify (e.g., `d1234.amplifyapp.com`).

### If your DNS is elsewhere (GoDaddy, Namecheap, etc.):
1.  Log in to your DNS provider.
2.  Go to DNS Settings for `travel-tracker.org`.
3.  Add a **CNAME Record**:
    *   **Host/Name**: `periodictable`
    *   **Value/Target**: The URL Amplify gave you (e.g., `d1234.amplifyapp.com`).
    *   **TTL**: 300 (or default).
4.  (If requested) Add the SSL Validation CNAME record as well.

## Step 3: Verification
1.  Wait for the SSL verification (can take 15 mins to a few hours).
2.  Once all checks in Amplify turn green, your site will be live at:
    **[https://periodictable.travel-tracker.org](https://periodictable.travel-tracker.org)**
