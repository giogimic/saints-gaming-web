'use client';

import { PageEditor } from '@/components/page-editor';
import { useSession } from 'next-auth/react';
import { getPage } from '@/lib/storage';

export default async function PrivacyPolicy() {
  const { data: session } = useSession();
  const page = await getPage('privacy');

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <PageEditor
            page={page}
            onSave={async (content) => {
              // Handle save
            }}
          />

          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p>We collect and process the following information:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Steam account information (public profile data)</li>
                <li>Forum activity and content</li>
                <li>Cookie preferences and consent</li>
                <li>Technical information (IP address, browser type)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Provide and maintain our services</li>
                <li>Process your forum posts and interactions</li>
                <li>Send you important updates about our services</li>
                <li>Improve our website and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Protection Rights</h2>
              <p>Under UK data protection laws, you have the following rights:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure of your data</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
              <p>We retain your personal data for as long as necessary to:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Email: privacy@saintsgaming.com</li>
                <li>Discord: [Discord Server Link]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
              <p className="mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 