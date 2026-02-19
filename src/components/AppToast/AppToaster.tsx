import { Toaster } from "react-hot-toast";

export const AppToaster = () => {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
                className: "",
                duration: 5000,
                removeDelay: 1000,
                style: {},
                

                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: "green",
                        secondary: "black",
                    }
                }
            }}
        />
    );
};
