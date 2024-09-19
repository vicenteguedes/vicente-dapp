import { useState, FC } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (slippage: bigint) => void;
}

const SettingsDialog: FC<SettingsDialogProps> = ({ open, onClose, onSave }) => {
  const [slippage, setSlippage] = useState<string>("5");

  const handleSave = () => {
    onSave(BigInt(slippage));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="slippage"
          label="Slippage (%)"
          type="number"
          fullWidth
          variant="standard"
          value={slippage}
          onChange={(e) => setSlippage(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
