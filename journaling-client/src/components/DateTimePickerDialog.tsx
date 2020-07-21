import React from 'react';
import { Dialog, DialogActions, Button } from '@material-ui/core';
import { DateTimePicker } from '@material-ui/pickers';

export interface DateTimePickerDialogProps {
  open: boolean;
  onClose: (date: Date | null) => void;
  value: Date;
}

const DateTimePickerDialog: React.FC<DateTimePickerDialogProps> = ({
  open,
  onClose,
  value,
}) => {
  const [currentValue, setCurrentValue] = React.useState<Date | null>(null);
  React.useEffect(() => setCurrentValue(null), [value]);
  React.useEffect(() => {
    open && setCurrentValue(null);
  }, [open]);
  return (
    <Dialog open={open} onClose={() => onClose(null)}>
      <DateTimePicker
        variant="static"
        value={currentValue || value}
        onChange={(newValue) => setCurrentValue(newValue)}
        showTodayButton={true}
        openTo="hours"
      />
      <DialogActions>
        <Button
          color="primary"
          style={{ marginRight: 'auto' }}
          onClick={() => setCurrentValue(new Date())}
        >
          Now
        </Button>
        <Button color="primary" onClick={() => onClose(null)}>
          Cancel
        </Button>
        <Button color="primary" onClick={() => onClose(currentValue)}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateTimePickerDialog;
