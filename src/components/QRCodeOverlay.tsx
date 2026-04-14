import React from 'react';
import QRCode from 'qrcode';

interface QRCodeOverlayProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeOverlay: React.FC<QRCodeOverlayProps> = ({ value, size = 80, className = '' }) => {
  const [url, setUrl] = React.useState<string>('');

  React.useEffect(() => {
    QRCode.toDataURL(value, { width: size, margin: 1 }, (err, url) => {
      if (!err && url) setUrl(url);
    });
  }, [value, size]);

  if (!url) return null;
  return (
    <img
      src={url}
      alt="QR Code"
      width={size}
      height={size}
      className={`rounded-lg border border-gray-200 shadow bg-white ${className}`}
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
};
