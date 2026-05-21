import { useEffect, useRef } from 'react';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

interface Props {
  plyUrl: string;
}

export default function GaussianViewer({ plyUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new GaussianSplats3D.Viewer({
      rootElement: containerRef.current,
      selfDrivenMode: true,
      useBuiltInControls: true,
      sharedMemoryForWorkers: false,
      initialCameraPosition: [0, 1, 4],
      initialCameraLookAt: [0, 0, 0],
    });

    let disposed = false;

    viewer
      .addSplatScene(plyUrl, { splatAlphaRemovalThreshold: 5 })
      .then(() => {
        if (!disposed) viewer.start();
      })
      .catch((err: unknown) => {
        console.error('Gaussian Splats 로드 실패:', err);
      });

    return () => {
      disposed = true;
      try { viewer.dispose(); } catch { /* ignore */ }
    };
  }, [plyUrl]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', background: '#1f2937' }}
    />
  );
}
