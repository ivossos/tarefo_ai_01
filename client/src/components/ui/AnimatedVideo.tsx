import { useState, useEffect } from 'react';

interface AnimatedVideoProps {
  src: string;
  width?: string | number;
  height?: string | number;
  loop?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
}

export function AnimatedVideo({
  src,
  width = '100%',
  height = 'auto',
  loop = true,
  autoPlay = true,
  muted = true,
  className = ''
}: AnimatedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isSvg = src.endsWith('.svg');

  useEffect(() => {
    // Reseta quando o src muda
    setIsLoaded(false);
    setError(false);
    
    // Se for um SVG, marcamos como carregado imediatamente
    if (isSvg) {
      setIsLoaded(true);
    }
  }, [src, isSvg]);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ width, height }}>
      {!isLoaded && !error && !isSvg && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
          <div className="animate-pulse h-10 w-10 rounded-full bg-muted"></div>
        </div>
      )}
      
      {error && !isSvg && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 text-muted-foreground">
          <i className="ri-error-warning-line text-2xl mb-2"></i>
          <p className="text-sm">Erro ao carregar vídeo</p>
        </div>
      )}
      
      {isSvg ? (
        <object
          type="image/svg+xml"
          data={src}
          width={width}
          height={height}
          className="w-full h-full"
        >
          <img 
            src={src} 
            alt="Animação SVG" 
            width={width} 
            height={height} 
            className="object-contain w-full h-full" 
          />
        </object>
      ) : (
        <video
          src={src}
          width={width}
          height={height}
          loop={loop}
          autoPlay={autoPlay}
          muted={muted}
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={`object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        />
      )}
    </div>
  );
}