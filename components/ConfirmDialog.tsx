"use client";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md w-full border-2 border-gray-800">
        <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
        <p className="mb-6 text-lg text-gray-300">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-black text-white border-2 border-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors min-h-[44px]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-white text-black py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

