import { Trans, useTranslation } from "react-i18next";
import type { ReactElement, ReactNode } from "react";
import { LSC } from "../configs";

type TransValues = { [key: string]: string | number | boolean };

export type UseTransType = {
    // string result (default)
    t: {
        (translationKey: string, values?: TransValues): string;
        // object/array result when returnObjects is set
        <R = unknown>(
            translationKey: string,
            values: TransValues & { returnObjects: true },
        ): R;
    };
    tc: (
        translationKey: string,
        components?: { [key: string]: ReactElement },
        values?: TransValues,
    ) => ReactNode;
};

export const useTrans = (): UseTransType => {
    const { t } = useTranslation();

    const translate = ((
        translationKey: string,
        values: TransValues = {},
    ): string | unknown =>
        localStorage.getItem(LSC.LS_APP_TRANS_DEBUG) === "true"
            ? translationKey
            : t(translationKey, values)) as UseTransType["t"];

    const translateWithComponent = (
        translationKey: string,
        components: Record<string, ReactElement> = {},
        values: TransValues = {},
    ): ReactNode => {
        return localStorage.getItem(LSC.LS_APP_TRANS_DEBUG) === "true" ? (
            translationKey
        ) : (
            <Trans
                i18nKey={translationKey}
                components={{ ...richComponents, ...components }}
                values={values}
            />
        );
    };

    return {
        t: translate,
        tc: translateWithComponent,
    };
};

const underlineCls =
    "group relative cursor-text underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100";

const richComponents: Record<string, ReactElement> = {
    linkTo: <a className={underlineCls} href="#" />,
    hl: <span className={underlineCls} />,
    b: <b />,
};
