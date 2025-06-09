'use client';

import { PageEditor } from '@/components/page-editor';
import { useSession } from 'next-auth/react';
import { getPage } from '@/lib/storage';

export default async function TermsOfService() {
  const { data: session } = useSession();
  const page = await getPage('terms');

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <PageEditor
            page={page}
            onSave={async (content) => {
              // Handle save
            }}
          />

          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using SaintsGaming, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
              <p>To access certain features of the site, you must:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Be at least 13 years old</li>
                <li>Have a valid Steam account</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Post or transmit any unlawful, threatening, abusive, libelous, defamatory, obscene, or otherwise objectionable content</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the site or servers</li>
                <li>Attempt to gain unauthorized access to any part of the site</li>
                <li>Use the site for any illegal purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Content Guidelines</h2>
              <p>When posting content on our forums, you must:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Respect other users and their opinions</li>
                <li>Stay on topic in discussions</li>
                <li>Not spam or post duplicate content</li>
                <li>Not post personal information of others</li>
                <li>Not post content that infringes on intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p>The content on SaintsGaming, including but not limited to text, graphics, logos, and software, is the property of SaintsGaming and is protected by UK and international copyright laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p>SaintsGaming shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the site.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Modifications to Terms</h2>
              <p>We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
              <p>These terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us at:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Email: legal@saintsgaming.com</li>
                <li>Discord: [Discord Server Link]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Last Updated</h2>
              <p>These Terms of Service were last updated on {new Date().toLocaleDateString()}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 