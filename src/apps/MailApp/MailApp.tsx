import { AppIcon } from "../../components";

type mailItem = {
    sender: string;
    subject: string;
    text: string;
};

const MailItem = ({ sender, subject, text }: mailItem) => {
    return (
        <div className="h-full w-full">
            <p className="font-semibold">{sender}</p>
            <p className="font-bold">{subject}</p>
            <p className="font-light">{text}</p>
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
    return (
        <div className="flex h-full w-full flex-col gap-2 bg-[#F5E4C0] px-4 pb-16">
            <div className="flex justify-between border-b-2 border-sidebar py-2">
                <div className="flex gap-4">
                    <AppIcon icon="icn-envelope" className="text-sidebar" />
                    <AppIcon icon="icn-pen" className="text-sidebar" />
                    <AppIcon icon="icn-trash-bin" className="text-sidebar" />
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-col gap-4">
                    <p>Inbox</p>
                    <p>Sent</p>
                    <p>Spam</p>
                    <p>Tash</p>
                </div>
                <div>
                    {initialMailList.map((mail) => (
                        <MailItem
                            key={mail.sender + mail.subject}
                            sender={mail.sender}
                            subject={mail.subject}
                            text={mail.text}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
