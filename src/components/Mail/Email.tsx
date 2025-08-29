import { Html, Button } from "@react-email/components";

export const Email = (props) => {
    const { url } = props;

    return (
        <Html lang="en">
            <Button href={url}>Click me</Button>
        </Html>
    );
};
