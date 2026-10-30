export interface EditorAdapter {
  getValue(): string;
  setValue(value: string): void;
  onSave(value: string): Promise<void> | void;
}

export interface EditorAdapterInit {
  initialValue?: string;
}
