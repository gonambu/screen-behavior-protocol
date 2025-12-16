import Chip from '@mui/material/Chip';
import { DataItemStatus, DataItemStatusLabels } from '../types';

interface StatusChipProps {
  status: DataItemStatus;
}

const statusColorMap: Record<DataItemStatus, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
};

export default function StatusChip({ status }: StatusChipProps) {
  return (
    <Chip
      label={DataItemStatusLabels[status]}
      color={statusColorMap[status]}
      size="small"
    />
  );
}
