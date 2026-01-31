import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <article className="prose prose-invert max-w-none">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 31, 2026</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                SC-Workflow4AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at flow-scribe-wise.lovable.app (the "Site") and use our workflow generation services.
              </p>
              <p className="text-muted-foreground">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">2.1 Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We may collect personal information that you voluntarily provide when registering for an account, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
                <li>Name and email address</li>
                <li>Account credentials</li>
                <li>Contact information</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-muted-foreground mb-4">
                When you access the Site, we automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Click patterns and user interactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Analytics and Tracking Technologies</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">3.1 Google Analytics 4 (GA4)</h3>
              <p className="text-muted-foreground mb-4">
                We use Google Analytics 4 to analyze website traffic and user behavior. GA4 collects data such as pages visited, session duration, and user demographics. This data helps us improve our services and user experience. Google may use this data in accordance with their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">3.2 Google Tag Manager (GTM)</h3>
              <p className="text-muted-foreground mb-4">
                We use Google Tag Manager to manage and deploy marketing and analytics tags on our Site. GTM itself does not collect personal data but facilitates the deployment of other tracking technologies.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">3.3 Microsoft Clarity</h3>
              <p className="text-muted-foreground mb-4">
                We use Microsoft Clarity to understand user behavior through session recordings and heatmaps. Clarity captures how users interact with our Site, including clicks, scrolls, and mouse movements. Sensitive information is automatically masked. Learn more at <a href="https://clarity.microsoft.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Clarity Terms</a>.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">3.4 Google Ads & Remarketing</h3>
              <p className="text-muted-foreground mb-4">
                We may use Google Ads conversion tracking and remarketing features. This allows us to measure ad effectiveness and show relevant ads to users who have previously visited our Site. You can opt out of personalized advertising through <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ad Settings</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cookies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to enhance your experience. Types of cookies we use include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the Site</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect Site functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide, operate, and maintain our services</li>
                <li>Improve and personalize user experience</li>
                <li>Process transactions and manage accounts</li>
                <li>Send administrative communications</li>
                <li>Analyze usage patterns and optimize performance</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Information Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Service Providers:</strong> Third parties that help us operate our Site and services</li>
                <li><strong>Analytics Partners:</strong> Google, Microsoft, and similar providers</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Your Rights</h2>
              <p className="text-muted-foreground mb-4">Depending on your location, you may have rights including:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Access to your personal data</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data</li>
                <li>Data portability</li>
                <li>Opting out of marketing communications</li>
                <li>Withdrawing consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Site is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-muted-foreground">
                <strong>SupportCALL</strong><br />
                Website: <a href="https://www.supportcall.com.au/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.supportcall.com.au</a>
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <Link to="/" className="text-primary hover:underline">
                ← Return to Home
              </Link>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
