import React from 'react';
import './ImportDialog.css';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  isNewInstallation: boolean;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, isNewInstallation }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>PrismLauncher Import Required</h2>
        </div>
        <div className="modal-body">
          {isNewInstallation ? (
            <p>
              A new PrismLauncher installation has been detected. Please select your language and complete
              the startup screens to continue with the modpack installation.
            </p>
          ) : (
            <p>
              Please click 'OK' in the PrismLauncher import dialog to continue with modpack installation.
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="primary-button">
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;