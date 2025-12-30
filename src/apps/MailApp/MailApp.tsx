import { useCallback, useEffect, useRef, useState } from "react";
import { AppButton, AppIcon, AppIconButton } from "../../components";
import emailjs from "@emailjs/browser";

type MailItem = {
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

const MailItemComponent = ({ sender, subject, text }: MailItem) => {
    return (
        <div className="h-fit w-full border-b-2 border-sidebar px-2 py-4">
            <p className="font-semibold">{sender}</p>
            <p className="line-clamp-1 font-bold">{subject}</p>
            <p className="line-clamp-1 font-light">{text}</p>
        </div>
    );
};

const MailObject = ({ sender, subject, text }: MailEntity) => {
    const [from, setFrom] = useState(sender ?? "");
    const [mailSubject, setMailSubject] = useState(subject ?? "");
    const [message, setMessage] = useState(text ?? "");
    const [sending, setSending] = useState(false);

    const refTextArea = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        setFrom(sender ?? "");
        setMailSubject(subject ?? "");
        setMessage(text ?? "");
    }, [sender, subject, text]);

    useEffect(() => {
        const el = refTextArea.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [message]);

    const sendMail = async () => {
        if (!from || !mailSubject || !message) {
            alert("Please fill out all fields");
            return;
        }

        try {
            setSending(true);

            await emailjs.send(serviceId, templateId, {
                from_email: from,
                from_name: from,
                to_email: "colaco.lucasgabriel@gmail.com",
                subject: mailSubject,
                message,
            });

            alert("Message sent successfully");

            setFrom("");
            setMailSubject("");
            setMessage("");
        } catch (err) {
            console.error(err);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-full w-full flex-col px-4 py-4">
            <div className="space-y-2 border-b-2 border-sidebar pb-4">
                <div className="flex items-center gap-2">
                    <p className="font-semibold">To:</p>
                    <p>colaco.lucasgabriel@gmail.com</p>
                </div>

                <div className="flex items-center gap-2">
                    <p className="font-semibold">From:</p>
                    <input
                        type="email"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 bg-transparent outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <p className="font-semibold">Subject:</p>
                    <input
                        type="text"
                        value={mailSubject}
                        onChange={(e) => setMailSubject(e.target.value)}
                        placeholder="Subject"
                        className="flex-1 bg-transparent outline-none"
                    />
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 py-4">
                <textarea
                    ref={refTextArea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full resize-none bg-transparent outline-none"
                    rows={1}
                />

                <div className="flex gap-2">
                    <AppButton
                        onClick={sendMail}
                        text={sending ? "Sending..." : "Send"}
                        disabled={sending}
                    />
                </div>
            </div>
        </div>
    );
};

const initialMailList: MailItem[] = [
    {
        sender: "Alice Johnson",
        subject: "Welcome to MailApp!",
        text: "We're excited to have you on board.",
    },
    {
        sender: "Bob Smith",
        subject: "Meeting Reminder",
        text: "Don't forget about our meeting tomorrow.",
    },
    {
        sender: "Carol Lee",
        subject: "Invoice Attached",
        text: "Please find the invoice attached.",
    },
];

const NEW_MAIL_KEY = "compose";

export const MailApp = () => {
    const [openMail, setOpenMail] = useState<string | null>(NEW_MAIL_KEY);

    const renderOpenMail = useCallback((mail?: MailItem) => {
        return (
            <div className="min-w-80 flex-grow overflow-y-auto">
                <MailObject sender={mail?.sender} subject={mail?.subject} text={mail?.text} />
            </div>
        );
    }, []);

    return (
        <div className="flex h-full w-full flex-col bg-[#F5E4C0] px-4 pb-16">
            <div className="flex justify-between border-b-2 border-sidebar py-2">
                <div className="flex gap-4">
                    <AppIconButton
                        icon="icn-envelope"
                        variant="ghost"
                        size="md"
                        className="text-sidebar"
                        onClick={() => setOpenMail(NEW_MAIL_KEY)}
                    />
                    <AppIcon icon="icn-pen" className="text-sidebar" />
                    <AppIcon icon="icn-trash-bin" className="text-sidebar" />
                </div>
            </div>

            <div className="flex h-full">
                <div className="space-y-2 pr-4 pt-4">
                    <p>Inbox</p>
                    <p>Sent</p>
                    <p>Spam</p>
                    <p>Trash</p>
                </div>

                <div className="w-80 overflow-y-auto border-x-2 border-sidebar">
                    {initialMailList.map((mail) => (
                        <div
                            key={mail.sender + mail.subject}
                            onClick={() => setOpenMail(mail.sender + mail.subject)}
                        >
                            <MailItemComponent {...mail} />
                        </div>
                    ))}
                </div>

                {openMail === NEW_MAIL_KEY
                    ? renderOpenMail()
                    : renderOpenMail(
                          initialMailList.find((m) => m.sender + m.subject === openMail)
                      )}
            </div>
        </div>
    );
};
