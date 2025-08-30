import { Slider, SliderRange, SliderThumb, SliderTrack } from "@radix-ui/react-slider";
import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "./assets/slider.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { AppIconButton } from "../../components";

export const PdfViewer = ({ fileName }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1);

    const handleScale = (add: boolean) => {
        if (add) setScale((prev) => prev + 0.5);
        if (!add) setScale((prev) => prev - 0.5);
    };

    const onLoadSuccess = useCallback((pdf: { numPages: number }) => {
        setNumPages(pdf.numPages);
        setPageNumber(1);
    }, []);

    return (
        <div className="mb-6 h-full w-full overflow-auto bg-bg_green pb-4">
            <div className="sticky left-0 top-0 z-[1] mb-3 flex items-center justify-between bg-bg_green px-4 py-2">
                <div className="flex items-center gap-1">
                    <input
                        className="border-0 bg-sidebar bg-opacity-50 text-center"
                        value={pageNumber}
                        size={1}
                        onChange={(e) => {
                            const newNum = Number(e.target.value);
                            if (!newNum || newNum > numPages) return;

                            setPageNumber(newNum);
                        }}
                    />
                    <span>{numPages ? ` / ${numPages}` : ""}</span>
                </div>
                <div className="flex items-center gap-4">
                    <AppIconButton
                        icon="icn-search-plus"
                        onClick={() => handleScale(false)}
                        size="md"
                    />
                    <form className="min-w-[200px]">
                        <Slider
                            className="SliderRoot"
                            defaultValue={[2]}
                            min={0.5}
                            max={4}
                            step={0.25}
                            onValueChange={(e) => setScale(e[0])}
                        >
                            <SliderTrack className="SliderTrack">
                                <SliderRange className="SliderRange" />
                            </SliderTrack>
                            <SliderThumb className="SliderThumb" aria-label="Volume" />
                        </Slider>
                    </form>
                    <AppIconButton
                        icon="icn-search-plus"
                        onClick={() => handleScale(false)}
                        size="md"
                    />
                </div>
            </div>

            <Document
                file={fileName.node.src}
                onLoadSuccess={onLoadSuccess}
                loading={<div>Loading PDF…</div>}
                error={<div>Couldn’t load that PDF.</div>}
                renderMode="canvas"
                scale={scale}
                className={"mx-auto h-fit max-h-full w-fit pb-4"}
            >
                <Page pageNumber={pageNumber} width={800} />
            </Document>
        </div>
    );
};
