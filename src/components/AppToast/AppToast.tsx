import toast from "react-hot-toast";
import { AppIconButton } from "../AppIconButton";

interface ToastProps {
    message: string;
}

export const ErrorToast = ({ message }: ToastProps) => {
    return toast.custom((t) => (
        <div
            className={` ${t.visible ? "animate-custom-enter" : "animate-custom-leave"} pointer-events-auto w-full max-w-md font-mono`}
        >
            <div className="relative flex flex-col gap-2 border-2 border-black bg-[#f4f1ec] px-4 py-3 shadow-[4px_4px_0px_#000]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-black">
                        System Message
                    </span>

                    <AppIconButton icon="icn-close" onClick={() => toast.dismiss(t.id)} />
                </div>

                <div className="h-px w-full bg-black opacity-30" />

                <p className="text-sm leading-relaxed text-black">{message}</p>
            </div>
        </div>
    ));
};
