import { useCallback, useEffect, useRef, useState } from "react";
import { AppButton, AppIcon, AppIconButton } from "../../components";
import { AppEditable } from "../../components/cms";
import { useTrans } from "../../hooks/useTrans";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import { ErrorToast } from "../../components/AppToast/AppToast";

type MailItem = {
    id: string;
    sender: string;
    subject: string;
    text: string;
};

type MailEntity = {
    sender?: string;
    subject?: string;
    text?: string;
};

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

if (!serviceId || !templateId || !publicKey) {
    throw new Error("Missing EmailJS environment variables");
}

emailjs.init(publicKey);

const RECIPIENT_EMAIL = "colaco.lucasgabriel@gmail.com";

const FOLDERS: { key: string; labelId: string }[] = [
    { key: "INBOX", labelId: "app.mail.folders.inbox" },
    { key: "SENT", labelId: "app.mail.folders.sent" },
    { key: "SPAM", labelId: "app.mail.folders.spam" },
    { key: "TRASH", labelId: "app.mail.folders.trash" },
];

const createId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const MailItemComponent = ({
    sender,
    subject,
    text,
    active,
    onDelete,
}: MailItem & { active?: boolean; onDelete?: () => void }) => {
    return (
        <div
            className={`group relative h-fit w-full cursor-pointer border-b-2 border-sidebar px-3 py-3 transition-colors ${
                active ? "bg-[#EAD3A2]" : "hover:bg-[#EFDCB4]"
            }`}
        >
            <p className="truncate pr-8 font-semibold">{sender}</p>
            <p className="line-clamp-1 pr-8 font-bold">{subject}</p>
            <p className="line-clamp-1 pr-8 font-light">{text}</p>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                }}
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Delete message"
            >
                <AppIcon icon="icn-trash-bin" className="text-sidebar" />
            </button>
        </div>
    );
};

const MailObject = ({
    sender,
    subject,
    text,
    onSent,
    onDiscard,
}: MailEntity & { onSent?: (mail: MailItem) => void; onDiscard?: () => void }) => {
    const { t } = useTrans();

    const [from, setFrom] = useState(sender ?? "");
    const [mailSubject, setMailSubject] = useState(subject ?? "");
    const [message, setMessage] = useState(text ?? "");
    const [sending, setSending] = useState(false);

    const refTextArea = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        const el = refTextArea.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [message]);

    const sendMail = async () => {
        if (!from || !mailSubject || !message) {
            ErrorToast({ message: "Please fill out all fields" });
            return;
        }

        try {
            setSending(true);

            await emailjs.send(serviceId, templateId, {
                from_email: from,
                from_name: from,
                to_email: RECIPIENT_EMAIL,
                subject: `Portfolio inquiry — ${mailSubject}`,
                message: [
                    "You received a new message from your portfolio website.",
                    "",
                    `From: ${from}`,
                    `Subject: ${mailSubject}`,
                    "",
                    "Message:",
                    message,
                ].join("\n"),
            });

            toast.success("Message sent successfully");

            const sentMail: MailItem = {
                id: createId(),
                sender: from,
                subject: mailSubject,
                text: message,
            };

            setFrom("");
            setMailSubject("");
            setMessage("");
            onSent?.(sentMail);
        } catch (err) {
            console.error(err);
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-full w-full flex-col px-3 py-4 sm:px-4">
            <div className="space-y-2 border-b-2 border-sidebar pb-4">
                <div className="flex flex-wrap items-center gap-2">
                    <AppEditable id="app.mail.compose.to.label">
                        <p className="font-semibold">{t("app.mail.compose.to.label")}:</p>
                    </AppEditable>
                    <AppEditable id="app.mail.recipient">
                        <p className="break-all">{t("app.mail.recipient")}</p>
                    </AppEditable>
                </div>

                <div className="flex items-center gap-2">
                    <AppEditable id="app.mail.compose.from.label">
                        <p className="font-semibold">{t("app.mail.compose.from.label")}:</p>
                    </AppEditable>
                    <AppEditable id="app.mail.compose.from.placeholder">
                        <input
                            type="email"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            placeholder={t("app.mail.compose.from.placeholder")}
                            className="min-w-0 flex-1 bg-transparent outline-none"
                        />
                    </AppEditable>
                </div>

                <div className="flex items-center gap-2">
                    <AppEditable id="app.mail.compose.subject.label">
                        <p className="font-semibold">{t("app.mail.compose.subject.label")}:</p>
                    </AppEditable>
                    <AppEditable id="app.mail.compose.subject.placeholder">
                        <input
                            type="text"
                            value={mailSubject}
                            onChange={(e) => setMailSubject(e.target.value)}
                            placeholder={t("app.mail.compose.subject.placeholder")}
                            className="min-w-0 flex-1 bg-transparent outline-none"
                        />
                    </AppEditable>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 py-4">
                <AppEditable id="app.mail.compose.body.placeholder">
                    <textarea
                        ref={refTextArea}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("app.mail.compose.body.placeholder")}
                        className="w-full flex-1 resize-none bg-transparent outline-none"
                        rows={4}
                    />
                </AppEditable>

                <div className="flex gap-2">
                    <AppEditable id="app.mail.sendButton">
                        <AppButton
                            onClick={sendMail}
                            text={sending ? t("app.mail.sendingButton") : t("app.mail.sendButton")}
                            disabled={sending}
                        />
                    </AppEditable>
                    <AppEditable id="app.mail.discardButton">
                        <AppButton
                            onClick={() => onDiscard?.()}
                            text={t("app.mail.discardButton")}
                            disabled={sending}
                        />
                    </AppEditable>
                </div>
            </div>
        </div>
    );
};

