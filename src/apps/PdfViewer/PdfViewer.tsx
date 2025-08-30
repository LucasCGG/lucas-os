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

export const PdfViewer = ({ fileName = "CV_Lucas_Colaco.pdf" }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1);

    const handleScale = (direction: boolean) => {
        if (direction) setScale((prev) => prev + 0.5);
        if (!direction) setScale((prev) => prev - 0.5);
    };

    const onLoadSuccess = useCallback((pdf: { numPages: number }) => {
        setNumPages(pdf.numPages);
        setPageNumber(1);
    }, []);

    const fileUrl = `/assets/pdfs/${fileName}`;

    return (
        <div className="mb-6 h-full w-full overflow-auto bg-bg_green pb-4">
            <div className="sticky top-1 z-[1] mb-3 flex items-center justify-between bg-bg_green px-4 py-2">
                <div className="flex gap-4">
                    <button
                        onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                        disabled={pageNumber <= 1}
                    >
                        ◀ Prev
                    </button>
                    <span>
                        Page {Math.max(1, pageNumber)}
                        {numPages ? ` / ${numPages}` : ""}
                    </span>
                    <button
                        onClick={() => setPageNumber((p) => Math.min(numPages || p + 1, p + 1))}
                        disabled={!numPages || pageNumber >= numPages}
                    >
                        Next ▶
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => handleScale(false)}>Minus</button>
                    <form className="w-[200px]">
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
                    <button onClick={() => handleScale(true)}>Plus</button>
                </div>
            </div>

            <Document
                file={fileUrl}
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
