import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

declare module "qrcode-terminal" {
  function generate(code: string, callback?: Function): void;
  function generate(code: string, options: any, callback?: Function): void;
  export = generate;
}

// Para permitir a importação de arquivos SVG
declare module "*.svg" {
  const content: string;
  export default content;
}