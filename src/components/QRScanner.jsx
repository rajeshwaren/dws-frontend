import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

function QRScanner({ onScan }) {

    const started = useRef(false);

    useEffect(() => {

        if (started.current) return;
        started.current = true;

        let html5QrCode;

        const startScanner = async () => {

            html5QrCode = new Html5Qrcode("reader");

            const cameras =
                await Html5Qrcode.getCameras();

            await html5QrCode.start(
                cameras[0].id,
                {
                    fps: 10,
                    qrbox: 250
                },
                (decodedText) => {

                    onScan(decodedText);

                    html5QrCode.stop();
                }
            );
        };

        startScanner();

    }, []);

    return <div id="reader"></div>;
}

export default QRScanner;