import { useCallback, useEffect, useRef, useState } from "react";
import { AppButton, AppIcon, AppIconButton, Email } from "../../components";
import { Resend } from "resend";

type mailItem = {
    sender: string;
    subject: string;
    text: string;
    onClick?: () => void;
    className?: string;
};

type mailEntity = {
    sender?: string;
    subject?: string;
    text?: string;
    onClick?: () => void;
    className?: string;
};

const MailItem = ({ sender, subject, text, onClick, className }: mailItem) => {
    return (
        <div className={`${className} h-fit w-full px-2 py-4`} onClick={() => onClick?.()}>
            <p className="font-semibold">{sender}</p>
            <p className="line-clamp-1 text-ellipsis font-bold">{subject}</p>
            <p className="line-clamp-1 text-ellipsis font-light">{text}</p>
        </div>
    );
};

const MailObject = ({ sender, subject, text }: mailEntity) => {
    const [value, setValue] = useState<string>(text || "");
    const refTextArea = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        setValue(text || "");
    }, [text]);

    const resizeTextArea = () => {
        const el = refTextArea.current;
        if (!el) return;

        el.style.height = "auto";

        const parent = el.parentElement;
        const max = parent ? parent.clientHeight : Infinity;

        const next = Math.min(el.scrollHeight, max);
        el.style.height = `${next}px`;

        el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    };

    useEffect(resizeTextArea, [value]);

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
    };

    const resend = new Resend("re_dW8ohBHd_DwarrgCsQunL4rD2eHbeJL8R");

    const sendMail = () => {
        console.debug("Test");
        resend.emails.send({
            from: "colaco.lucasgabriel@gmail.com",
            to: "colaco.lucasgabriel@gmail.com",
            subject: "Test Sending mail",
            react: <Email url="lucascolaco.com" />,
        });
    };

    return (
        <div className="flex h-full min-h-0 w-full flex-col px-2 py-4">
            <div className="shrink-0 border-b-2 border-sidebar pb-2">
                <div className="flex gap-1">
                    <p className="font-semibold">To:</p>
                    <p>colaco.lucasgabriel@gmail.com</p>
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold">From:</p>
                    {sender ? sender : <p>Enter your Email</p>}
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold">Subject: </p>
                    {subject ? subject : <p>Enter the Subject</p>}
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden py-2">
                <textarea
                    ref={refTextArea}
                    className="box-border h-auto w-full resize-none border-none bg-inherit outline-none"
                    rows={1}
                    placeholder="Type your Message in here :D"
                    onChange={onChange}
                    value={value}
                    style={{ maxHeight: "100%" }}
                />

                {!sender && !subject && (
                    <div className="flex flex-row gap-2">
                        <AppButton onClick={() => {}} text="Save to Draft" />
                        <AppButton onClick={() => sendMail()} text="Send" />
                    </div>
                )}
            </div>
        </div>
    );
};

const initialMailList: mailItem[] = [
    {
        sender: "Alice Johnson",
        subject: "Welcome to MailApp!",
        text: "We're excited to have you on board. Let us know if you need any help.",
    },
    {
        sender: "Bob Smith",
        subject: "Meeting Reminder",
        text: "Don't forget about our meeting tomorrow at 10am.",
    },
    {
        sender: "Carol Lee",
        subject: "Invoice Attached",
        text: "Please find the invoice attached for your recent purchase.",
    },
];

const newMailKey = "compose-mail";

export const MailApp = () => {
    const [openMail, setOpenMail] = useState<string | null>(null);

    const renderOpenMail = useCallback((mail?: mailItem) => {
        return (
            <div className="min-w-80 flex-shrink-0 flex-grow overflow-y-auto p-4">
                <MailObject sender={mail?.sender} subject={mail?.subject} text={mail?.text} />
            </div>
        );
    }, []);

    return (
        <div className="flex h-full w-full flex-col gap-0 bg-[#F5E4C0] px-4 pb-16">
            <div className="flex justify-between border-b-2 border-sidebar py-2">
                <div className="flex gap-4">
                    <AppIconButton
                        icon="icn-envelope"
                        variant="ghost"
                        size="md"
                        className="cursor-hand text-sidebar"
                        onClick={() => setOpenMail(newMailKey)}
                    />
                    <AppIcon icon="icn-pen" className="text-sidebar" />
                    <AppIcon icon="icn-trash-bin" className="text-sidebar" />
                </div>
            </div>
            <div className="flex h-full gap-0">
                <div className="flex-col gap-4 pr-4 pt-2">
                    <p>Inbox</p>
                    <p>Sent</p>
                    <p>Spam</p>
                    <p>Trash</p>
                </div>

                <div className="flex-shrink-1 h-full overflow-y-auto border-x-2 border-sidebar">
                    {initialMailList.map((mail) => (
                        <MailItem
                            key={mail.sender + mail.subject}
                            sender={mail.sender}
                            subject={mail.subject}
                            text={mail.text}
                            onClick={() => setOpenMail(mail.sender + mail.subject)}
                            className="border-b-2 border-sidebar"
                        />
                    ))}
                </div>

                {openMail &&
                    (() => {
                        const newMail = openMail === newMailKey;
                        if (newMail) {
                            return renderOpenMail();
                        }
                        const mail = initialMailList.find((m) => m.sender + m.subject === openMail);
                        if (mail) {
                            return renderOpenMail(mail);
                        }
                        return;
                    })()}
            </div>
        </div>
    );
};
