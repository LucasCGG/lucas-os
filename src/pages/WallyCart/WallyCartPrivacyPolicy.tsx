export const WallyCartPrivacyPolicy = () => {
  const effectiveDate = "2025-08-27";  

  return (
    <main
      style={{
        maxWidth: "860px",
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily: "Arial, sans-serif",
        color: "#222",
        lineHeight: "1.6",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          WallyCart Privacy Policy
        </h1>
        <p style={{ color: "#555" }}>
          <strong>Effective Date:</strong> {effectiveDate}
        </p>
      </header>

      <article>
        <section>
          <p>
            WallyCart (“we”, “our”, “us”) is a WhatsApp-based shopping assistant that helps you manage grocery lists,
            scan product barcodes, and share lists with your family or groups (“Families”). We respect your privacy and
            are committed to protecting your data. This Privacy Policy explains what we collect, how we use it, and how
            you can manage your data.
          </p>
        </section>

        <section>
          <h2>1. Who Controls Your Data</h2>
          <p>
            <strong>Controller:</strong> WallyCart (solo developer)<br />
            <strong>Contact:</strong>{" "}
            <a href="mailto:colaco.lucasgabriel@gmail.com">colaco.lucasgabriel@gmail.com</a>
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <ul>
            <li><strong>Phone Number</strong> — used to identify you via WhatsApp.</li>
            <li><strong>Name / Username</strong> — if available from WhatsApp or provided manually.</li>
            <li><strong>Grocery Lists</strong> — items you add manually or via barcodes.</li>
            <li>
              <strong>Groups (“Families”)</strong> — group names, memberships, and invites.
            </li>
            <li>
              <strong>Product Barcodes:</strong>
              <ul>
                <li>If found in public product databases, we <strong>do not</strong> store them.</li>
                <li>
                  If no match is found, we may store the <strong>barcode string only</strong> to improve lookups.
                </li>
              </ul>
            </li>
          </ul>
          <p>
            <strong>Important:</strong> When you send images, they are processed directly from WhatsApp/Meta to detect
            barcodes. We <strong>never</strong> save, cache, or temporarily store images — they are discarded immediately
            after processing.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <ul>
            <li>To provide core WallyCart features like grocery lists and barcode lookups.</li>
            <li>To manage “Families” and shared lists.</li>
            <li>To improve accuracy when a barcode isn’t found in public sources.</li>
          </ul>
          <p>We do <strong>not</strong> sell or share your data with third parties.</p>
        </section>

        <section>
          <h2>4. Data Sharing & Third Parties</h2>
          <p>
            WallyCart does <strong>not</strong> share your personal data. When querying public product databases, we send
            the <strong>barcode only</strong> — not your phone number or any personal details.
          </p>
        </section>

        <section>
          <h2>5. Retention & Storage</h2>
          <ul>
            <li>Lists, groups, and unmatched barcodes remain saved until you request deletion.</li>
            <li>Images sent to WallyCart are <strong>never</strong> stored.</li>
          </ul>
        </section>

        <section>
          <h2>6. Your Rights & Data Deletion</h2>
          <p>You can delete your data at any time in two ways:</p>
          <ol>
            <li>
              <strong>In WhatsApp:</strong> Open the WallyCart chat and send:{" "}
              <code>/delete</code> or “delete my data”. All your saved grocery lists, barcodes, and groups will be
              removed instantly.
            </li>
            <li>
              <strong>By Email:</strong> Send a request to{" "}
              <a href="mailto:colaco.lucasgabriel@gmail.com">colaco.lucasgabriel@gmail.com</a> with the subject
              “WallyCart Data Deletion” and include your WhatsApp number. We’ll confirm deletion within 30 days.
            </li>
          </ol>
        </section>

        <section>
          <h2>7. WhatsApp Platform Policy</h2>
          <p>
            WallyCart operates entirely within WhatsApp and relies on their APIs. For details about how WhatsApp handles
            your data, please review{" "}
            <a
              href="https://www.whatsapp.com/legal/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp’s Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2>8. Children’s Privacy</h2>
          <p>
            WallyCart is not intended for children under the minimum age required to use WhatsApp in your country. If you
            believe a child is using WallyCart, contact us to request data deletion.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. When we do, we’ll update the “Effective Date” at the top.
            Continued use of WallyCart means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or how we handle your data, please email us at:{" "}
            <a href="mailto:colaco.lucasgabriel@gmail.com">colaco.lucasgabriel@gmail.com</a>
          </p>
        </section>
      </article>
    </main>
  );
};
