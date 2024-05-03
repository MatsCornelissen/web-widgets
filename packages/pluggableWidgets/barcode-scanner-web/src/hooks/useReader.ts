import { useEffect, useRef, RefObject } from "react";
import {
    BarcodeFormat,
    BinaryBitmap,
    BrowserMultiFormatReader,
    DecodeHintType,
    HTMLCanvasElementLuminanceSource,
    HybridBinarizer,
    NotFoundException,
    Result
} from "@zxing/library";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { BarcodeFormatsType } from "../../typings/BarcodeScannerProps";

const mediaStreamConstraints: MediaStreamConstraints = {
    audio: false,
    video: {
        facingMode: "environment",
        width: { min: 1280, ideal: 1920, max: 2560 },
        height: { min: 720, ideal: 1080, max: 1440 }
    }
};

type UseReaderHook = (args: {
    onSuccess?: (data: string) => void;
    onError?: (e: Error) => void;
    useCrop: boolean;
    barcodeFormats?: BarcodeFormatsType[];
    useAllFormats: boolean;
}) => RefObject<HTMLVideoElement>;

export const useReader: UseReaderHook = args => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const onSuccess = useEventCallback(args.onSuccess);
    const onError = useEventCallback(args.onError);
    const stopped = useRef<boolean>(false);
    const checkNotFound = (error: any): boolean => {
        const ifNotFound = error instanceof NotFoundException;
        return ifNotFound && !stopped.current;
    };

    const scanWithCropOnce = (reader: BrowserMultiFormatReader): Promise<Result> => {
        const element = document.getElementById("canvas-middle-middle")!;

        const cropWidth = element.clientWidth;
        const cropHeight = element.clientHeight;

        const captureCanvas = reader.createCaptureCanvas(videoRef.current!);

        const aspectRatioWidth = videoRef.current!.clientWidth / videoRef.current!.clientHeight;
        const widthHeigher = videoRef.current!.videoWidth > videoRef.current!.videoHeight;

        let videoCropWidth = (cropWidth / videoRef.current!.clientWidth) * videoRef.current!.videoWidth;
        let videoCropHeight = (cropHeight / videoRef.current!.clientHeight) * videoRef.current!.videoHeight;
        captureCanvas.width = videoCropWidth;
        captureCanvas.height = videoCropWidth;
        if (widthHeigher) {
            videoCropWidth = videoCropWidth / aspectRatioWidth;
        } else {
            videoCropHeight = videoCropWidth;
        }
        const loop = (resolve: (value: Result) => void, reject: (reason?: Error) => void): void => {
            try {
                const canvasContext = captureCanvas.getContext("2d", { willReadFrequently: true });
                if (canvasContext !== null) {
                    canvasContext.drawImage(
                        videoRef.current!,
                        (videoRef.current!.videoWidth - videoCropWidth) / 2,
                        (videoRef.current!.videoHeight - videoCropHeight) / 2,
                        videoCropWidth,
                        videoCropHeight,
                        0,
                        0,
                        videoCropWidth,
                        videoCropHeight
                    );
                    const luminanceSource = new HTMLCanvasElementLuminanceSource(captureCanvas);
                    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
                    const result = reader.decodeBitmap(binaryBitmap);
                    resolve(result);
                }
            } catch (error) {
                if (checkNotFound(error)) {
                    setTimeout(() => loop(resolve, reject), 50);
                } else {
                    reject(error);
                }
            }
        };
        return new Promise(loop);
    };

    useEffect(() => {
        const hints = new Map();
        let formats: BarcodeFormat[] = [];
        if (args.useAllFormats) {
            formats = [
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
                BarcodeFormat.EAN_8,
                BarcodeFormat.EAN_13,
                BarcodeFormat.CODE_39,
                BarcodeFormat.CODE_128,
                BarcodeFormat.ITF,
                BarcodeFormat.RSS_14,
                BarcodeFormat.QR_CODE,
                BarcodeFormat.DATA_MATRIX,
                BarcodeFormat.AZTEC,
                BarcodeFormat.PDF_417
            ];
        } else {
            formats = args.barcodeFormats!.map(val => BarcodeFormat[val.barcodeFormat]);
        }
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        const reader = new BrowserMultiFormatReader(hints, 500);

        const stop = (): void => {
            stopped.current = true;
            reader.stopAsyncDecode();
            reader.reset();
        };

        const start = async (): Promise<void> => {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
                if (videoRef.current) {
                    let result: Result;
                    if (args.useCrop) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.autofocus = true;
                        videoRef.current.playsInline = true; // Fix error in Safari
                        await videoRef.current.play();
                        result = await scanWithCropOnce(reader);
                    } else {
                        result = await reader.decodeOnceFromStream(stream, videoRef.current);
                    }
                    if (!stopped.current) {
                        onSuccess(result.getText());
                    }
                }
            } catch (error) {
                // Suppress not found error if widget is closed normally (eg. leaving page);
                if (!checkNotFound(error)) {
                    if (error instanceof Error) {
                        console.error(error.message);
                    }
                    if (onError) {
                        onError(error);
                    }
                }
            } finally {
                stop();
                stream?.getVideoTracks().forEach(track => track.stop());
            }
        };

        start();

        return stop;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return videoRef;
};
