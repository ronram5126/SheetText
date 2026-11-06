export interface EditorAdapter {
  getValue(): string;
  setValue(value: string): void;
  onSave(value: string): Promise<void> | void;
  // Change detection methods
  getOriginalCanonical(): string;  // Sanitized initial value
  getCurrentCanonical(): string;   // Sanitized current value
  hasChanged(): boolean;           // True if canonicals differ
}

export interface EditorAdapterInit {
  initialValue?: string;
}
