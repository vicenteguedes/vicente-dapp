interface Window {
  ethereum: {
    isMetaMask?: boolean;
    request: (args: { method: string }) => Promise<any>;
    on?: (event: string, handler: (...args: any[]) => void) => void;
  };
}
