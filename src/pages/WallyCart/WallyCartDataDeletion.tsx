export const WallyCartDataDeletion = () => {
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
                    WallyCart – User Data Deletion
                </h1>
                <p style={{ color: "#555" }}>
                    <strong>Effective Date:</strong> {effectiveDate}
                </p>
                <p style={{ color: "#555" }}>
                    Instructions to permanently delete your data from WallyCart.
                </p>
            </header>

            <article>
                <section>
                    <h2>How to Delete Your Data</h2>
                    <p>
                        WallyCart respects your privacy. If you’d like to delete your account data,
                        including grocery lists, saved barcodes, and family/group information, you
                        have two options:
                    </p>
                </section>

                <section>
                    <h3>Option 1 — Delete Directly via WhatsApp (Recommended)</h3>
                    <ol>
                        <li>
                            Open your WhatsApp chat with <strong>WallyCart</strong>.
                        </li>
                        <li>
                            Send the command:{" "}
                            <code
                                style={{
                                    backgroundColor: "#f2f2f2",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                }}
                            >
                                /delete
                            </code>{" "}
                            or simply type <em>“delete my data”</em>.
                        </li>
                        <li>
                            WallyCart will immediately remove <strong>all data</strong> associated
                            with your WhatsApp number, including:
                            <ul>
                                <li>Your grocery lists</li>
                                <li>Any barcodes saved when no public match was found</li>
                                <li>Families/groups you created and related membership data</li>
                            </ul>
                        </li>
                    </ol>
                </section>

                <section>
                    <h3>Option 2 — Request Deletion by Email</h3>
                    <p>You can also request deletion by contacting us via email:</p>
                    <p>
                        <strong>Email:</strong>{" "}
                        <a href="mailto:colaco.lucasgabriel@gmail.com">
                            colaco.lucasgabriel@gmail.com
                        </a>
                    </p>
                    <p>
                        Please include your <strong>WhatsApp phone number</strong> in the message so
                        we can identify your account. We will remove your data within{" "}
                        <strong>30 days</strong> and confirm once the deletion is complete.
                    </p>
                </section>

                <section>
                    <h2>Important Note About Images</h2>
                    <p>
                        WallyCart <strong>does not store images</strong> you send. When you upload a
                        photo, it’s processed <strong>in-memory</strong> only to detect barcodes,
                        then discarded immediately. No image files are saved on our servers.
                    </p>
                </section>

                <section>
                    <h2>Contact</h2>
                    <p>
                        If you have any questions about deleting your data or about our privacy
                        practices, you can contact us at:{" "}
                        <a href="mailto:colaco.lucasgabriel@gmail.com">
                            colaco.lucasgabriel@gmail.com
                        </a>
                    </p>
                </section>
            </article>
        </main>
    );
};