const MailReader = ({ sender, subject, text }: MailItem) => {
    const { t } = useTrans();
    return (
        <div className="flex h-full w-full flex-col px-3 py-4 sm:px-4">
            <div className="space-y-1 border-b-2 border-sidebar pb-4">
                <p className="text-xl font-bold">{subject}</p>
                <div className="flex items-center gap-2">
                    <p className="font-semibold">{t("app.mail.compose.from.label")}:</p>
                    <p>{sender}</p>
                </div>
            </div>
            <p className="whitespace-pre-wrap py-4">{text}</p>
        </div>
    );
};

type MailSeed = { sender: string; subject: string; text: string };

export const MailApp = () => {
    const { t } = useTrans();

    const seedRaw = t("app.mail.seed", { returnObjects: true });
    const seed = Array.isArray(seedRaw) ? (seedRaw as MailSeed[]) : [];

    // Build the initial inbox from the (editable) seed once, on mount.
    const [mailList, setMailList] = useState<Record<string, MailItem[]>>(() => ({
        INBOX: seed.map((m, i) => ({ id: `seed-${i}`, ...m })),
        SENT: [],
        SPAM: [],
        TRASH: [],
    }));

    const [openMail, setOpenMail] = useState<string | null>(null);
    const [composeKey, setComposeKey] = useState(0);
    const [composing, setComposing] = useState(false);
    const [mobilePane, setMobilePane] = useState<"list" | "detail">("list");
    // activeFolder now stores the internal KEY (e.g. "INBOX"), not the label.
    const [activeFolder, setActiveFolder] = useState("INBOX");


    const startCompose = () => {
        setComposeKey((k) => k + 1);
        setComposing(true);
        setOpenMail(null);
        setMobilePane("detail");
    };

    const closeCompose = () => {
        setComposing(false);
        setMobilePane("list");
    };

    const openMessage = (id: string) => {
        setComposing(false);
        setOpenMail(id);
        setMobilePane("detail");
    };

    const handleSent = (mail: MailItem) => {
        setMailList((prev) => ({
            ...prev,
            SENT: [mail, ...(prev.SENT ?? [])],
        }));
        closeCompose();
    };

    const handleDelete = (folderKey: string, id: string) => {
        setMailList((prev) => {
            const next = { ...prev };
            const mail = (prev[folderKey] ?? []).find((m) => m.id === id);

            next[folderKey] = (prev[folderKey] ?? []).filter((m) => m.id !== id);

            if (mail && folderKey !== "TRASH") {
                next.TRASH = [mail, ...(prev.TRASH ?? [])];
            }

            return next;
        });

        setOpenMail((cur) => (cur === id ? null : cur));
        setMobilePane("list");
    };

    const selectFolder = (folderKey: string) => {
        setActiveFolder(folderKey);
        setOpenMail(null);
        setComposing(false);
        setMobilePane("list");
    };

    const currentMails = mailList[activeFolder] ?? [];
    const selectedMail = currentMails.find((m) => m.id === openMail);
    const hasDetail = composing || !!selectedMail;

    const activeFolderMeta = FOLDERS.find((f) => f.key === activeFolder);
    const activeFolderLabel = activeFolderMeta ? t(activeFolderMeta.labelId) : activeFolder;

    const renderDetail = useCallback(() => {
        if (selectedMail) {
            return <MailReader {...selectedMail} />;
        }
        if (composing) {
            return <MailObject key={composeKey} onSent={handleSent} onDiscard={closeCompose} />;
        }
        return (
            <div className="flex h-full w-full items-center justify-center px-4 text-center opacity-60">
                <AppEditable id="app.mail.emptyState">
                    <p>{t("app.mail.emptyState")}</p>
                </AppEditable>
            </div>
        );
    }, [composeKey,selectedMail, composing]);

    return (
        <div className="flex h-full w-full flex-col bg-[#F5E4C0] px-3 pb-4 sm:px-4 sm:pb-16">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b-2 border-sidebar py-2">
                <div className="flex items-center gap-3 sm:gap-4">
                    <AppIconButton
                        icon="icn-envelope"
                        variant="ghost"
                        size="md"
                        className="text-sidebar"
                        onClick={() => {
                            closeCompose();
                            setMobilePane("list");
                        }}
                    />
                    <AppIconButton
                        icon="icn-pen"
                        variant="ghost"
                        size="md"
                        className="text-sidebar"
                        onClick={startCompose}
                    />
                    <AppIconButton
                        icon="icn-trash-bin"
                        variant="ghost"
                        size="md"
                        className="text-sidebar"
                        onClick={() => {
                            if (selectedMail) handleDelete(activeFolder, selectedMail.id);
                        }}
                        disabled={!selectedMail}
                    />
                </div>

                <p className="font-bold tracking-widest text-sidebar sm:hidden">
                    {mobilePane === "list"
                        ? activeFolderLabel.toUpperCase()
                        : composing
                          ? t("app.mail.mobile.newMessage")
                          : t("app.mail.mobile.message")}
                </p>
            </div>

            <div className="flex h-full min-h-0 flex-col sm:flex-row">
                <div className="flex gap-4 overflow-x-auto border-b-2 border-sidebar py-2 sm:flex-col sm:gap-2 sm:overflow-visible sm:border-b-0 sm:pr-4 sm:pt-4">
                    {FOLDERS.map((folder) => (
                        <AppEditable id={folder.labelId} key={folder.key}>
                            <button
                                onClick={() => selectFolder(folder.key)}
                                className={`whitespace-nowrap text-left transition-opacity ${
                                    activeFolder === folder.key
                                        ? "font-bold"
                                        : "opacity-60 hover:opacity-100"
                                }`}
                            >
                                {t(folder.labelId)}
                            </button>
                        </AppEditable>
                    ))}
                </div>

                <div
                    className={`min-h-0 w-full overflow-y-auto border-sidebar sm:block sm:w-80 sm:border-x-2 ${
                        mobilePane === "list" ? "block" : "hidden"
                    }`}
                >
                    <AppEditable id="app.mail.seed">
                        <>
                            {currentMails.map((mail) => (
                                <div key={mail.id} onClick={() => openMessage(mail.id)}> <MailItemComponent
                                        {...mail}
                                        active={openMail === mail.id}   // drop the !composing guard; selection wins now
                                        onDelete={() => handleDelete(activeFolder, mail.id)}
                                    />
                                </div>
                            ))}
                        </>
                    </AppEditable>
                </div>

                {hasDetail && (
                    <div className="min-h-0 flex-grow sm:flex">
                        <div className="min-w-0 flex-grow overflow-y-auto">{renderDetail()}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
