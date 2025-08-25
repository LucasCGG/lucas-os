import { useState } from "react";
import { AppIcon, AppIconButton } from "../../components";

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

const MailEntity = ({ sender, subject, text }: mailEntity) => {
    return (
        <div className="h-full w-full px-2 py-4">
            <div className="border-b-2 border-sidebar pb-2">
                <div className="flex gap-1">
                    <p className="font-semibold">To:</p>
                    <p>colaco.lucasgabriel@gmail.com</p>
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold">From:</p>
                    {/*TODO: make this an Editable field */}
                    {sender ? sender : <p>Enter your Email</p>}
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold">Subject: </p>

                    {subject ? subject : <p>Enter the Subject</p>}
                </div>
            </div>
            <div className="py-2">
                {/*TODO: make this an Editable field */}
                <p> Type your message in here :D</p>
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

export const MailApp = () => {
    const [openMail, setOpenMail] = useState<string | null>(null);

    return (
        <div className="flex h-full w-full flex-col gap-0 bg-[#F5E4C0] px-4 pb-16">
            <div className="flex justify-between border-b-2 border-sidebar py-2">
                <div className="flex gap-4">
                    <AppIcon icon="icn-envelope" className="text-sidebar" />
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
                        const mail = initialMailList.find((m) => m.sender + m.subject === openMail);
                        return mail ? (
                            <div className="min-w-80 flex-shrink-0 flex-grow overflow-y-auto p-4">
                                <MailEntity
                                    sender={mail.sender}
                                    subject={mail.subject}
                                    text={mail.text}
                                />
                            </div>
                        ) : null;
                    })()}
            </div>
        </div>
    );
};
